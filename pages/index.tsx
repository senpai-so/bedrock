import React from 'react'
import {
  Fee,
  MsgSend,
  LCDClient,
  MnemonicKey,
  MsgExecuteContract,
  Coins
} from '@terra-money/terra.js'

import {
  useWallet,
  useConnectedWallet,
  WalletStatus,
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxResult,
  TxUnspecifiedError,
  UserDenied
} from '@terra-money/wallet-provider'

import { Page } from 'components/Page'

export default function Index() {
  const {
    status,
    // network,
    // wallets,
    // availableConnectTypes,
    // availableInstallTypes,
    availableConnections,
    // supportFeatures,
    connect,
    // install,
    disconnect
  } = useWallet()

  const [txResult, setTxResult] = React.useState<TxResult | null>(null)
  const [txError, setTxError] = React.useState<string | null>(null)

  const connectedWallet = useConnectedWallet()
  console.log('connectedWallet', connectedWallet)

  // Loonies Wallet Address. Signs contract, receives funds
  const SIGNER_WALLET_ADDRESS = 'terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8'

  const MAIN_WALLET_ADDRESS = 'terra15048c7jn3hlz9ewsvuf6glhx6g88lg5tc22uvw'

  // LocalTerra NFT contract deployed address
  const NFT_CONTRACT_ADDRESS = 'terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8'

  // const TEST_TO_ADDRESS = 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9'

  const ONE_UST = 1000000
  const ONE_LUNA = 1000000

  const LCD_URL = 'http://localhost:1317'

  const mk = new MnemonicKey({
    mnemonic:
      'satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn'
  })

  const handleClickMint = () => {
    if (connectedWallet) {
      console.log('minting')

      setTxResult(null)
      setTxError(null)

      const fee = new Fee(1000000 * 10, '8350000uusd')

      connectedWallet
        .post({
          fee: fee,
          msgs: [
            new MsgSend(connectedWallet.walletAddress, MAIN_WALLET_ADDRESS, {
              uusd: 50 * ONE_UST
              // uluna: 100 * ONE_LUNA
            })
          ]
        })
        .then(async (nextTxResult: TxResult) => {
          console.log('here')
          console.log(nextTxResult)
          setTxResult(nextTxResult)

          // Mint an NfT
          const gasPrices =
            await // await fetch('https://bombay-fcd.terra.dev/v1/txs/gas_prices')
            (await fetch('http://localhost:3060/v1/txs/gas_prices')).json()

          const gasPricesCoins = new Coins(gasPrices)

          const lcd = new LCDClient({
            URL: LCD_URL,
            chainID: 'bombay-12',
            gasPrices: gasPricesCoins,
            gasAdjustment: '1.5'
          })

          const signerWallet = lcd.wallet(mk)

          const mint = new MsgExecuteContract(
            connectedWallet.walletAddress,
            NFT_CONTRACT_ADDRESS,
            {
              mint: {
                token_id: 'DUCHESSTAYTAY',
                owner: connectedWallet.walletAddress,
                name: 'DuchessTayTay',
                description:
                  'Allows the owner to petrify anyone looking at him or her',
                image: 'http://localhost/loonies/DuchessTayTay.jpeg'
              }
            }
          )

          const tranfer = new MsgExecuteContract(
            connectedWallet.walletAddress,
            NFT_CONTRACT_ADDRESS,
            {
              transfer_nft: {
                token_id: 'DUCHESSTAYTAY',
                owner: connectedWallet.walletAddress,
                recipient: wallet.key.accAddress
              }
            }
          )

          const tx = await signerWallet.createAndSignTx({
            msgs: [mint, tranfer]
          })
          const result = await lcd.tx.broadcast(tx)
          console.log('mint result', result)
        })
        .catch((error: unknown) => {
          console.log('error', error)
          if (error instanceof UserDenied) {
            setTxError('User Denied')
          } else if (error instanceof CreateTxFailed) {
            setTxError('Create Tx Failed: ' + error.message)
          } else if (error instanceof TxFailed) {
            setTxError('Tx Failed: ' + error.message)
          } else if (error instanceof Timeout) {
            setTxError('Timeout')
          } else if (error instanceof TxUnspecifiedError) {
            setTxError('Unspecified Error: ' + error.message)
          } else {
            setTxError(
              'Unknown Error: ' +
                (error instanceof Error ? error.message : String(error))
            )
          }
        })
    }
  }
  return (
    <Page>
      <div className='bg-white max-w-xl mx-auto rounded-3xl shadow-2xl px-5 py-12'>
        <div className='flex flex-col items-center justify-center space-y-12'>
          <h2 className='font-bold text-3xl text-blue-700'>
            Exclusive 1st Drop
          </h2>

          <div>
            <img className='rounded-xl' src='/LooniesGif.gif'></img>
          </div>

          {status === WalletStatus.WALLET_NOT_CONNECTED && (
            <>
              {availableConnections
                .filter((_) => _.type === 'EXTENSION')
                .map(({ type, name, icon, identifier = '' }) => (
                  <button
                    key={'connection-' + type + identifier}
                    className='inline-flex items-center px-6 py-3 text-blue-700 font-bold rounded-2xl border-2 border-blue-600 bg-white focus:outline-none '
                    onClick={() => connect(type, identifier)}
                  >
                    <img
                      src={icon}
                      alt={name}
                      style={{ width: '1em', height: '1em' }}
                      className='mr-2'
                    />
                    Connect Wallet
                  </button>
                ))}
            </>
          )}

          {status === WalletStatus.WALLET_CONNECTED && (
            <>
              <button
                className='inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                onClick={() => handleClickMint()}
              >
                🌙 Mint
              </button>

              <button
                className='mt-4 inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>
    </Page>
  )
}
