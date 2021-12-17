import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
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
import { getLCD } from 'lib/utils/terra'
import { NFTTokenItem } from 'lib/types'

const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || ''

export default function Index() {
  const { status, availableConnections, connect, disconnect } = useWallet()

  const [txResult, setTxResult] = React.useState<TxResult | null>(null)
  const [txError, setTxError] = React.useState<string | null>(null)
  const [nftInfo, setNFTInfo] = React.useState<NFTTokenItem | null>(null)
  const [showModal, setShowModal] = React.useState(false)

  const router = useRouter()
  const { token_id } = router.query

  const connectedWallet = useConnectedWallet()

  const imageStyle = 'h-32 w-32 rounded-full mx-auto mb-4'

  const mint = (buyer: string) => {
    return api
      .post('/mint', { buyer })
      .then((res) => res.json())
      .catch((error) => {
        // TODO handle error
      })
  }

  const toggleDisconnect = () => {
    setShowModal(!showModal)
  }

  const handleClickMint = async () => {
    if (connectedWallet) {
      setTxResult(null)
      setTxError(null)

      const buyer = connectedWallet.walletAddress
      console.log('buyer', buyer)
      console.log('owner', ownerAddress)

      // TODO use proper fee
      const fee = new Fee(1000000 * 10, '8350000uluna')

      // TODO switch to pay btwn luna or uust depending on what user chooses
      console.log('posting...')
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

          const res = mint(buyer)
          await res
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

  async function fetchSetNFTData(tokenId: string): Promise<NFTTokenItem> {
    const lcd = await getLCD()
    console.log('contract', contractAddress)
    const nftInfo = await lcd.wasm.contractQuery<NFTTokenItem>(
      // 'terra17dkr9rnmtmu7x4azrpupukvur2crnptyfvsrvr',
      contractAddress,
      {
        nft_info: { token_id: 'DUCHTYTY3' }
      }
    )
    setNFTInfo(nftInfo)
    return nftInfo
  }

  function renderImage() {
    if (!nftInfo?.extension?.image) {
      return (
        <Image
          alt='no nft'
          src={'/default.svg'}
          className={imageStyle}
          height='32'
          width='32'
        />
      )
    }

    return (
      <Image
        alt='nft logo'
        src={nftInfo.extension.image}
        height='400'
        width='400'
        className={imageStyle}
      />
    )
  }

  function render() {
    return (
      <>
        <div
          className='border cursor-pointer border-1 px-4 py-2 sm:text-lg font-medium border-gray-300 rounded-lg text-gray-700'
          onClick={() => toggleDisconnect()}
        >
          🧧 {abbreviateWalletAddress(connectedWallet?.walletAddress || '')}
        </div>
        <div>{renderImage()}</div>
      </>
    )
  }

  useEffect(() => {
    if (status === WalletStatus.WALLET_CONNECTED) {
      const tokenId = token_id as string
      fetchSetNFTData(tokenId)
    }
  }, [status, token_id])

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
            </>
          )}

          {status === WalletStatus.WALLET_CONNECTED && render()}

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
