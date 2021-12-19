import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
import { NftTokens } from 'lib/types'

type MintResponse = {
  success: boolean
  token?: NftTokens | null
  error?: string
}

export default function Index() {
  const { status, availableConnections, connect, disconnect } = useWallet()

  const [txResult, setTxResult] = React.useState<TxResult | null>(null)
  const [txError, setTxError] = React.useState<string | null>(null)
  const [mintedToken, setMintedToken] = React.useState<NftTokens | null>(null)

  const [showModal, setShowModal] = React.useState(false)

  const connectedWallet = useConnectedWallet()

  const mint = (buyer: string): Promise<void | MintResponse> => {
    return api
      .post('/mint', { buyer })
      .then((res) => res.json())
      .catch((error) => {
        // TODO handle error
        console.log('Minting failed with ', error)
      })
  }

  const toggleDisconnect = () => {
    setShowModal(!showModal)
  }

  const adjustGasLimit = (gasLimit: number) => {
    return gasLimit * 1.25
  }

  const handleClickMint = async () => {
    if (connectedWallet) {
      setTxResult(null)
      setTxError(null)

      const buyer = connectedWallet.walletAddress
      console.log('buyer', buyer)
      console.log('owner', ownerAddress)

      // TODO use proper fee
      // const gasLimit = 1000000 * adjustGasLimit(0.01133)
      // const fee = new Fee(gasLimit, '11330uluna')

      // TODO switch to pay btwn luna or uust depending on what user chooses
      console.log('posting...')
      connectedWallet
        .post({
          // fee: fee,
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

          await mint(buyer).then((res) => {
            if (res?.token) setMintedToken(res.token)
          })
        })
        .catch((error: unknown) => {
          console.log('error!')
          console.log(error)
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

  const abbreviateWalletAddress = (address: string) => {
    return address.length > 12
      ? address.slice(0, 6) + '...' + address.slice(-4)
      : address
  }

  const isProperImage = (imageUri: string) =>
    imageUri.startsWith('http://') || imageUri.startsWith('https://')

  return (
    <Page>
      <div className='bg-white max-w-xl mx-auto rounded-3xl shadow-2xl px-5 py-12'>
        <div className='flex flex-col items-center justify-center space-y-12'>
          <h2 className='font-bold text-3xl text-blue-700'>
            Exclusive 1st Drop
          </h2>

          {status === WalletStatus.WALLET_NOT_CONNECTED && (
            <>
              <div>
                <Image
                  className='rounded-xl'
                  src='/LooniesGif.gif'
                  height='400'
                  width='400'
                  alt='LooniesGif'
                />
              </div>

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

              <FAQ />
            </>
          )}

          {status === WalletStatus.WALLET_CONNECTED && !mintedToken && (
            <>
              <div>
                <Image
                  className='rounded-xl'
                  src='/LooniesGif.gif'
                  height='400'
                  width='400'
                  alt='LooniesGif'
                />
              </div>

              <div
                className='border cursor-pointer border-1 px-4 py-2 sm:text-lg font-medium border-gray-300 rounded-lg text-gray-700'
                onClick={() => toggleDisconnect()}
              >
                🧧{' '}
                {abbreviateWalletAddress(connectedWallet?.walletAddress || '')}
              </div>

              <button
                className='inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                onClick={() => handleClickMint()}
              >
                <span className='mr-2'>🌙 </span> Mint
              </button>
            </>
          )}

          {status === WalletStatus.WALLET_CONNECTED && mintedToken && (
            <>
              <div>
                <Image
                  className='rounded-xl'
                  src={
                    isProperImage(mintedToken.image_uri)
                      ? mintedToken.image_uri
                      : '/LooniesGif.gif'
                  }
                  height='400'
                  width='400'
                  alt='LooniesGif'
                />
              </div>

              <div
                className='border cursor-pointer border-1 px-4 py-2 sm:text-lg font-medium border-gray-300 rounded-lg text-gray-700'
                onClick={() => toggleDisconnect()}
              >
                🧧{' '}
                {abbreviateWalletAddress(connectedWallet?.walletAddress || '')}
              </div>

              <p className='text-xl text-center font-bold px-8 rounded-2xl '>
                <span className='mr-2'>🎉 </span> Congrats! 🎉 <br />
                You just minted your Loonie
              </p>

              <Link href={`/${mintedToken.token_id}`}>
                <a className='inline-flex items-center px-6 py-3 underline text-xl font-bold rounded-2xl text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                  <span className='mr-2'>View your NFT!</span>🚀
                </a>
              </Link>
            </>
          )}

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
