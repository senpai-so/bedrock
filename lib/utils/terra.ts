import { LCDClient, Coins } from '@terra-money/terra.js'

import { isDev, isPreview } from 'lib/config'

const localUrl = 'http://localhost:1317'
const localApiUrl = 'http://localhost:3060'
const localChainID = 'localterra'

const devnetUrl = 'https://bombay-fcd.terra.dev/'
const devnetApiUrl = 'https://bombay-fcd.terra.dev'
const devChainID = 'bombay-12'

const prodUrl = 'https://fcd.terra.dev'
const prodApiUrl = 'https://fcd.terra.dev'
const prodChainID = 'columbus-4'


// gets correct url based on env settings
function getBaseUrl() {
  return isDev ? localUrl : isPreview ? devnetUrl : prodUrl
}

function getApiUrl() {
  return isDev ? localApiUrl : isPreview ? devnetApiUrl : prodApiUrl
}

function getChainID() {
  return isDev ? localChainID : isPreview ? devChainID : prodChainID
}

export async function getGasPrices() {
  const apiUrl = getApiUrl()
  const terraApiUrl = `${apiUrl}/v1/txs/gas_prices`

  const gasPrices = await (await fetch(terraApiUrl)).json()
  return gasPrices
}

export async function getLCD() {
  const baseUrl = getBaseUrl()
  const chainID = getChainID()
  const gasPrices = await getGasPrices()
  const gasPricesCoins = new Coins(gasPrices)

  return new LCDClient({
    URL: baseUrl,
    chainID: chainID,
    gasPrices: gasPricesCoins,
    gasAdjustment: '1.5'
  })
}
