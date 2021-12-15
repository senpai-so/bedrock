import { ethers } from 'ethers'

import { Pool } from '@uniswap/v3-sdk'
import {
  CurrencyAmount,
  Token,
  TradeType,
  Price,
  Percent
} from '@uniswap/sdk-core'

import * as UniswapV3PoolContract from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import * as UniswapV2RouterContract from 'lib/build/UniswapV2Router02.json'
import * as QuoterContract from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import * as UniContract from 'lib/build/Uni.json'

import { Route } from '@uniswap/v3-sdk'
import { Trade } from '@uniswap/v3-sdk'

const IUniswapV3PoolABI = UniswapV3PoolContract.abi
const UniswapV2RouterABI = UniswapV2RouterContract.abi
const QuoterABI = QuoterContract.abi
const UniABI = (UniContract as any).abi

// PROD
const prodEndpoint =
  'https://mainnet.infura.io/v3/df93856f8d2b4358ac4c0c5b572c14fc'

const prodProvider = new ethers.providers.JsonRpcProvider(prodEndpoint)

// USDC-WETH pool address on mainnet for fee tier 0.05%
const poolAddressUSDCToWETH = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'
const poolAddressOHMToUSDC = '0x6934290e0f75f64b83c3f473f65aefe97807103b'
const poolAddressOHMToETH = '0xf1b63cd9d80f922514c04b0fd0a30373316dd75b'
const poolAddressDaiToEth = '0x60594a405d53811d3bc4766596efd80fd545a270'
const poolAddress = '0x60594a405d53811d3bc4766596efd80fd545a270'

const poolContract = new ethers.Contract(
  poolAddressDaiToEth,
  IUniswapV3PoolABI,
  prodProvider
)

const ohmToUSDCPoolContract = new ethers.Contract(
  poolAddressOHMToUSDC,
  IUniswapV3PoolABI,
  prodProvider
)

const ethToLunaContract = new ethers.Contract(
  '0x16b70f44719b227278a2dc1122e8106cc929ecd1',
  IUniswapV3PoolABI,
  prodProvider
)

// Quoter contract address on mainnet
const quoterAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
const quoterContract = new ethers.Contract(
  quoterAddress,
  QuoterABI,
  prodProvider
)

// Gas estimator address on mainnet
const uniAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
const uniContract = new ethers.Contract(uniAddress, UniABI, prodProvider)

// TESTNET: RINKEBY
const RINKEBY_NETWORK_ID = 4

const WETH_DECIMALS = 18

const USDC_DECIMALS = 6

const DAI_DECIMALS = 18

const endpoint = 'https://rinkeby.infura.io/v3/df93856f8d2b4358ac4c0c5b572c14fc'

const provider = new ethers.providers.JsonRpcProvider(endpoint)

//   Below, we use the testnet for actual transactions

// Router contract address on testnet
function getRouterContract(signer: ethers.Signer) {
  const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
  const routerContract = new ethers.Contract(
    routerAddress,
    UniswapV2RouterABI,
    signer
  )

  return routerContract
}

function getWallet(pkey: string) {
  const wallet = new ethers.Wallet(pkey, provider)
  return wallet
}

interface Immutables {
  factory: string
  token0: string
  token1: string
  fee: number
  tickSpacing: number
  maxLiquidityPerTick: ethers.BigNumber
}

interface State {
  liquidity: ethers.BigNumber
  sqrtPriceX96: ethers.BigNumber
  tick: number
  observationIndex: number
  observationCardinality: number
  observationCardinalityNext: number
  feeProtocol: number
  unlocked: boolean
}

async function getPoolImmutables(aPoolContract?: ethers.Contract) {
  const contract = aPoolContract || poolContract

  const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
    await Promise.all([
      contract.factory(),
      contract.token0(),
      contract.token1(),
      contract.fee(),
      contract.tickSpacing(),
      contract.maxLiquidityPerTick()
    ])

  const immutables: Immutables = {
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick
  }
  return immutables
}

async function getPoolState(aPoolContract?: ethers.Contract) {
  // note that data here can be desynced if the call executes over the span of two or more blocks.
  const contract = aPoolContract || poolContract

  const [liquidity, slot] = await Promise.all([
    contract.liquidity(),
    contract.slot0()
  ])

  const PoolState: State = {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6]
  }

  return PoolState
}

