import { useState } from 'react';
import cs from 'classnames';
import { ConnectType, useConnectedWallet, useWallet, WalletStatus } from '@terra-money/wallet-provider';
import { toast, ToastContainer } from 'react-toastify';

import { Page } from './components/Page';
import { InitMsg } from './utils/types';
import { createContract } from './utils/upload';
import { getClient } from './utils/getClient';
import { getFiles, parseFiles } from './utils/ipfs';


function App() {
  // cid values
  const [cid, setCid] = useState<string | undefined>();
  const [assets, setAssets] = useState<string[]>([]);

  // Config values
  const [name, setName] = useState<string | undefined>();
  const [symbol, setSymbol] = useState<string | undefined>();
  const [price, setPrice] = useState<string | undefined>();
  const [treasuryAddr, setTreasuryAddr] = useState<string | undefined>();
  const [startTime, setStartTime] = useState<number | undefined>();
  const [endTime, setEndTime] = useState<number | undefined>();
  const [maxTokens, setMaxTokens] = useState<number | undefined>();
  const [isPublic, setIsPublic] = useState(false);

  // State trackers
  const [isCidComplete, setIsCidComplete] = useState(false);
  const [isConfigComplete, setIsConfigComplete] = useState(false);

  const { status, connect, disconnect} = useWallet();
  const connectedWallet = useConnectedWallet();

  const submitCid = async () => {
    if (typeof cid === 'undefined') return;
    // const toastLoadingId = toast.loading('Getting token data...');
    const files = await getFiles(cid);
    // toast.dismiss(toastLoadingId);
    // const toastSuccessId = toast.success("Success :)");
    setAssets(parseFiles(files));
    setIsCidComplete(true);
  }

  const cidView = () => {
    return (
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
    )
  }

  const configView = () => {
    return (
      <div>
        <h2 className='font-bold text-3xl text-blue-700'>
          {'Configuration'}
        </h2>

        <p className='text-base text-gray-700'>
          { 'Configure your NFT smart contract!' }
        </p>

        {/* Entry Fields */}
        <input
          type='text'
          name='name'
          placeholder='Collection name'
          className={cs(
            'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
          )}
          value={name}
          onChange={(e) =>
            setName(e.currentTarget.value)
          }
        />
        <input
          type='text'
          name='symbol'
          placeholder='Collection symbol'
          className={cs(
            'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
          )}
          value={symbol}
          onChange={(e) =>
            setSymbol(e.currentTarget.value)
          }
        />

        <input
          type='text'
          name='price'
          placeholder='Price (in luna)'
          className={cs(
            'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
          )}
          value={price}
          onChange={(e) =>
            setPrice(e.currentTarget.value) // ensure there are commas or non-numeric values
          }
        />

        <input
          type='text'
          name='treasury'
          placeholder='Treasury wallet address'
          className={cs(
            'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
          )}
          value={treasuryAddr}
          onChange={(e) =>
            setTreasuryAddr(e.currentTarget.value)
          }
        />

        {/* Correct the formatting for start & end times */}
        <input
          type='text'
          name='startTime'
          placeholder='Mint start time (optional)'
          className={cs(
            'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
          )}
          value={startTime}
          onChange={(e) =>
            setStartTime(parseInt(e.currentTarget.value))
          }
        />
        <input
          type='text'
          name='endTime'
          placeholder='Mint end time (optional)'
          className={cs(
            'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
          )}
          value={endTime}
          onChange={(e) =>
            setEndTime(parseInt(e.currentTarget.value))
          }
        />

        <input
          type='text'
          name='maxTokens'
          placeholder='Number of tokens in collection'
          className={cs(
            'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
          )}
          value={maxTokens}
          onChange={(e) =>
            setMaxTokens(parseInt(e.currentTarget.value))
          }
        />

        <input
          type='checkbox'
          name='isPublic'
          className={cs(
            'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
          )}
          onChange={(e) =>
            setIsPublic(!isPublic)
          }
        />

        <button
          className='mintButton inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          onClick={() => launchCollection()}
        >
          Launch Collection!
        </button>
      </div>
    )
  }

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
      cid: cid,
      contract_addr: contractAddr,
      assets: assets,
      chainId: connectedWallet.network.chainID
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
            <div className='bg-white max-w-xl mx-auto rounded-3xl shadow-2xl px-5 py-12'>
              <div className='flex flex-col items-center justify-center space-y-4'>
                { !isCidComplete && cidView() } {/* Collect CID */} 
                { isCidComplete && !isConfigComplete && configView() } {/* Collect config info */} 
              </div>
            </div>
      </Page>
    </div>
  )
}

export default App;
