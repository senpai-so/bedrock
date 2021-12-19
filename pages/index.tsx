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
import { Modal } from 'components/Modal'
import { FAQ } from 'components/FAQ'

import api from 'lib/utils/api-client'
import { ownerAddress } from 'lib/config'
import { toUUST, toULuna } from 'lib/utils/currency'
import MintButton, { MintStatus } from './mintButton'

class ServerError extends Error {}

export default function Index() {

  const { status, availableConnections, connect, disconnect } = useWallet()

  const [txResult, setTxResult] = React.useState<TxResult | null>(null)
  const [showModal, setShowModal] = React.useState(false)


  const connectedWallet = useConnectedWallet()

  const mint = (buyer: string) => {
    return api
      .post('/mint', { buyer })
      .then((res) => res.json())
      .catch((error) => {
        throw new ServerError()
      })
  }

  const toggleDisconnect = () => {
    setShowModal(!showModal)
  }
  // new Promise<boolean | string>((resolve, reject) 
  const handleClickMint = () => 
  new Promise<boolean | string>((resolve, reject) => {
    if (connectedWallet) {
      setTxResult(null)

      const buyer = connectedWallet.walletAddress
      console.log('buyer', buyer)
      console.log('owner', ownerAddress)

      // TODO use proper fee
      const fee = new Fee(1000000 * 10, '8350000uluna')

      // TODO switch to pay btwn luna or uust depending on what user chooses
      console.log('Posting...')
      connectedWallet
        .post({
          fee: fee,
          msgs: [
            new MsgSend(buyer, ownerAddress, {
              // uusd: toUUST(1)
              uluna: toULuna(1)
            })
          ]
        })
        .then(async (nextTxResult: TxResult) => {
          console.log('transferred.')
          setTxResult(nextTxResult)

          const res = await mint(buyer)
          resolve(true)

        })
        .catch((error: unknown) => {
          if (error instanceof UserDenied) {
            reject('Error: User Denied')
          } else if (error instanceof CreateTxFailed) {
            reject('Error: Failed to create transaction. Check that you have sufficient funds in your wallet.')
            console.log(error.message)
          } else if (error instanceof TxFailed) {
            reject('Error: Transaction Failed. Check that your wallet is on the right network.')
          } else if (error instanceof Timeout) {
            reject('Error: Timeout')
          } else if (error instanceof TxUnspecifiedError) {
            reject('Error: [Unspecified Error] Please contact the administrator')
            console.log(error.message)
          } else if (error instanceof ServerError) {
            reject('Error: [Server Error] Please contact the administrator')
          } else {
            reject('Error: [Unknown Error] Please try again')
            console.log(error instanceof Error ? error.message : String(error))
          }

        })
    }
  }
  )

  const abbreviateWalletAddress = (address: string) => {
    return address.length > 12
      ? address.slice(0, 6) + '...' + address.slice(-4)
      : address
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
              <div
                className='border cursor-pointer border-1 px-4 py-2 sm:text-lg font-medium border-gray-300 rounded-lg text-gray-700'
                onClick={() => toggleDisconnect()}
              >
                🧧{' '}
                {abbreviateWalletAddress(connectedWallet?.walletAddress || '')}
              </div>
              <MintButton onClick={handleClickMint}/>
            </>
          )}

          <FAQ />

          {showModal && (
            <Modal
              action={() => disconnect()}
              walletAddress={abbreviateWalletAddress(
                connectedWallet?.walletAddress || ''
              )}
            />
          )}
        </div>
      </div>
    </Page>
  )
}
