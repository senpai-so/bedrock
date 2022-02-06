import { useRef, useState } from 'react';
import cs from 'classnames';
import { ConnectType, useConnectedWallet, useWallet } from '@terra-money/wallet-provider';

import { Page } from './components/Page';
import { InitMsg } from 'types';
import { createContract } from 'web3/upload';
import { getClient } from './web3/getClient';

import { } from '@terra-money/terra.js';

// import { ToastContainer } from 'react-toastify';


function App() {
  // cid values
  const [tokens, setFiles] = useState<FileList>();
  const [cid, setCid] = useState("");

  // Config values
  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [treasuryAddr, setTreasuryAddr] = useState<string>("");
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const [endTime, setEndTime] = useState<number | undefined>(undefined);
  const [maxTokens, setMaxTokens] = useState(0);
  const [isPublic, setIsPublic] = useState(false);

  // State trackers
  const [isCidComplete, setIsCidComplete] = useState(false);
  const [isConfigComplete, setIsConfigComplete] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const wallet = useWallet();
  const connectedWallet = useConnectedWallet();
  // const api = express();

  const cidView = () => {
    return (
      <div>
        <h2 className='font-bold text-3xl text-blue-700'>
          {'Getting Started'}
        </h2>

        <p className='text-base text-gray-700'>
          { 'Paste the IPFS CID for your assets below to get started!' }
        </p>

        <input
          type='text'
          
          className={cs(
            'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md'
          )}
          value={cid}
          onChange={(e) =>
            setCid(e.currentTarget.value)
          }
        />

        <button
          className='mintButton inline-flex items-center px-6 py-3 border border-transparent text-xl font-medium rounded-2xl shadow-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          onClick={() => setIsCidComplete(true)}
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
          placeholder='Maximum number of tokens that can be minted'
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
    wallet.connect(ConnectType.EXTENSION);

    // create instantiate message
    const msg: InitMsg = {
      name: name,
      symbol: symbol,
      price: {
        amount: price.concat("000000"), // hacky solution
        denom: 'uluna'
      },
      treasury_account: treasuryAddr,
      start_time: startTime,
      end_time: endTime,
      max_token_count: maxTokens,
      is_mint_public: isPublic,
    }
    if (typeof connectedWallet === 'undefined') return;

    const lcd = await getClient('testnet');
    const contractAddr = await createContract(connectedWallet, lcd, msg);

    const config = {
      cid: cid,
      contract_addr: contractAddr,
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }

    fetch("http://localhost:3001/save", requestOptions)
      .then(res => res.json())
      .then(res => {
        setIsComplete(true);
        console.log("Success!");
        console.log(res);
      })
      .catch(e => console.log(e))
  }
  
  return (
    <div
      className={cs('flex h-full bg-gray')}
      // style={{
      //   // backgroundImage: 'url(/background.png)',
      //   // backgroundColor: 'gray',
      //   backgroundSize: 'cover',
      //   height: '100vh'
      // }}
    >
      <Page
        title='testing'
        subtitle='smaller'
      >
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