// test with DAI-ETH
export async function makeTradeToRinkeby(
  amount: number,
  recipient: string,
  aSigner: ethers.Signer
) {
  // Estimate prices in prod
  const [immutables, state] = await Promise.all([
    getPoolImmutables(),
    getPoolState()
  ])

  const DAI = new Token(1, immutables.token0, 18, 'USDC', 'USD Coin')
  const WETH = new Token(1, immutables.token1, 18, 'WETH', 'Wrapped Ether')

  const pool = new Pool(
    DAI,
    WETH,
    immutables.fee,
    //note the description discrepancy - sqrtPriceX96 and sqrtRatioX96
    // are interchangable values
    state.sqrtPriceX96.toString(),
    state.liquidity.toString(),
    state.tick
  )

  // convert to the correct units for USDC / DAI
  const amountIn = ethers.utils.parseUnits(amount.toString(), DAI_DECIMALS)

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    immutables.token0,
    immutables.token1,
    immutables.fee,
    amountIn.toString(),
    0
  )

  // create an instance of the route object in order to construct a trade object
  const swapRoute = new Route([pool], DAI, WETH)

  // create an unchecked trade instance
  const trade = await Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(DAI, amountIn.toString()),
    outputAmount: CurrencyAmount.fromRawAmount(
      WETH,
      quotedAmountOut.toString()
    ),
    tradeType: TradeType.EXACT_INPUT
  })

  const getPathFromRoute = (route: Route<Token, Token>) => {
    return [route.tokenPath[0].address, route.tokenPath[1].address]
  }

  const getRouteFromTrade = (
    trade: Trade<Token, Token, TradeType.EXACT_INPUT>
  ) => {
    return trade.swaps[0].route
  }

  console.log(
    'The unchecked trade object is',
    getPathFromRoute(getRouteFromTrade(trade))
  )

  // Use Testnet to make transaction
  // Here, assume USD amount is in DAI
  const WETH_ADDRESS_RINKEBY = '0xc778417E063141139Fce010982780140Aa0cD5Ab'
  const DAI_ADDRESS_RINKEBY = '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735'

  const newpath = [DAI_ADDRESS_RINKEBY, WETH_ADDRESS_RINKEBY]
  const daiAmount = ethers.utils.parseUnits(amount.toString(), DAI_DECIMALS)
  // const ethAmount = ethers.utils.parseEther('0.01')
  // const ethAmount = ethers.utils.parseUnits(amount.toString(), WETH_DECIMALS)

  const nowInSeconds = Math.floor(Date.now() / 1000)
  const expiryDate = nowInSeconds + 9000

  const routerContract = getRouterContract(aSigner)

  console.log('daiAmount', daiAmount)
  console.log('recipient', recipient)

  const txn = await routerContract.swapExactTokensForTokens(
    daiAmount,
    0,
    newpath,
    recipient,
    expiryDate,
    // input gas price bc testnet
    {
      gasLimit: 1000000,
      gasPrice: ethers.utils.parseUnits('10', 'gwei')
    }
  )

  console.log('txn', txn)
  const tx = await txn.wait()
  return tx
}

