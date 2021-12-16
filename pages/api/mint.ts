import type { NextApiRequest, NextApiResponse } from 'next'

import {
  LCDClient,
  MnemonicKey,
  MsgExecuteContract,
  Coins
} from '@terra-money/terra.js'

import { getLCD } from '../../lib/utils/terra'
import { mnemonic, ownerAddress, contractAddress } from '../../lib/config'
import { toULuna } from '../../lib/utils/currency'

type SwapResponse = {
  success: boolean
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SwapResponse>
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

    const lcd = await getLCD()
    const mk = new MnemonicKey({ mnemonic })
    const signer = lcd.wallet(mk)

    const msg = new MsgExecuteContract(
      ownerAddress,
      contractAddress,
      {
        mint: {
          token_id: 'TRIPPYDIPPY',
          owner: buyer,
          name: 'TrippyDippy',
          description: 'A Dude',
          image: 'http://localhost:3000/loonies/TrippyDippy.jpeg',
          extension: {
            name: 'TrippyDippy',
            image: 'http://localhost:3000/loonies/TrippyDippy.jpeg'
          }
        }
      },
      // TODO use the correct gas price
      { uluna: toULuna(1) }
    )

    // mint part
    const tx = await signer.createAndSignTx({
      msgs: [msg]
    })

    console.log('mint tx', tx)
    const result = await lcd.tx.broadcast(tx)
    console.log(result)

    res.status(200).json({ success: true })
  }

  // catch-all
  res.status(404).json({ success: false, error: 'NOT FOUND' })
}
