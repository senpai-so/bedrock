import { useEffect, useState } from 'react'
import { ConnectType, useConnectedWallet } from '@terra-money/wallet-provider'
import { toast, ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

import { Page } from 'components/Page'
import { InitMsg } from './utils/types'
import { createContract } from './utils/upload'
import { getClient } from './utils/getClient'

function ConfigPage() {
  // Config values
  const [name, setName] = useState<string | undefined>()
  const [symbol, setSymbol] = useState<string | undefined>()
  const [price, setPrice] = useState<number | undefined>()
  const [startTime, setStartTime] = useState<number | undefined>()
  const [endTime, setEndTime] = useState<number | undefined>()
  const [maxTokens, setMaxTokens] = useState<number | undefined>()
  const [isPublic, setIsPublic] = useState(false)

  // Hooks
  const connectedWallet = useConnectedWallet()
  const navigate = useNavigate()

  // Navigate back to CID page if the wallet is not connected
  useEffect(() => {
    if (
      typeof connectedWallet === 'undefined' ||
      connectedWallet?.connectType !== ConnectType.EXTENSION
    ) {
      navigate('/')
    }
  })

  const checkFields = () => {
    let success = true
    if (typeof name === 'undefined' || name.trim() === '') {
      success = false
      toast.warn('Please enter a collection name.')
    }
    if (typeof symbol === 'undefined' || symbol.trim() === '') {
      success = false
      toast.warn('Please enter a collection symbol.')
    }
    if (typeof price === 'undefined' || Number.isNaN(price)) {
      success = false
      toast.warn('Please enter your price as a number.')
    }
    if (typeof startTime !== 'undefined' && Number.isNaN(startTime)) {
      success = false
      toast.warn('Please enter a valid start time')
    }
    if (
      typeof endTime !== 'undefined' &&
      (Number.isNaN(endTime) || endTime < new Date().getUTCSeconds())
    ) {
      success = false
      toast.warn('Please enter a valid end time')
    }
    if (typeof maxTokens === 'undefined' || maxTokens < 1) {
      success = false
      toast.warn('Please enter a number above 0 for Max Number of Tokens')
    }
    return success
  }

  const launchCollection = async () => {
    // Safety
    if (!checkFields()) return
    if (typeof connectedWallet === 'undefined') return

    // undefined checks for typescript
    if (
      typeof name === 'undefined' ||
      typeof symbol === 'undefined' ||
      typeof price === 'undefined' ||
      typeof maxTokens === 'undefined'
    ) {
      return
    }

    // create instantiate message
    const msg: InitMsg = {
      name: name,
      symbol: symbol,
      price: {
        amount: (price * 1_000_000).toString(),
        denom: 'uluna'
      },
      treasury_account: connectedWallet.walletAddress,
      start_time: startTime,
      end_time: endTime,
      max_token_count: maxTokens,
      is_mint_public: isPublic
    }

    const lcd = await getClient(/*connectedWallet.network.chainID*/ 'bombay-12')
    const contractAddr = await toast.promise(
      createContract(connectedWallet, lcd, msg),
      {
        pending: 'Creating smart contract',
        success: 'Smart contract created!',
        error: 'Error while creating smart contract :('
      }
    )

    const config = {
      contract_addr: contractAddr,
      chain_id: connectedWallet.network.chainID
    }
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }
    console.log('fetching')
    fetch('http://localhost:3001/save', requestOptions)
      .then(() => console.log('Config saved'))
      .catch((e) => console.error(e))

    navigate('/complete')
  }

  return (
    <div
      className='h-screen'
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'contain'
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
        <div className='bg-white max-w-2xl mx-auto rounded-3xl shadow-2xl px-5 py-12'>
          <div className='flex flex-col items-center justify-center space-y-4'>
            <div className='flex flex-col items-center justify-center border-gray-200 rounded-lg p-4'>
              <h2 className='font-bold text-center text-3xl text-blue-700'>
                Configuration
              </h2>

              <p className='text-base font-medium text-center text-gray-700'>
                Configure your NFT smart contract!
              </p>

              {/* Entry Fields */}
              <div className='mb-12'>
                <div className='mt-6 grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6'>
                  <div className='sm:col-span-3'>
                    <label
                      htmlFor='collection-name'
                      className='block text-base font-medium text-black'
                    >
                      Collection Name
                    </label>
                    <div className='mt-1'>
                      <input
                        type='text'
                        name='name'
                        className='input inline-flex text-sm font-small h-3 px-1 py-3 w-max-3xl w-full border border-gray-700 text-l rounded-md shadow-sm'
                        onChange={(e) => setName(e.currentTarget.value)}
                      />
                    </div>
                  </div>

                  <div className='sm:col-span-3'>
                    <label
                      htmlFor='collection-name'
                      className='block text-base font-medium text-black'
                    >
                      Collection Symbol
                    </label>
                    <div className='mt-1'>
                      <input
                        type='text'
                        name='symbol'
                        className='input inline-flex text-sm font-small h-3 px-1 py-3 w-max-3xl w-full border border-gray-700 text-l rounded-md shadow-sm'
                        onChange={(e) => setSymbol(e.currentTarget.value)}
                      />
                    </div>
                  </div>

                  <div className='sm:col-span-3'>
                    <label
                      htmlFor='collection-name'
                      className='block text-base font-medium text-black'
                    >
                      Price (luna)
                    </label>
                    <div className='mt-1'>
                      <input
                        type='text'
                        name='price'
                        className='input inline-flex text-sm font-small h-3 px-1 py-3 w-max-3xl w-full border border-gray-700 text-l rounded-md shadow-sm'
                        onChange={(e) => setPrice(parseFloat(e.currentTarget.value))}
                      />
                    </div>
                  </div>

                  <div className='sm:col-span-3'>
                    <label
                      htmlFor='collection-name'
                      className='block text-base font-medium text-black'
                    >
                      Admin Address
                    </label>
                    <div className='mt-1'>
                      <input
                        disabled={true}
                        type='text'
                        name='admin'
                        value={connectedWallet?.walletAddress}
                        className='input inline-flex text-sm font-small h-3 px-1 py-3 w-max-3xl w-full border border-gray-700 text-l rounded-md shadow-sm bg-blue-100'
                      />
                    </div>
                  </div>

                  {/* Correct the formatting for start & end times */}
                  <div className='sm:col-span-3'>
                    <label
                      htmlFor='collection-name'
                      className='block text-base font-medium text-black'
                    >
                      Mint Start Time (optional) {/* Add date/time selection */}
                    </label>
                    <div className='mt-1'>
                      <input
                        type='text'
                        name='startTime'
                        className='input inline-flex text-sm font-small h-3 px-1 py-3 w-max-3xl w-full border border-gray-700 text-l rounded-md shadow-sm'
                        onChange={(e) =>
                          setStartTime(parseInt(e.currentTarget.value))
                        }
                      />
                    </div>
                  </div>

                  <div className='sm:col-span-3'>
                    <label
                      htmlFor='collection-name'
                      className='block text-base font-medium text-black'
                    >
                      Mint End Time (optional) {/* Add date/time selection */}
                    </label>
                    <div className='mt-1'>
                      <input
                        type='text'
                        name='endTime'
                        className='input inline-flex text-sm font-small h-3 px-1 py-3 w-max-3xl w-full border border-gray-700 text-l rounded-md shadow-sm'
                        onChange={(e) =>
                          setEndTime(parseInt(e.currentTarget.value))
                        }
                      />
                    </div>
                  </div>

                  <div className='sm:col-span-3'>
                    <label
                      htmlFor='collection-name'
                      className='block text-base font-medium text-black'
                    >
                      Max Number of Tokens
                    </label>
                    <div className='mt-1'>
                      <input
                        type='text'
                        name='maxTokens'
                        className='input inline-flex text-sm font-small h-3 px-1 py-3 w-max-3xl w-full border border-gray-700 text-l rounded-md shadow-sm'
                        onChange={(e) =>
                          setMaxTokens(parseInt(e.currentTarget.value))
                        }
                      />
                    </div>
                  </div>

                  <div className='sm:col-span-3 justify-center items-center'>
                    <label
                      htmlFor='collection-name'
                      className='block text-base font-medium text-black'
                    >
                      Mint Permissions
                    </label>
                    <div className='mt-1 flex items-center'>
                      <label
                        htmlFor='toggle'
                        className='flex items-center cursor-pointer'
                      >
                        <div className='mr-2 block text-sm font-medium text-gray-700 select-none'>
                          Private
                        </div>
                        {/* Switch Object */}
                        <div className='relative'>
                          <input
                            type='checkbox'
                            name='isPublic'
                            id='toggle'
                            className='sr-only'
                            onChange={(e) => setIsPublic(!isPublic)}
                          />
                          <div className='block bg-gray-500 w-10 h-6 rounded-full'></div>{' '}
                          {/* Switch background */}
                          <div className='dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition'></div>{' '}
                          {/* Dot */}
                        </div>
                        <div className='ml-2 block text-sm font-medium text-gray-700 select-none'>
                          Public
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='items-center justify-center'>
              <button
                className='mr-0 items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-700 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                onClick={() => launchCollection()}
              >
                Launch Collection!
              </button>
            </div>
          </div>
        </div>
      </Page>
    </div>
  )
}

export default ConfigPage
