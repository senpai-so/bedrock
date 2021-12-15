import fetch from 'isomorphic-fetch'
import { MsgSend, MnemonicKey, Coins, LCDClient } from '@terra-money/terra.js'

// Fetch gas prices and convert to `Coin` format.
const gasPrices = await (
  await fetch('https://bombay-fcd.terra.dev/v1/txs/gas_prices')
).json()
const gasPricesCoins = new Coins(gasPrices)

const lcd = new LCDClient({
  URL: 'https://bombay-lcd.terra.dev/',
  chainID: 'bombay-12',
  gasPrices: gasPricesCoins,
  gasAdjustment: '1.5',
  gas: 10000000
})

const mk = new MnemonicKey({
  mnemonic:
    'satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn'
})

const wallet = lcd.wallet(mk)

// Transfer 1 Luna.
const send = new MsgSend(
  wallet.key.accAddress,
  'terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8',
  { uluna: '1000000' }
)

const tx = await wallet.createAndSignTx({ msgs: [send] })
const result = await lcd.tx.broadcast(tx)

console.log(result)
