import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'

import {
  useWallet,
  useConnectedWallet,
  WalletStatus,
} from '@terra-money/wallet-provider'

import { Page } from 'components/Page'
import { Modal } from 'components/Modal'

import { getLCD } from 'lib/utils/terra'
import { NFTTokenItem, OwnerOf } from 'lib/types'

const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || ''

const isProperImage = (imageUri: string) =>
  imageUri.startsWith('http://') || imageUri.startsWith('https://')

export default function Index() {
  const { status, availableConnections, connect, disconnect } = useWallet()

  const [nftInfo, setNFTInfo] = React.useState<NFTTokenItem | null>(null)
  const [showModal, setShowModal] = React.useState(false)

  const router = useRouter()
  const { token_id } = router.query

  const connectedWallet = useConnectedWallet()

  const imageStyle = 'h-32 w-32 rounded-full mx-auto mb-4'

  const toggleDisconnect = () => {
    setShowModal(!showModal)
  }

  const abbreviateWalletAddress = (address: string) => {
    return address.length > 12
      ? address.slice(0, 6) + '...' + address.slice(-4)
      : address
  }

  function renderImage() {
    const imageUrl = nftInfo?.extension?.image
    if (!imageUrl) {
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
    if (isProperImage(imageUrl))
      return (
        <Image
          alt='nft logo'
          src={imageUrl}
          height='400'
          width='400'
          className={imageStyle}
        />
      )
  }

  function render() {
    if (!nftInfo) {
      return (
        <>
          <h2>You are not the owner of this NFT!</h2>
          <p>You need to be the owner to view this</p>
        </>
      )
    }

    return (
      <>
        <div>{renderImage()}</div>

        <div
          className='border cursor-pointer px-4 py-2 sm:text-lg border-gray-300 rounded-lg text-gray-700'
          onClick={() => toggleDisconnect()}
        >
          Owner 🧧{' '}
          <span className='px-3 py-2 font-medium'>
            {abbreviateWalletAddress(connectedWallet?.walletAddress || '')}
          </span>
        </div>
      </>
    )
  }

  useEffect(() => {
    async function fetchSetNFTData(tokenId: string) {
      const lcd = await getLCD()
      const ownership = (await lcd.wasm.contractQuery<NFTTokenItem>(
        contractAddress,
        {
          owner_of: { token_id: token_id }
        }
      )) as unknown as OwnerOf

      if (ownership.owner === connectedWallet?.walletAddress) {
        const nftInfo = await lcd.wasm.contractQuery<NFTTokenItem>(
          contractAddress,
          {
            nft_info: { token_id: token_id }
          }
        )
        console.log(nftInfo)
        setNFTInfo(nftInfo)
      }
    }
    if (status === WalletStatus.WALLET_CONNECTED) {
      const tokenId = token_id as string
      fetchSetNFTData(tokenId)
    }
  }, [connectedWallet?.walletAddress, status, token_id])

  return (
    <Page>
      <div className='bg-white max-w-xl mx-auto rounded-3xl shadow-2xl px-5 py-12'>
        <div className='flex flex-col items-center justify-center space-y-4'>
          <h2 className='font-bold text-3xl text-blue-700'>
            {nftInfo?.extension.name || 'NFT View Page'}
          </h2>

          <p className='text-base text-gray-700'>
            {nftInfo?.description || `A starry-eyed space cadet`}
          </p>

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
