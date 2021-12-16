import { LCDClient, Coins } from '@terra-money/terra.js'

import { isDev, isPreview } from 'lib/config'

const localUrl = 'http://localhost:1317'

const devnetUrl = 'https://bombay-fcd.terra.dev/'

const prodUrl = 'https://fcd.terra.dev'

// gets correct url based on env settings
function getBaseUrl() {
  return isDev ? localUrl : isPreview ? devnetUrl : prodUrl
}

export async function getGasPrices() {
  const baseUrl = getBaseUrl()
  const terraApiUrl = `${baseUrl}/v1/txs/gas_prices`

  const gasPrices = await (await fetch(terraApiUrl)).json()
  return gasPrices
}

export async function getLCD() {
  const baseUrl = getBaseUrl()
  const gasPrices = await getGasPrices()
  const gasPricesCoins = new Coins(gasPrices)

  return new LCDClient({
    URL: baseUrl,
    chainID: 'localterra',
    gasPrices: gasPricesCoins,
    gasAdjustment: '1.5'
  })
}
