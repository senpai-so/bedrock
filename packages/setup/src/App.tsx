import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { Page } from './components/Page';

import { getFiles } from './utils/ipfs';


function App() {
  // cid values
  const [cid, setCid] = useState<string | undefined>();
  const navigate = useNavigate();

  const submitCid = async () => {
    if (typeof cid === 'undefined') return;
    // const toastLoadingId = toast.loading('Getting token data...');
    const files = await getFiles(cid);
    // toast.dismiss(toastLoadingId);
    // const toastSuccessId = toast.success("Success :)");
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
    
    navigate('/config');
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
                <div className='flex flex-col items-center justify-center space-y-12'>
                  <h2 className='font-bold text-3xl text-blue-700'>
                    {'Getting Started'}
                  </h2>

                  <p className='text-base text-gray-700'>
                    { 'Paste the IPFS CID for your assets below to get started!' }
                  </p>

                  <input
                    type='text'
                    className='input inline-flex px-3 py-3 w-max-3xl w-auto border border-blue-700 text-l rounded-xl shadow-sm'
                    value={cid}
                    placeholder='IPFS CID'
                    onChange={(e) =>
                      setCid(e.currentTarget.value)
                    }
                  />

                  <button
                    className='mintButton inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    onClick={() => submitCid()}
                  >
                    Sync!
                  </button>
                </div>
              </div>
            </div>
      </Page>
    </div>
  )
}

export default App;
