import { ethers } from 'ethers'

import type { NextApiRequest, NextApiResponse } from 'next'

type SwapResponse = {
  success: boolean
  error?: string
}

const endpoint = 'https://rinkeby.infura.io/v3/df93856f8d2b4358ac4c0c5b572c14fc'

const daiContractAddress = '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735'

const daiContractAbi = [
  'function approve(address _spender, uint256 _value) public returns (bool success)'
]

function getInfuraProvider() {
  const provider = new ethers.providers.JsonRpcProvider(endpoint)
  return provider
}

function getWallet(pkey: string) {
  const provider = getInfuraProvider()
  const wallet = new ethers.Wallet(pkey, provider)
  return wallet
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SwapResponse>
) {
  if (req.method === 'POST') {
    const { amount } = req.body

    const signerWalletPK = process.env.SIGNER_WALLET_PK || ''

    if (!signerWalletPK) {
      console.log('Environment variable `SIGNER_WALLET_PK` is not set')

      res.status(500).json({
        success: false,
        error: 'Service down for maintenance. Please try again later.'
      })

      return
    }

    const signerWallet = getWallet(signerWalletPK)
    const contract = new ethers.Contract(
      daiContractAddress,
      daiContractAbi,
      signerWallet
    )

    const amountInUnits = ethers.utils.parseUnits(amount.toString(), 18)
    await contract.approve(daiContractAddress, amountInUnits)

    res.status(200).json({ success: true })
  }

  // catch-all
  res.status(404).json({ success: false, error: 'NOT FOUND' })
}