export async function makeTradeTo(
  amount: number,
  recipient: string,
  aSigner: ethers.Signer
) {
  // PROD
  const [immutables, state] = await Promise.all([
    getPoolImmutables(),
    getPoolState()
  ])

  // const OHM = new Token(1, immutables.token0, 9, 'OHM', 'OlympusDAO tokens')
  // const USDC = new Token(1, immutables.token1, 6, 'USDC', 'USD Coins')
  const DAI = new Token(1, immutables.token0, 6, 'USDC', 'USD Coin')

  const WETH = new Token(1, immutables.token1, 18, 'WETH', 'Wrapped Ether')

  const pool = new Pool(
    USDC,
    WETH,
    immutables.fee,
    //note the description discrepancy - sqrtPriceX96 and sqrtRatioX96
    // are interchangable values
    state.sqrtPriceX96.toString(),
    state.liquidity.toString(),
    state.tick
  )

  // convert to the correct units for USDC / DAI
  const amountIn = ethers.utils.parseUnits(amount.toString(), USDC_DECIMALS)

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    immutables.token0,
    immutables.token1,
    immutables.fee,
    amountIn.toString(),
    0
  )

  // // // create an instance of the route object in order to construct a trade object
  const swapRoute = new Route([pool], USDC, OHM)

  // // // create an unchecked trade instance
  const trade = await Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(USDC, amountIn.toString()),
    outputAmount: CurrencyAmount.fromRawAmount(OHM, quotedAmountOut.toString()),
    tradeType: TradeType.EXACT_INPUT
  })

  // // // print the quote and the unchecked trade instance in the console
  // console.log('The quoted amount out is', quotedAmountOut.toString())
  // console.log('The unchecked trade object is', trade)

  // const slippageTolerance = new Percent('1500', '10000') // 1500 bips, or 15.0%

  const getPathFromRoute = (route: Route<Token, Token>) => {
    return [route.tokenPath[0].address, route.tokenPath[1].address]
  }

  const getRouteFromTrade = (
    trade: Trade<Token, Token, TradeType.EXACT_INPUT>
  ) => {
    return trade.swaps[0].route
  }

  console.log(
    'The unchecked trade object is',
    getPathFromRoute(getRouteFromTrade(trade))
  )

  // // call contract to execute swap
  // // const amountInTrade = trade.inputAmount.numerator.toString()
  // const amountOutMin = trade
  //   .minimumAmountOut(slippageTolerance)
  //   .numerator.toString() // needs to be converted to e.g. hex
  // // const path = [WETH[DAI.chainId].address, DAI.address]
  // const path = getPathFromRoute(trade.swaps[0].route)
  const to = recipient // should be a checksummed recipient address
  // const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
  // // const value = trade.inputAmount.numerator // needs to be converted to e.g. hex

  // // sign with our wallet
  // const wallet = getWallet(
  //   'cd9d1ceb43a5a4ae94d8824f8d617fb8855bc160a8cd78e602bdcd89dcaf8b32'
  // )

  // console.log(amountIn, amountOutMin, path, to, deadline)

  const routerContract = getRouterContract(aSigner)

  // TESTNET
  // Let's try this iteration - also works!
  // const WETH_ADDRESS = '0xc778417E063141139Fce010982780140Aa0cD5Ab'
  // const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'

  // const newpath = [WETH_ADDRESS, UNI_ADDRESS]
  // const ethAmount = ethers.utils.parseEther('0.025')

  // const nowInSeconds = Math.floor(Date.now() / 1000)
  // const expiryDate = nowInSeconds + 9000

  // const txn = await routerContract.swapExactTokensForTokens(
  //   ethAmount,
  //   0,
  //   newpath,
  //   to,
  //   expiryDate,
  //   {
  //     gasLimit: 1000000,
  //     gasPrice: ethers.utils.parseUnits('300', 'gwei')
  //   }
  // )

  // const WETH_ADDRESS = '0xc778417E063141139Fce010982780140Aa0cD5Ab'
  // const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
  // const newpath = [WETH_ADDRESS, UNI_ADDRESS]

  const path = getPathFromRoute(getRouteFromTrade(trade))
  const ethAmount = ethers.utils.parseEther('0.1')
  const nowInSeconds = Math.floor(Date.now() / 1000)
  const expiryDate = nowInSeconds + 9000

  const txn = await routerContract.swapExactETHForTokens(
    amountIn.toString(),
    0,
    path,
    to,
    expiryDate,
    {
      // gasLimit: 1000000,
      // gasPrice: ethers.utils.parseUnits('10', 'gwei'),
      value: ethAmount
    }
  )

  console.log('txn', txn)
  const tx = await txn.wait()
  return tx
}

