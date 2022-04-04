import React, { useEffect } from 'react'
import Image from 'next/image'

import {
  useWallet,
  useConnectedWallet,
  ConnectType,
  ConnectedWallet
} from '@terra-money/wallet-provider'

import { FAQ } from 'components/FAQ'
import { Mint } from 'components/Mint'

import { toast, ToastContainer } from 'react-toastify'
import { CacheContent } from 'lib/types'
import { mint } from 'lib/utils/mint'
import router from 'next/router'

import cacheContent from '../lib/cache.json'
import { getAllTokens } from 'lib/utils/getAllTokens'
import { getClient } from 'lib/utils/getClient'

export default function Index() {
  const { connect } = useWallet()
  const [tokensLoaded, setTokensLoaded] = React.useState<string[] | undefined>(undefined)
  const connectedWallet = useConnectedWallet()

  useEffect(() => {
    const loadTokens = async (connectedWallet: ConnectedWallet) => {
      const lcd = await getClient(connectedWallet.network.chainID || 'columbus-5')
      setTokensLoaded(
        await getAllTokens(lcd, cacheContent.contract_addr)
      )
    }
    if (typeof tokensLoaded === 'undefined' && typeof connectedWallet !== 'undefined') {
      loadTokens(connectedWallet)
    }
  }, [connectedWallet])

  const handleClickMint = async (mintCount: number) => {

    if (connectedWallet && tokensLoaded) {
      const token_id = await toast.promise(
        mint(connectedWallet, cacheContent as CacheContent, mintCount, tokensLoaded),
        {
          pending: "Minting token(s)...",
          success: "Token(s) minted!",
          error: "Could not mint token(s)"
        }
      )
      console.log('Minted', token_id)
      if (typeof token_id !== 'undefined') {
        router.push(`/${token_id}`)
      }
    }
  }

  return (
    <div
      className='py-12'
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        height: '100%',
      }}
    >
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
          <h2 className='text-center text-3xl font-extrabold text-gray-900 sm:text-4xl'>
            Exclusive 1st Drop
          </h2>

          <div>
            <Image
              className='rounded-xl'
              src='/BoredApe.gif'
              height='300'
              width='300'
              alt='BoredApe'
            />
          </div>

          {connectedWallet?.connectType !== ConnectType.EXTENSION ? (
            <button
              className='mintButton inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              onClick={() => connect(ConnectType.EXTENSION)}
            >
              Connect!
            </button>
          ) : (
            <Mint 
              disabled={typeof tokensLoaded === 'undefined'}
              mintCallback={handleClickMint} 
              mintCost={parseFloat(cacheContent.config.price.amount)/1_000_000}
            />
          )}

          <FAQ />

        </div>
      </div>
    </div>
  )
}
