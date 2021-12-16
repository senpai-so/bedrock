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

import { getLocalTerraLCD } from 'lib/utils/nft-mint'

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

  // Loonies Wallet Address. Signs contract, receives funds
  const SIGNER_WALLET_ADDRESS = 'terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8'

  const MAIN_WALLET_ADDRESS = 'terra15048c7jn3hlz9ewsvuf6glhx6g88lg5tc22uvw'

  // LocalTerra NFT contract deployed address
  const NFT_CONTRACT_ADDRESS = 'terra17dkr9rnmtmu7x4azrpupukvur2crnptyfvsrvr'

  // const TEST_TO_ADDRESS = 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9'

  const ONE_UST = 1000000

  const ONE_LUNA = 1000000

  const LCD_URL = 'http://localhost:1317'

  const mk = new MnemonicKey({
    mnemonic:
      'satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn'
  })

  const handleClickMint = async () => {
    if (connectedWallet) {
      setTxResult(null)
      setTxError(null)

      const lcd = await getLocalTerraLCD()
      const owner = SIGNER_WALLET_ADDRESS
      const signer = lcd.wallet(mk)
      const buyer = connectedWallet.walletAddress
      const contractAddress = NFT_CONTRACT_ADDRESS

      const fee = new Fee(1000000 * 10, '8350000uusd')

      // console.log('transferring...')
      // connectedWallet
      //   .post({
      //     fee: fee,
      //     msgs: [
      //       new MsgSend(buyer, owner, {
      //         uusd: 1 * ONE_UST
      //         // uluna: 100 * ONE_LUNA
      //       })
      //     ]
      //   })
      //   .then(async (nextTxResult: TxResult) => {
      //     console.log('transferred.')
      //     setTxResult(nextTxResult)
      //     await step2()
      //   })
      //   .catch((error: unknown) => {
      //     if (error instanceof UserDenied) {
      //       setTxError('User Denied')
      //     } else if (error instanceof CreateTxFailed) {
      //       setTxError('Create Tx Failed: ' + error.message)
      //     } else if (error instanceof TxFailed) {
      //       setTxError('Tx Failed: ' + error.message)
      //     } else if (error instanceof Timeout) {
      //       setTxError('Timeout')
      //     } else if (error instanceof TxUnspecifiedError) {
      //       setTxError('Unspecified Error: ' + error.message)
      //     } else {
      //       setTxError(
      //         'Unknown Error: ' +
      //           (error instanceof Error ? error.message : String(error))
      //       )
      //     }
      //   })

      console.log('minting')
      const msg = new MsgExecuteContract(
        owner,
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
        { uluna: 1 * ONE_LUNA }
      )

      // mint part
      const tx = await signer.createAndSignTx({
        msgs: [msg]
      })

      console.log('mint tx', tx)
      const result = await lcd.tx.broadcast(tx)
      console.log(result)
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
