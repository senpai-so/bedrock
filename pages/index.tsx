import React from 'react'
import Image from 'next/image'

import { Fee, MsgSend, TxError } from '@terra-money/terra.js'

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
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import FinishMintComponent from 'src/finishMintComponent'

class ServerError extends Error {}

type MintResponse = {
  success: boolean
  tokenId?: string | null
  error?: string
}

export default function Index() {
  const { status, availableConnections, connect, disconnect } = useWallet()

  const [txError, setTxError] = React.useState<string | null>(null)
  const [txResult, setTxResult] = React.useState<TxResult | null>(null)
  const [showModal, setShowModal] = React.useState(false)
  const [mintedTokenId, setMintedTokenId] = React.useState<string | null>(null)

  const connectedWallet = useConnectedWallet()

  const mint = (buyer: string): Promise<void | MintResponse> => {
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
  
  const adjustGasLimit = (gasLimit: number) => {
    return gasLimit * 1.25
  }

  const handleClickMint = () => {
    const toastId = toast.loading('Transaction Pending...')
    if (connectedWallet) {
      setTxError(null)
      setTxResult(null)

      const buyer = connectedWallet.walletAddress
      console.log('buyer', buyer)
      console.log('owner', ownerAddress)

      // TODO use proper fee
      // const gasLimit = 1000000 * adjustGasLimit(0.01133)
      // const fee = new Fee(gasLimit, '11330uluna')

      // TODO switch to pay btwn luna or uust depending on what user chooses
      console.log('Posting...')
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

          const res = mint(buyer)
          await res
          await mint(buyer).then((res) => {
            toast.update(toastId, {
              render: 'Transaction Successful',
              type: 'success',
              isLoading: false,
              closeOnClick: true,
              autoClose: 7000
            })
            if (res?.tokenId) {
              setMintedTokenId(res.tokenId)
            }
          })
        })
        .catch((error: unknown) => {
          let error_msg = ''
          if (error instanceof UserDenied) {
            error_msg = 'Error: User Denied'
          } else if (error instanceof CreateTxFailed) {
            error_msg =
              'Error: Failed to create transaction. Check that you have sufficient funds in your wallet.'
            console.log(error.message)
          } else if (error instanceof TxFailed) {
            error_msg =
              'Error: Transaction Failed. Check that your wallet is on the right network.'
          } else if (error instanceof Timeout) {
            error_msg = 'Error: Timeout'
          } else if (error instanceof TxUnspecifiedError) {
            error_msg =
              'Error: [Unspecified Error] Please contact the administrator'
            console.log(error.message)
          } else if (error instanceof ServerError) {
            error_msg = 'Error: [Server Error] Please contact the administrator'
          } else {
            error_msg = 'Error: [Unknown Error] Please try again'
            console.log(error instanceof Error ? error.message : String(error))
          }
          toast.update(toastId, {
            render: `${error_msg}`,
            type: 'error',
            isLoading: false,
            closeOnClick: true,
            autoClose: 7000
          })
          setTxError(error_msg)
        })
    }
  }

  const abbreviateWalletAddress = (address: string) => {
    return address.length > 12
      ? address.slice(0, 6) + '...' + address.slice(-4)
      : address
  }

  return (
    <Page>
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
      />
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
              {mintedTokenId ? (
                <FinishMintComponent token_id={mintedTokenId} />
              ) : (
                <button
                  className='inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  onClick={() => {
                    handleClickMint()
                  }}
                >
                  Mint!
                </button>
              )}
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
