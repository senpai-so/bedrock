import type { NextApiRequest, NextApiResponse } from 'next'

import { MnemonicKey, MsgExecuteContract } from '@terra-money/terra.js'

import { getLCD } from '../../lib/utils/terra'
import { mnemonic, ownerAddress, contractAddress } from '../../lib/config'
import { toULuna } from '../../lib/utils/currency'

import { PrismaClient } from '@prisma/client'
import pickRandom from 'pick-random'
import { NftToken } from '../../lib/types'

const prisma = new PrismaClient()

export type MintResponse = {
  success: boolean
  tokenId?: string | null
  error?: string
}

async function get_random_non_minted_nft() {
  const tokensAvailable: NftToken[] = (await prisma.nftToken.findMany({
    where: { is_minted: false },
    select: { id: true }
  })) as NftToken[]

  const random_token = pickRandom(tokensAvailable)[0]
  const full_token = await prisma.nftToken.findUnique({
    where: { id: random_token.id },
    include: {
      attributes: {
        select: { trait_type: true, value: true }
      }
    }
  })
  return full_token
}

async function save_mint_to_db(tokenId?: string) {
  if (tokenId) {
    await prisma.nftToken.update({
      where: { token_id: tokenId },
      data: { is_minted: true }
    })
  }
  return
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MintResponse>
) {
  if (req.method === 'POST') {
    const { buyer } = req.body

    if (!mnemonic) {
      console.log('Environment variable `SIGNER_WALLET_MNEMONIC` is not set')

      res.status(500).json({
        success: false,
        error: 'Service down for maintenance. Please try again later.'
      })

      return
    }

    const token = await get_random_non_minted_nft()

    const lcd = await getLCD()
    const mk = new MnemonicKey({ mnemonic })
    const signer = lcd.wallet(mk)

    console.log('ownerAddress', ownerAddress)
    console.log('contractAddress', contractAddress)

    const msg = new MsgExecuteContract(ownerAddress, contractAddress, {
      mint: {
        token_id: token?.token_id,
        owner: buyer,
        name: token?.name,
        description: token?.description,
        image: token?.image_uri,
        extension: {
          name: token?.name,
          image: token?.image_uri,
          description: token?.description,
          attributes: token?.attributes
        }
      }
    })

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
    try {
      const result = await lcd.tx.broadcast(tx)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: String(error)
      })
      return
    }

    res.status(200).json({ success: true, tokenId: token?.token_id })

    await save_mint_to_db(token?.token_id)

    return
  }

  // catch-all
  res.status(404).json({ success: false, error: 'NOT FOUND' })
  prisma.$disconnect()
  return
}
