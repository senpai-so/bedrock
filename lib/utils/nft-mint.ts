import {
  LCDClient,
  MnemonicKey,
  MsgExecuteContract,
  Coins
} from '@terra-money/terra.js'

const LCD_URL = 'http://localhost:1317'

export async function getLocalTerraLCD() {
  const gasPrices = await (
    await fetch('http://localhost:3060/v1/txs/gas_prices')
  ).json()

  const gasPricesCoins = new Coins(gasPrices)

  return new LCDClient({
    URL: LCD_URL,
    chainID: 'localterra'
    // gasPrices: gasPricesCoins,
    // gasAdjustment: '1.5'
  })
}

export async function mint(
  contractAddress: string,
  recipientAddress: string,
  mk: MnemonicKey
) {
  // Mint an NfT
  const lcd = await getLocalTerraLCD()
  const signerWallet = lcd.wallet(mk)
  const newOwner = recipientAddress

  const mint = new MsgExecuteContract(newOwner, contractAddress, {
    mint: {
      token_id: 'DUCHESSTAYTAY',
      owner: newOwner,
      name: 'DuchessTayTay',
      description: 'Allows the owner to petrify anyone looking at him or her',
      image: 'http://localhost:3000/loonies/DuchessTayTay.jpeg',
      extension: {
        name: 'DuchessTayTay',
        image: 'http://localhost:3000/loonies/DuchessTayTay.jpeg'
      }
    }
  })

  const transfer = new MsgExecuteContract(newOwner, contractAddress, {
    transfer_nft: {
      token_id: 'DUCHESSTAYTAY',
      recipient: newOwner
    }
  })

  // mint part
  const tx = await signerWallet.createAndSignTx({
    msgs: [mint]
  })

  console.log('mint tx', tx)
  const result = await lcd.tx.broadcast(tx)
  console.log('mint result', result)

  const tx1 = await signerWallet.createAndSignTx({
    msgs: [transfer]
  })

  console.log('mint tx', tx)
  const result1 = await lcd.tx.broadcast(tx1)
  console.log('transfer result', result1)
}
