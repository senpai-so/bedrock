import type { NextApiRequest, NextApiResponse } from 'next'

import { MnemonicKey, MsgExecuteContract } from '@terra-money/terra.js'

import { getLCD } from '../../lib/utils/terra'
import { mnemonic, ownerAddress, contractAddress } from '../../lib/config'
import { toULuna } from '../../lib/utils/currency'

import prisma from '../../lib/prisma'
import pickRandom from 'pick-random'

type SwapResponse = {
  success: boolean
  error?: string
}

// Prisma schema
interface NftTokens {
  id: number
  token_id: string
  name: string
  description: string
  extension_name: string
  extension_image: string
  image_uri: string
  isMinted: () => boolean
}

async function get_random_non_minted_nft() {
  const tokensAvailable: NftTokens[] = (await prisma.nftTokens.findMany({
    where: { isMinted: false },
    select: { id: true }
  })) as NftTokens[]

  const random_token = pickRandom(tokensAvailable)[0]
  const full_token = await prisma.nftTokens.findUnique({
    where: { id: random_token.id }
  })
  return full_token
}

async function save_mint_to_db(token_id?: string) {
  if (token_id) {
    await prisma.nftTokens.update({
      where: { token_id: token_id },
      data: { isMinted: true }
    })
  }
  return
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SwapResponse>
) {
  if (req.method === 'POST') {
    const { buyer } = req.body
    console.log('buyer in mint post', buyer)

    if (!mnemonic) {
      console.log('Environment variable `SIGNER_WALLET_MNEMONIC` is not set')

      res.status(500).json({
        success: false,
        error: 'Service down for maintenance. Please try again later.'
      })

      return
    }

    const token = await get_random_non_minted_nft()

    console.log(token)
    const lcd = await getLCD()
    const mk = new MnemonicKey({ mnemonic })
    const signer = lcd.wallet(mk)
    console.log(signer)

    console.log('ownerAddress', ownerAddress)
    console.log('contractAddress', contractAddress)

    const msg = new MsgExecuteContract(
      ownerAddress,
      contractAddress,
      {
        mint: {
          token_id: token?.token_id,
          owner: buyer,
          name: token?.name,
          description: token?.description,
          image: token?.image_uri,
          extension: {
            name: token?.extension_name,
            image: token?.extension_image
          }
        }
      },
      // TODO use the correct gas price
      { uluna: toULuna(1) }
    )

    console.log(msg)

    // mint part
    const tx = await signer
      .createAndSignTx({
        msgs: [msg]
      })
      .catch((error: unknown) => {
        console.log('Error creating and signing transaction')
        console.log(error)
        throw error
      })

    console.log('mint tx', tx)
    const result = await lcd.tx.broadcast(tx)
    console.log(result)

    res.status(200).json({ success: true })

    await save_mint_to_db(token?.token_id)

    return
  }

  // catch-all
  res.status(404).json({ success: false, error: 'NOT FOUND' })
  return
}
