import { LCDClient, Coins } from '@terra-money/terra.js'

import { isDev, isPreview } from 'lib/config'

const localLcdUrl = 'http://localhost:1317'
const localFcdUrl = 'http://localhost:3060'
const localChainID = 'localterra'

const testnetLcdUrl = 'https://bombay-fcd.terra.dev'
const testnetFcdUrl = 'https://bombay-fcd.terra.dev'
const testnetChainID = 'bombay-12'

const prodLcdUrl = 'https://fcd.terra.dev'
const prodFcdUrl = 'https://fcd.terra.dev'
const prodChainID = 'columbus-5'

// gets correct url based on env settings
function getLcdUrl() {
  return isDev ? localLcdUrl : isPreview ? testnetLcdUrl : prodLcdUrl
}

function getFcdUrl() {
  return isDev ? localFcdUrl : isPreview ? testnetFcdUrl : prodFcdUrl
}

function getChainID() {
  return isDev ? localChainID : isPreview ? testnetChainID : prodChainID
}

export async function getGasPrices() {
  const fcdUrl = getFcdUrl()
  const terraFcdUrl = `${fcdUrl}/v1/txs/gas_prices`

  const gasPrices = await (await fetch(terraFcdUrl)).json()
  return gasPrices
}

export async function getLCD() {
  console.log('is preview', isPreview)
  console.log(process.env.NEXT_IS_PREVIEW)
  console.log(process.env.NODE_ENV)
  console.log(process.env.NEXT_PUBLIC_VERCEL_ENV)
  console.log(process.env.VERCEL_ENV)
  const lcdUrl = getLcdUrl()
  const chainID = getChainID()
  const gasPrices = await getGasPrices()
  const gasPricesCoins = new Coins(gasPrices)

  return new LCDClient({
    URL: lcdUrl,
    chainID: chainID,
    gasPrices: gasPricesCoins,
    gasAdjustment: '1.5'
  })
}
