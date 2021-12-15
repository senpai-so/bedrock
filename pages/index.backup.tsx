import React from 'react'
import Router from 'next/router'
import cs from 'classnames'

import { Dashboard } from 'components/Dashboard'
import { Notification } from 'components/Notification'

import { ethers } from 'ethers'

import themisMultiSig from 'eth/artifacts/contracts/ThemisMultiSig.sol/ThemisMultiSig.json'
import { Asset, User } from 'lib/models'

import { fetchOrSetTempWill, updateTempWill } from 'lib/utils/cookies'

import { createAsset } from 'lib/models'
import { sign } from 'crypto'

const Index: React.FC<{
  session: User
}> = ({ session }) => {
  // TODO state
  const [currentAccount, setCurrentAccount] = React.useState('')
  const [assetName, setAssetName] = React.useState(
    'Asset Access Instruction Notes #1'
  )
  const [assetSecret, setAssetSecret] = React.useState('')
  const [assetValue, setAssetValue] = React.useState('')

  const [showNotification, setShowNotification] = React.useState(false)
  const [notificationText, setNotificationText] = React.useState('')

  const [recipientAccount, setRecipientAccount] = React.useState('')

  const [contractAddress, setContractAddress] = React.useState('')

  const [canMoveOn, setCanMoveOn] = React.useState(false)

  const getChainName = async () => {
    try {
      const { ethereum } = window as any

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum)
        const { chainId } = await provider.getNetwork()
        if (chainId === 1) {
          return 'mainnet'
        } else if (
          chainId === 3 ||
          chainId === 4 ||
          chainId === 5 ||
          chainId === 6 ||
          chainId === 9
        ) {
          return 'testnet'
        } else {
          return 'local'
        }
      } else {
        return 'local'
      }
    } catch (error) {
      return 'local'
    }
  }

  const saveTempState = async () => {
    const will = fetchOrSetTempWill()
    const chainName = await getChainName()
    let asset = undefined

    if (currentAccount && assetName && assetSecret) {
      asset = createAsset(
        // Trackable
        {
          assetName: assetName,
          contractAddress: contractAddress,
          chainName: chainName,
          recipientAddress: recipientAccount
        },
        // Asset data
        assetValue
      )
    }
    if (typeof asset !== 'undefined') will.assets.push(asset)

    updateTempWill(will)
  }

  const handleNext = async (url: string) => {
    await saveTempState()
    Router.push(url)
  }

  const renderForm = () => renderCreateForm()

  const notify = (text: string) => {
    setNotificationText(text)
    setShowNotification(true)
  }

  // Callback to mint a new contract
  const createThemisContract = async (e: any | undefined) => {
    if (e) e.preventDefault()

    try {
      const { ethereum } = window as any

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const factory = new ethers.ContractFactory(
          themisMultiSig.abi,
          themisMultiSig.bytecode,
          signer
        )
        console.log('Minting contract: %s', themisMultiSig.contractName)
        console.log(themisMultiSig.abi)

        try {
          // threshold: int, owners: string[], chainId: int, payload: string
          const threshold = 1
          const owner = await signer.getAddress() // TODO: Change to beneficiaries
          const { chainId } = await provider.getNetwork()
          console.log('Got network')
          const payload = assetSecret
          const contract = await factory.deploy(
            threshold,
            [owner],
            chainId,
            payload
          )
          console.log('Deploying contract...')

          await contract.deployTransaction.wait()
          console.log('Contract created', contract.address, contract)

          // success
          if (contract.address) {
            setContractAddress(contract.address)
            notify(`Contract created at ${contract.address}`)

            // await updateThemisContractAt(contract.address)
          }
        } catch (error) {
          console.log(error)
        }
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Updates assetSecret or recipient if user specifies
  const updateThemisContractAt = async (address: string) => {
    try {
      const { ethereum } = window as any

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(
          address,
          themisMultiSig.abi,
          signer
        )

        console.log('Going to pop wallet now to pay gas...')

        if (assetSecret) {
          console.log(`Mining secrets update at ${address}...please wait.`)
          const nftTxn = await connectedContract.updatePayload(assetSecret)
          await nftTxn.wait()
          console.log(nftTxn)
          console.log(
            `Updated, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
          )
          notify(
            `Updated, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
          )
        }

        if (recipientAccount) {
          console.log('Mining update to recipient address...please wait.')
          const nftTxn1 = await connectedContract.updateRecipient(
            recipientAccount
          )
          await nftTxn1.wait()
          console.log(nftTxn1)
          console.log(
            `Updated, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn1.hash}`
          )
          notify(
            `Updated, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn1.hash}`
          )
        }
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const renderCreateForm = () => (
    <>
      <form className='space-y-8 divide-y divide-gray-200'>
        <div className='space-y-8 divide-y divide-gray-200'>
          <div>
            <p className='text-sm font-normal text-blue-500'>
              Great! Your wallet's connected. Now let's store your secrets.
            </p>

            <div className='mt-4'>
              <h3
                className={cs(
                  'text-lg leading-6 font-medium',
                  assetName.length === 0 ? 'text-gray-200' : 'text-gray-900'
                )}
              >
                {assetName.length > 0 ? assetName : 'Enter Name'}
              </h3>
            </div>

            <div className='mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6'>
              <div className='sm:col-span-4'>
                <label
                  htmlFor='assetName'
                  className='block text-sm font-medium text-gray-700'
                >
                  <span className='mr-2'>📃 </span>Name
                </label>

                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='assetName'
                    id='assetName'
                    autoComplete='assetName'
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className='flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300'
                  />
                </div>

                <p className='mt-1 text-sm text-gray-500'>
                  Official asset name on your will. Please make this a
                  meaningful name.
                </p>
              </div>

              <div className='sm:col-span-6'>
                <label
                  htmlFor='assetSecret'
                  className='block text-sm font-medium text-gray-700'
                >
                  <span className='mr-2'>🤫</span> Secret Note
                </label>
                <div className='mt-1'>
                  <textarea
                    id='assetSecret'
                    name='assetSecret'
                    rows={3}
                    cols={20}
                    // value={assetSecret
                    //   .split('')
                    //   .map(() => '*')
                    //   .join('')}
                    value={assetSecret}
                    style={{ height: 300 }}
                    placeholder={`Paste in instructions on how to recover your will. This is usually a public wallet address, recovery passphrase, login info, etc.

e.g.
Metamask
--------------------
Address: 0x039F0dgls1369e88F6F4ce6a98827279cGGkb92265
Passphrase: wonder fox beach dog ...

Phantom (NFT)
--------------------
Address: 0x493xd...
Passphrase: france height auburn sweet ...

`}
                    onChange={(e) => setAssetSecret(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md'
                  />
                </div>
              </div>

              <div className='sm:col-span-2'>
                <label
                  htmlFor='assetValue'
                  className='block text-sm font-medium text-gray-700'
                >
                  Est. Assets Value
                </label>
                <div className='mt-1'>
                  <input
                    type='text'
                    id='assetValue'
                    name='assetValue'
                    value={assetValue}
                    placeholder='e.g. 30 ETH'
                    onChange={(e) => setAssetValue(e.target.value)}
                    className='flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300'
                  />
                </div>
                <p className='mt-2 text-sm text-gray-500'>
                  Underlying current FMV of assets, and coin or denomination (if
                  USD, just enter the number)
                </p>
              </div>

              {/* <div className='sm:col-span-3'>
                <label
                  htmlFor='recipientAddress'
                  className='block text-sm font-medium text-gray-700'
                >
                  <span className='mr-4'>💳</span> Recipient Address (optional)
                </label>
                <div className='mt-1 flex rounded-md shadow-sm'>
                  <input
                    type='text'
                    name='recipientAddress'
                    id='recipientAddress'
                    placeholder='0x...'
                    autoComplete='recipientAddress'
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value.trim())}
                    className='flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300'
                  />
                </div>
                <p className='mt-2 text-sm text-gray-500'>
                  The wallet of the recipient of these assets. If specified,
                  this recipient will be able to unlock and view assets once the
                  user is deemed incapacitated.
                </p>
              </div>  */}
            </div>
          </div>

          <div className='pt-8'>
            <div>
              <h3 className='text-lg leading-6 font-medium text-gray-900'>
                Notifications
              </h3>

              <p className='mt-1 text-sm text-gray-500'>
                How would you like to be notified? We need to be able to reach
                you from time to time to prove that you own the assets.
              </p>
            </div>

            <div className='mt-6'>
              <fieldset>
                <div className='space-y-4'>
                  <div className='relative flex items-start'>
                    <div className='flex items-center h-5'>
                      <input
                        id='comments'
                        name='comments'
                        type='checkbox'
                        className='focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded'
                      />
                    </div>
                    <div className='ml-3 text-sm'>
                      <label
                        htmlFor='comments'
                        className='font-medium text-gray-700'
                      >
                        Via email
                      </label>
                      <p className='text-gray-500'>
                        (Default) Get notified via email. If you get locked out
                        from your email, you can reset your email via our site.
                        <br />
                        Note: Resetting is a decentralized process and requires
                        gas fees.
                      </p>
                    </div>
                  </div>

                  <div className='relative flex items-start'>
                    <div className='flex items-center h-5'>
                      <input
                        id='candidates'
                        name='candidates'
                        type='checkbox'
                        className='focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded'
                      />
                    </div>
                    <div className='ml-3 text-sm'>
                      <label
                        htmlFor='candidates'
                        className='font-medium text-gray-700'
                      >
                        Via text message
                      </label>
                      <p className='text-gray-500'>
                        Receive text messages and reply to acknowledge. You can
                        always update your number
                      </p>
                    </div>
                  </div>

                  <div className='relative flex items-start'>
                    <div className='flex items-center h-5'>
                      <input
                        id='offers'
                        name='offers'
                        type='checkbox'
                        className='focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded'
                      />
                    </div>
                    <div className='ml-3 text-sm'>
                      <label
                        htmlFor='offers'
                        className='font-medium text-gray-700'
                      >
                        Via Telegram / Signal / Whatsapp / Messenger / Discord
                      </label>
                      <p className='text-gray-500'>
                        Receive notifications via Telegram, Messenger, or an app
                        of your choice. We support all the major messenger apps.
                        <span className='text-gray-500 italic'>
                          <br />
                          If you select this, make sure you set your usernames
                          in your profile later
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        <div className='pt-5'>
          <div className='flex justify-start space-x-4 flex-col md:flex-row'>
            <button
              type='submit'
              onClick={async (e) => {
                await createThemisContract(e)
                setCanMoveOn(true)
              }}
              className='ml-3 inline-flex justify-center py-2 px-4 border border-gray-200 shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            >
              Mint
            </button>

            <p className='italic text-sm align-baseline mt-2 text-gray-500'>
              Requires gas fees. Note: to reduce gas fees,{' '}
              <a
                href='https://cryptomarketpool.com/deploy-a-smart-contract-to-the-polygon-network/'
                className='text-indigo-600 hover:underline'
              >
                follow this guide to mint on Polygon instead of on Mainnet.
              </a>{' '}
            </p>
          </div>
        </div>
      </form>
    </>
  )

  const goToExchange = () => {
    Router.push('https://coinbase.com')
  }

  const renderNotConnectedContainer = () => (
    <div>
      <h2
        id='applicant-information-title'
        className='text-lg leading-6 font-medium text-gray-900'
      >
        Start by connecting your wallet.
      </h2>

      <p className='mt-1 text-sm text-gray-500'>
        You will need a Metamask wallet. If you don't have one,{' '}
        <a
          className='text-blue-500'
          href='https://metamask.io/'
          target='_blank'
          rel='noreferrer'
        >
          follow instructions to create one.
        </a>
      </p>

      <div className='space-x-6 pt-6'>
        <button
          onClick={connectWallet}
          className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-2xl shadow-sm text-gray-900 bg-gray-100 '
        >
          Connect Metamask
        </button>

        {/* <button
          onClick={goToExchange}
          className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          🔑 Connect Coinbase
        </button>
 */}
        {/* <button
          onClick={goToExchange}
          className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300'
        >
          FTX (coming soon!)
        </button>

        <button
          onClick={goToExchange}
          className='inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400'
        >
          Polkadot (coming soon!)
        </button> */}
      </div>
    </div>
  )

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window as any

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(
          contractAddress,
          themisMultiSig.abi,
          signer
        )

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        // connectedContract.on("NewEpicNFTMinted", async (from, tokenId) => {
        //   console.log(from, tokenId.toNumber())
        //   const counter = await connectedContract.getTotalNFTsMintedSoFar()
        //   alert(`Hey there! We've minted ${counter}/${15} NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        // });

        connectedContract.on('ContractCreated', async (address) => {
          alert(`Contract has been created at ${address}`)
        })

        connectedContract.on('ContractUpdated', async (recipient) => {
          alert(`Contract has been updated with new recipient! ${recipient}`)
        })

        // connectedThemis.on("ContractUnlocked", async (recipient) => {
        //   console.log(recipient)
        //   alert(`Contract has been unlocked!`)
        // });

        console.log('Setup event listener!')
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupCurrentData = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window as any

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        // short circuit if address not specified
        if (!contractAddress) {
          console.log('No contract address found')
          return
        }

        const connectedContract = new ethers.Contract(
          contractAddress,
          themisMultiSig.abi,
          signer
        )

        // Broken for now in multisig
        // const curassetSecret = await connectedContract.unlock()
        // console.log('curassetSecret', curassetSecret)
        // if (curassetSecret) {
        //   setAssetSecret(curassetSecret)
        // }

        // console.log('Setting up current data')
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupCurrentDataDeferred = async (address: string) => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window as any

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        // short circuit if address not specified
        if (!address) {
          console.log('No contract address found')
          return
        }

        const connectedContract = new ethers.Contract(
          address,
          themisMultiSig.abi,
          signer
        )

        const curassetSecret = await connectedContract.unlock()
        console.log('curassetSecret', curassetSecret)
        if (curassetSecret) {
          setAssetSecret(curassetSecret)
        }

        console.log('Setting up current data')
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async (e: any) => {
    e.preventDefault()

    try {
      const { ethereum } = window as any

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      if (contractAddress) {
        setupEventListener()
        // setupCurrentData()
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Fiat -> OHM = FIAT --(Exchange)--> ETH --(Swap)--> OHM --(Approve, Stake)
  const stakeOHM = async () => {
    // Fiat -> ETH
    const wallet = ''
  }

  return (
    <Dashboard>
      <div className='bg-white max-w-xl mx-auto rounded-3xl shadow-2xl px-5 py-6 sm:px-6'>
        <div className='border-gray-200 rounded-lg p-4'>
          <h2
            id='applicant-information-title'
            className='text-lg leading-6 font-medium text-gray-900'
          >
            Demo
          </h2>

          <p className='mt-1 pb-4 font-medium text-gray-500'>Fiat On-ramp</p>

          <div className='flex flex-col sm:flex-row sm:space-x-4'>
            <div
              className='rounded-2xl bg-indigo-100 px-4 py-4 border-0 mt-4 text-lg cursor-pointer'
              onClick={stakeOHM}
            >
              <h4 className='font-bold'>
                <b className='mr-2'>🪙</b>OHM
              </h4>
            </div>

            <div className='rounded-2xl bg-green-100 px-5 py-4 border-0 mt-4 cursor-pointer'>
              <h4 className='font-bold'>
                {' '}
                <b className='mr-2'>⚡️</b>TIME
              </h4>
            </div>
          </div>

          <div className='pt-8'>
            {currentAccount === ''
              ? renderNotConnectedContainer()
              : renderForm()}
          </div>
          {canMoveOn && <div className='pt-8'></div>}
        </div>
      </div>

      {showNotification && (
        <Notification text={notificationText} afterHook={setShowNotification} />
      )}
    </Dashboard>
  )
}

export default Index
