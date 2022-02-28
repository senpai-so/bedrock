import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { Page } from './components/Page';

import { getFiles } from './utils/ipfs';
import { ConnectType, useWallet, WalletStatus } from '@terra-money/wallet-provider';


function CIDPage() {
  const [cid, setCid] = useState<string | undefined>();
  const { status, connect, disconnect } = useWallet();
  const navigate = useNavigate();

  // disconnect()

  const submitCid = async () => {
    if (typeof cid === 'undefined') {
      toast.warn("Please enter a valid CID from IPFS");
      return
    };
    const toastLoadingId = toast.loading('Getting token data...');
    const files = await getFiles(cid);
    toast.dismiss(toastLoadingId);
    const toastSuccessId = toast.success("Success :)");
    const assets = files.map(file => file.name).filter(file => !file.includes(".json"));
    console.log(assets)
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid: cid, assets: assets})
    }

    fetch("http://localhost:3001/saveCid", requestOptions)
      .then(res => res.json())
      .then(res => {
        console.log("Success!");
        console.log(res);
      })
      .catch(e => console.log(e));
    toast.dismiss(toastSuccessId);
    navigate('/config');
  }
  
  return (
    <div
      className='h-screen'
      style={{
        // width: '100%',
        // height: '100%',
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
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
                { status === WalletStatus.WALLET_NOT_CONNECTED ? (
                    <div className='flex flex-col items-center justify-center space-y-4'>
                      <div className='flex flex-col items-center justify-center border-gray-200 rounded-lg p-4'>
                        <h2 className='font-bold text-center text-3xl text-blue-700'>
                          Configuration
                        </h2>

                        <p className='text-base font-medium text-center text-gray-700'>
                          Configure your NFT smart contract!
                        </p>
                      </div>
                      <div className='items-center justify-center'>
                        <button
                          className='mr-0 items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-700 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          onClick={() => connect(ConnectType.EXTENSION)}
                        >
                          Connect Wallet
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center space-y-8'>

                      <div className='flex flex-col items-center justify-center'>
                        <h2 className='font-bold text-center text-3xl text-blue-700'>
                          {'Getting Started'}
                        </h2>

                        <p className='text-base text-center text-gray-700 mt-2'>
                          { 'Paste the IPFS CID for your assets below to get started!' }
                        </p>
                      </div>
                      
                      <input
                        type='text'
                        className='input inline-flex px-3 py-3 w-max-3xl w-9/12 border border-blue-700 text-l rounded-xl shadow-sm'
                        placeholder='IPFS CID'
                        onChange={(e) =>
                          setCid(e.currentTarget.value)
                        }
                      />

                      <button
                        className='inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        onClick={() => submitCid()}
                      >
                        Sync!
                      </button>
                    </div>
                  )}
              </div>
            </div>
      </Page>
    </div>
  )
}

export default CIDPage;
