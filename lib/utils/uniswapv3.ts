import { AlphaRouter } from '@uniswap/smart-order-router'
import { Token, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import { Percent } from '@uniswap/sdk-core'
import { parseUnits } from '@ethersproject/units'

import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { ethers } from 'ethers'

const V3_SWAP_ROUTER_ADDRESS = '0x075B36dE1Bd11cb361c5B3B1E80A9ab0e7aa8a60'
const MY_ADDRESS = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'

const ChainId_MAINNET = 1

const WETH = new Token(
  ChainId_MAINNET,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
  'WETH',
  'Wrapped Ether'
)

const USDC = new Token(
  ChainId_MAINNET,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  6,
  'USDC',
  'USD//C'
)

export async function makeTradeToV3(
  provider: ethers.providers.Web3Provider,
  recipient: string
) {
  const router = new AlphaRouter({ chainId: 1, provider: provider })

  const value = '0.01'
  const currency = WETH

  const typedValueParsed = parseUnits(value, currency.decimals).toString()

  const wethAmount = CurrencyAmount.fromRawAmount(
    currency,
    JSBI.BigInt(typedValueParsed).toString()
  )
  // JSBI.BigInt(typedValueParsed));

  const route = await router.route(wethAmount, USDC, TradeType.EXACT_INPUT, {
    recipient: recipient,
    slippageTolerance: new Percent(50, 100),
    deadline: Math.floor(Date.now() / 1000) + 60 * 20
  })

  if (!route) {
    console.log('No route found')
    return
  }

  console.log(`Quote Exact In: ${route.quote.toFixed(2)}`)
  console.log(`Gas Adjusted Quote In: ${route.quoteGasAdjusted.toFixed(2)}`)
  console.log(`Gas Used USD: ${route.estimatedGasUsedUSD.toFixed(6)}`)

  if (route.methodParameters?.calldata && route.methodParameters?.value) {
    const transaction = {
      data: route.methodParameters?.calldata,
      to: V3_SWAP_ROUTER_ADDRESS,
      value: BigNumber.from(route.methodParameters?.value),
      from: MY_ADDRESS,
      gasPrice: BigNumber.from(route.gasPriceWei)
    }
    console.log('Awaiting transaction...')
    const signer = provider.getSigner()
    const res = await signer.sendTransaction(transaction)
    console.log(res)
    console.log('Finished!')
  } else {
    console.log('Malformed route object')
  }
}
