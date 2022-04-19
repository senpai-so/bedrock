import { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import {
  ConnectType,
  useWallet,
  WalletStatus
} from '@terra-money/wallet-provider'

function CIDPage() {
  const [cid, setCid] = useState<string | undefined>()
  const [tokenCount, setTokenCount] = useState<number | undefined>()
  const [fileExt, setFileExt] = useState<string | undefined>()
  const { status, connect } = useWallet()
  const navigate = useNavigate()

  const canSubmit = () => {
    let success = true
    if (!cid) {
      toast.warn('Please enter a valid CID from IPFS')
      success = false
    }
    if (!tokenCount || tokenCount <= 0) {
      toast.warn('Number of NFTs must be larger than 0')
      success = false
    }
    if (!fileExt || !['.jpg', '.jpeg', '.png'].includes(fileExt)) {
      toast.warn('File extension must be \".jpg\", \".jpeg\", or \".png\"')
      success = false
    }
    return success
  }

  const submitCid = async () => {
    if (!canSubmit()) {
      return
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid: cid, tokenCount: tokenCount, fileExt: fileExt })
    }

    fetch('http://localhost:3001/saveCid', requestOptions)
      .then((res) => res.json())
      .then((res) => {
        console.log('Success!')
        console.log(res)
      })
      .catch((e) => console.log(e))
    navigate('/config')
  }

  return (
    <div
      className='flex items-center justify-center py-12'
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        minHeight: '100vh',
        width: '100%'
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
      <div className='flex-grow bg-white max-w-xl w-max rounded-3xl shadow-2xl px-5 py-12'>
        <div className='flex flex-col items-center justify-center space-y-4'>
          {status === WalletStatus.WALLET_NOT_CONNECTED ? (
            <div className='flex flex-col items-center justify-center space-y-4'>
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

                <p className='text-lg text-center text-gray-700 mt-2'>
                  {'Enter your CID from Pinata, number of possible NFTs, and the file extension for your images below.'}
                </p>
              </div>

              <div className='flex flex-col items-center justify-center max-w-xl w-2/3 space-y-4'>
                <div className='w-full'>
                <label
                    htmlFor='extension'
                    className='block text-lg font-medium text-black'
                  >
                    IPFS CID
                  </label>
                  <input 
                    type='text'
                    name='cid'
                    className='input px-3 py-3 w-full border border-blue-700 text-m rounded-xl shadow-sm'
                    placeholder='QmV96Ynup4XtJm2CKhky97nFzyCQU3Ryo4kLfj69edMnk2'
                    onChange={(e) => setCid(e.currentTarget.value)}
                  />
                </div>

                <div className='w-full'>
                  <label
                    htmlFor='nftCount'
                    className='block text-lg font-medium text-black'
                  >
                    NFT Count 
                  </label>
                  <input 
                    type='number'
                    name='nftCount'
                    className='input px-3 py-3 w-full border border-blue-700 text-m rounded-xl shadow-sm'
                    placeholder='0'
                    onChange={(e) => setTokenCount(parseInt(e.currentTarget.value))}
                  />
                </div>

                <div className='w-full'>
                  <label
                    htmlFor='extension'
                    className='block text-lg font-medium text-black'
                  >
                    Image File Extension 
                  </label>
                  <input
                    type='text'
                    name='extension'
                    className='input px-3 py-3 w-full border border-blue-700 text-m rounded-xl shadow-sm'
                    placeholder='.jpg, .jpeg, .png'
                    onChange={(e) => setFileExt(e.currentTarget.value)}
                  />
                </div>
              </div>

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
    </div>
  )
}

export default CIDPage