export async function fetchSpotPricesUSDCToLuna(): Promise<string> {
  const [immutables, state, state0] = await Promise.all([
    // TODO remove this ohmToUSDCContract
    getPoolImmutables(ethToLunaContract),
    getPoolState(ohmToUSDCPoolContract),
    getPoolState(ethToLunaContract)
  ])

  // const TokenA = new Token(1, immutables.token0, 18, '', 'USD Coin')
  // const ETH = new Token(3, immutables.token0, 18, 'ETH', 'ETH')
  // const USDC = new Token(
  //   1,
  //   '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  //   6,
  //   'USDC',
  //   'USDC//C'
  // )
  // // const LUNA = new Token(3, '', 18, 'WLUNA', 'Wrapped Luna')
  // const LUNA = new Token(
  //   1,
  //   '0xd2877702675e6ceb975b4a1dff9fb7baf4c91ea9',
  //   18,
  //   'WLUNA',
  //   'Wrapped Luna'
  // )

  // console.log('state', state)
  // console.log('state0', state0)

  // Doesn't work; fails with price and liquidity issues for the pool

  // const pool = new Pool(
  //   ETH,
  //   LUNA,
  //   immutables.fee,
  //   //note the description discrepancy - sqrtPriceX96 and sqrtRatioX96
  //   // are interchangable values
  //   state0.sqrtPriceX96.toString(),
  //   state0.liquidity.toString(),
  //   state0.tick
  // )

  // const token0Price = pool.token0Price
  // const token1Price = pool.token1Price

  // // luna per eth
  // console.log('token0Price', token0Price, token0Price.toSignificant(6))

  const amountIn = ethers.utils.parseUnits('1', 6)

  const quotedAmountOut0 =
    await quoterContract.callStatic.quoteExactInputSingle(
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USCD
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // ETH
      immutables.fee,
      amountIn.toString(),
      0
    )

  const swap0Cost = ethers.utils.formatUnits(quotedAmountOut0.toString(), 18)
  console.log('swap0Cost', swap0Cost)

  const amountIn1 = ethers.utils.parseUnits(swap0Cost, 18)

  const quotedAmountOut1 =
    await quoterContract.callStatic.quoteExactInputSingle(
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // ETH
      '0xd2877702675e6ceb975b4a1dff9fb7baf4c91ea9', // WLUNA
      immutables.fee,
      quotedAmountOut0.toString(),
      0
    )
  const swap1Cost = ethers.utils.formatUnits(quotedAmountOut1.toString(), 18)
  console.log('swap1Cost', swap1Cost)

  return Number(swap1Cost).toString()
}

export async function fetchSpotPrices(): Promise<string> {
  const [immutables, state] = await Promise.all([
    // TODO remove this ohmToUSDCContract
    getPoolImmutables(ohmToUSDCPoolContract),
    getPoolState(ohmToUSDCPoolContract)
  ])

  // const TokenA = new Token(1, immutables.token0, 18, '', 'USD Coin')
  const OHM = new Token(1, immutables.token0, 9, 'OHM', 'OlympusDAO tokens')
  const USDC = new Token(1, immutables.token1, 6, 'USDC', 'USD Coins')

  const poolUSDCOHM = new Pool(
    OHM,
    USDC,
    immutables.fee,
    //note the description discrepancy - sqrtPriceX96 and sqrtRatioX96
    // are interchangable values
    state.sqrtPriceX96.toString(),
    state.liquidity.toString(),
    state.tick
  )

  console.log('state', state)

  const token0Price = poolUSDCOHM.token0Price
  const token1Price = poolUSDCOHM.token1Price

  // usdc per ohm
  console.log(token0Price, token1Price)
  console.log(token0Price.invert().toSignificant(6))

  return token1Price.toSignificant(6)
}

// export async function _templateMakeTrade() {
// OK we know this works
// TESTNET
// const WETH_ADDRESS = '0xc778417E063141139Fce010982780140Aa0cD5Ab'
// const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
// const newpath = [WETH_ADDRESS, UNI_ADDRESS]
// const ethAmount = ethers.utils.parseEther('0.01')
// const nowInSeconds = Math.floor(Date.now() / 1000)
// const expiryDate = nowInSeconds + 9000
// const txn = await routerContract.swapExactETHForTokens(
//   0,
//   newpath,
//   to,
//   expiryDate,
//   {
//     gasLimit: 1000000,
//     gasPrice: ethers.utils.parseUnits('10', 'gwei'),
//     value: ethAmount
//   }
// )
// }
