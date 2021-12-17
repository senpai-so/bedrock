import React from 'react'
import Image from 'next/image'
import { Fee, MsgSend } from '@terra-money/terra.js'

import {
  useWallet,
  useConnectedWallet,
  WalletStatus,
  TxResult,
  UserDenied,
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxUnspecifiedError
} from '@terra-money/wallet-provider'

import { Page } from 'components/Page'

import api from 'lib/utils/api-client'
import { ownerAddress } from 'lib/config'
import { toUUST } from 'lib/utils/currency'

export default function Index() {
  const { status, availableConnections, connect, disconnect } = useWallet()

  const [txResult, setTxResult] = React.useState<TxResult | null>(null)
  const [txError, setTxError] = React.useState<string | null>(null)

  const connectedWallet = useConnectedWallet()

  const mint = (buyer: string) => {
    return api
      .post('/mint', { buyer })
      .then((res) => res.json())
      .catch((error) => {
        // TODO handle error
      })
  }

  const handleClickMint = async () => {
    if (connectedWallet) {
      setTxResult(null)
      setTxError(null)

      const buyer = connectedWallet.walletAddress

      // TODO use proper fee
      const fee = new Fee(1000000 * 10, '8350000uusd')

      // TODO switch to pay btwn luna or uust depending on what user chooses
      connectedWallet
        .post({
          fee: fee,
          msgs: [
            new MsgSend(buyer, ownerAddress, {
              uusd: toUUST(1)
              // uluna: 100 * ONE_LUNA
            })
          ]
        })
        .then(async (nextTxResult: TxResult) => {
          console.log('transferred.')
          setTxResult(nextTxResult)

          const res = mint(buyer)
          await res
        })
        .catch((error: unknown) => {
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
            <Image
              className='rounded-xl'
              src='/LooniesGif.gif'
              height='400'
              width='400'
              alt='LooniesGif'
            />
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
                    <Image
                      src={icon}
                      alt={name}
                      width='1em'
                      height='1em'
                      className='mr-2'
                    />
                    Connect Wallet
                  </button>
                ))}
            </>
          )}

          {status === WalletStatus.WALLET_CONNECTED && (
            <>
              <p> Connected Wallet: {connectedWallet?.walletAddress} </p>
              <button
                className='inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                onClick={() => handleClickMint()}
              >
                <span className='mr-2'>🌙 </span> Mint
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
