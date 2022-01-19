import React, { useEffect } from 'react'
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
import { MintResponse } from 'pages/api/mint'
import { ownerAddress, mintFeeLuna } from 'lib/config'
import { toUUST, toULuna } from 'lib/utils/currency'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import FinishMintComponent from 'src/finishMintComponent'
import { getLCD } from 'lib/utils/terra'
import { NumTokensResponse } from 'lib/types'

const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || ''
// The sold out page will show when the num_tokens query to the contract is greater than or equals to this number
const maxTokensAllowed = 40

class ServerError extends Error {}

export default function Index() {
  const { status, availableConnections, connect, disconnect } = useWallet()

  const [txError, setTxError] = React.useState<string | null>(null)
  const [txResult, setTxResult] = React.useState<TxResult | null>(null)
  const [showModal, setShowModal] = React.useState(false)
  const [mintedTokenId, setMintedTokenId] = React.useState<string | null>(null)
  const [numTokens, setNumTokens] = React.useState<number>(0)

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

  useEffect(() => {
    async function fetchCurrentTotalTokens() {
      try {
        const lcd = await getLCD()
        const numTokens = (await lcd.wasm.contractQuery<NumTokensResponse>(
          contractAddress,
          { num_tokens: {} }
        )) as NumTokensResponse
        setNumTokens(numTokens.count)
      } catch (error) {
        console.log(error)
      }
    }
    fetchCurrentTotalTokens()
  }, [])

  const handleClickMint = () => {
    const toastId = toast.loading('Transaction Pending...')
    if (connectedWallet) {
      setTxError(null)
      setTxResult(null)

      const buyer = connectedWallet.walletAddress
      console.log('buyer', buyer)
      console.log('owner', ownerAddress)
      console.log('mint fee', mintFeeLuna)
      console.log('Posting...')
      connectedWallet
        .post({
          msgs: [
            new MsgSend(buyer, ownerAddress, {
              uluna: toULuna(mintFeeLuna)
            })
          ]
        })
        .then(async (nextTxResult: TxResult) => {
          console.log('transferred.')
          setTxResult(nextTxResult)

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
    <div
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover'
      }}
    >
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
                src='/BoredApe.gif'
                height='400'
                width='400'
                alt='BoredApe'
              />
            </div>

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
    </div>
  )
}
