import React from 'react'
import Image from 'next/image'

import {
  useWallet,
  useConnectedWallet,
  ConnectType
} from '@terra-money/wallet-provider'

import { Page } from 'components/Page'
import { Modal } from 'components/Modal'
import { FAQ } from 'components/FAQ'

import api from 'lib/utils/api-client'
import { toast, ToastContainer } from 'react-toastify'
import { CacheContent } from 'packages/cli/src/utils/cache'
import { mint } from 'lib/chain/mint'
import router from 'next/router'

const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || ''

class ServerError extends Error {}


export default function Index() {
  const { status, availableConnections, connect, disconnect } = useWallet()
  const [showModal, setShowModal] = React.useState(false)
  const connectedWallet = useConnectedWallet();

  const toggleDisconnect = () => {
    setShowModal(!showModal)
  }

  const adjustGasLimit = (gasLimit: number) => {
    return gasLimit * 1.25
  }

  const handleClickMint = async () => {
    const toastId = toast.loading('Transaction Pending...')
    if (connectedWallet) {

      const cacheStr = await api
        .post('/config', { path: './packages/server/config.json', env: 'mainnet'/*connectedWallet.connectType*/ })
        .then(async (res) => {
          const json = await res.json();
          return json.cacheStr as string;
        })
        .catch((_) => {
          throw new ServerError("Config not found. Please upload first!")
        }
      );

      const cacheContent = JSON.parse(cacheStr) as CacheContent;
      const token_id = mint(connectedWallet, cacheContent);
      router.push(`/${token_id}`);
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

            { typeof connectedWallet?.connectType === 'undefined' ? (
              <button
                className='mintButton inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                onClick={() => connect(ConnectType.EXTENSION)}
              >
                Connect!
              </button>
            ) : (
              <button
                className='mintButton inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                onClick={() => handleClickMint()}
              >
                Mint!
              </button>
            )
            
            }

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
