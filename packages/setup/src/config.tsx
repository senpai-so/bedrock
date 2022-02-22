import { useState } from 'react';
import { ConnectType, useConnectedWallet, useWallet, WalletStatus } from '@terra-money/wallet-provider';
import { ToastContainer } from 'react-toastify';

import { Page } from 'components/Page';
import { InitMsg } from './utils/types';
import { createContract } from './utils/upload';
import { getClient } from './utils/getClient';

function Config() {

  // Config values
  const [name, setName] = useState<string | undefined>();
  const [symbol, setSymbol] = useState<string | undefined>();
  const [price, setPrice] = useState<string | undefined>();
  const [treasuryAddr, setTreasuryAddr] = useState<string | undefined>();
  const [startTime, setStartTime] = useState<number | undefined>();
  const [endTime, setEndTime] = useState<number | undefined>();
  const [maxTokens, setMaxTokens] = useState<number | undefined>();
  const [isPublic, setIsPublic] = useState(false);

  // Wallets
  const { status, connect } = useWallet();
  const connectedWallet = useConnectedWallet();

  const launchCollection = async () => {
    // Safety
    if (status === WalletStatus.WALLET_NOT_CONNECTED || connectedWallet?.connectType !== ConnectType.EXTENSION) {
      connect(ConnectType.EXTENSION);
    }
    if (typeof name === 'undefined' || 
        typeof symbol === 'undefined' || 
        typeof price === 'undefined' ||
        typeof treasuryAddr === 'undefined' ||
        typeof maxTokens === 'undefined'
      ) { return }
  
    if (typeof connectedWallet === 'undefined') return;
  
    // create instantiate message
    const msg: InitMsg = {
      name: name,
      symbol: symbol,
      price: {
        amount: price.concat("000000"),
        denom: 'uluna'
      },
      treasury_account: treasuryAddr,
      start_time: startTime,
      end_time: endTime,
      max_token_count: maxTokens,
      is_mint_public: isPublic,
    }
  
    const lcd = await getClient(/*connectedWallet.network.chainID*/'bombay-12');
    const contractAddr = await createContract(connectedWallet, lcd, msg);
  
    const config = {
      contract_addr: contractAddr,
      chain_id: connectedWallet.network.chainID
    }
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }
  
    fetch("http://localhost:3001/save", requestOptions)
      .then(res => res.json())
      .then(res => {
        console.log("Success!");
        console.log(res);
      })
      .catch(e => console.log(e))
  }

  return (
    <div
      className='h-screen'
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'contain',
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
                <div className='border-gray-200 rounded-lg p-4'>
                  <h2 className='font-bold text-3xl text-blue-700'>
                    {'Configuration'}
                  </h2>

                  <p className='text-base text-gray-700'>
                    { 'Configure your NFT smart contract!' }
                  </p>

                  {/* Entry Fields */}
                  <div className='my-12'>
                    <div className='mt-6 grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6'>

                      <div className='sm:col-span-3'>
                        <label
                          htmlFor='collection-name'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Collection name
                        </label>
                        <div className='mt-1'>
                          <input
                            type='text'
                            name='name'
                            // // placeholder='Collection name'
                            className='shadow-sm h-6 font-small focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md'
                            value={name}
                            onChange={(e) =>
                              setName(e.currentTarget.value)
                            }
                          />
                        </div>
                      </div>
                      
                      <div className='sm:col-span-3'>
                        <label
                          htmlFor='collection-name'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Collection symbol
                        </label>
                        <div className='mt-1'>
                          <input
                            type='text'
                            name='symbol'
                            // placeholder='Collection symbol'
                            className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md'
                            value={symbol}
                            onChange={(e) =>
                              setSymbol(e.currentTarget.value)
                            }
                          />
                        </div>
                      </div>

                      <div className='sm:col-span-3'>
                        <label
                          htmlFor='collection-name'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Price (luna)
                        </label>
                        <div className='mt-1'>
                          <input
                            type='text'
                            name='price'
                            // placeholder='Price'
                            className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md'
                            value={price}
                            onChange={(e) =>
                              setPrice(e.currentTarget.value) // ensure there are commas or non-numeric values
                            }
                          />
                        </div>
                      </div>

                      <div className='sm:col-span-3'>
                        <label
                          htmlFor='collection-name'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Treasury address
                        </label>
                        <div className='mt-1'>
                          <input
                            type='text'
                            name='treasury'
                            // placeholder='Treasury wallet address'
                            className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md'
                            value={treasuryAddr}
                            onChange={(e) =>
                              setTreasuryAddr(e.currentTarget.value)
                            }
                          />
                        </div>
                      </div>

                      {/* Correct the formatting for start & end times */}
                      <div className='sm:col-span-3'>
                        <label
                          htmlFor='collection-name'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Mint start time (optional) {/* Add date/time selection */}
                        </label>
                        <div className='mt-1'>
                          <input
                            type='text'
                            name='startTime'
                            // placeholder='Mint start time'
                            className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md'
                            value={startTime}
                            onChange={(e) =>
                              setStartTime(parseInt(e.currentTarget.value))
                            }
                          />
                        </div>
                      </div>

                      <div className='sm:col-span-3'>
                        <label
                          htmlFor='collection-name'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Mint start time (optional) {/* Add date/time selection */}
                        </label>
                        <div className='mt-1'>
                          <input
                            type='text'
                            name='endTime'
                            // placeholder='Mint end time'
                            className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md'
                            value={endTime}
                            onChange={(e) =>
                              setEndTime(parseInt(e.currentTarget.value))
                            }
                          />
                        </div>
                      </div>

                      <div className='sm:col-span-3'>
                        <label
                          htmlFor='collection-name'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Max number of tokens minted
                        </label>
                        <div className='mt-1'>
                          <input
                            type='text'
                            name='maxTokens'
                            // placeholder='Number of tokens in collection'
                            className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md'
                            value={maxTokens}
                            onChange={(e) =>
                              setMaxTokens(parseInt(e.currentTarget.value))
                            }
                          />
                        </div>
                      </div>

                      <div className='sm:col-span-3'>
                        <label
                          htmlFor='collection-name'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Allow public minting
                        </label>
                        <div className='mt-1'>
                        <input
                          type='checkbox'
                          name='isPublic'
                          // className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md'
                          onChange={(e) => setIsPublic(!isPublic) }
                        />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    className='mintButton inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
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

export default Config;
