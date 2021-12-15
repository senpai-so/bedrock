import React, { useCallback } from 'react'
import { BigNumber } from '@ethersproject/bignumber'

import { Dashboard } from 'components/Dashboard'
import { Notification } from 'components/Notification'
import { CheckoutForm } from 'components/CheckoutForm'

import { ethers } from 'ethers'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import api from 'lib/utils/api-client'

import { User } from 'lib/models'

import { dollarsToCents } from 'lib/utils/currency'

import {
  fetchSpotPrices,
  makeTradeTo,
  makeTradeToRinkeby
} from 'lib/utils/uniswap'

import { makeTradeToV3 } from 'lib/utils/uniswapv3'

import { stake as stakeOHM } from 'lib/utils/olympusDAO'

type PaymentIntent = {
  id: string
  clientSecret: string
}

// TODO unify with swap.ts
type SwapResponse = {
  success: boolean
  error?: string
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'INVALID_KEY'
)

const calculateGasMargin = (value: number) => (value * 120) / 100

const Index: React.FC<{
  session?: User
}> = () => {
  // STATE

  const [currentAccount, setCurrentAccount] = React.useState('')
  const [dollars, setDollars] = React.useState(1.0)
  const [paymentIntent, setPaymentIntent] =
    React.useState<PaymentIntent | null>(null)
  const [showNotification, setShowNotification] = React.useState(false)
  const [notificationTitle, setNotificationTitle] = React.useState('')
  const [notificationText, setNotificationText] = React.useState('')
  const [usdcToOHMPrice, setUSDCToOHMPrice] = React.useState<number | null>(
    null
  )
  const [estimatedGas, setEstimatedGas] = React.useState('')
  const [isStaking, setIsStaking] = React.useState(false)
  const [readyToPay, setReadyToPay] = React.useState(false)
  const [stakingPrompt, setIsStakingPrompt] = React.useState('')

  const connectWallet = useCallback(async () => {
    try {
      const { ethereum } = window as any

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])

      return accounts[0]
    } catch (error) {
      console.log(error)
    }
  }, [])

  const fetchPrice = async () => {
    // Fiat -> ETH
    const token0Price = await fetchSpotPrices()
    setUSDCToOHMPrice(Number(token0Price.toSignificant(6)))
  }

  const calculateGasFees = async (num: number) => {
    // TODO improve this
    if (usdcToOHMPrice && num) {
      const gas = num * 0.0875
      setEstimatedGas(calculateGasMargin(gas).toFixed(2))
    } else {
      setEstimatedGas('')
    }
  }

  const renderStripeForm = () => {
    setReadyToPay(true)
  }

  // fetch payments info
  const fetchPaymentIntent = async (): Promise<PaymentIntent | undefined> => {
    return api
      .post('/paymentIntent', {
        amount: dollarsToCents(dollars)
      })
      .then((res) => res.json())
      .then((data) => {
        return data as PaymentIntent
      })
  }

  // approve swap from our wallet
  const approveSwap = async (): Promise<SwapResponse | undefined> => {
    return api
      .post('/paymentIntent', {
        amount: dollars
      })
      .then((res) => res.json())
      .then((data) => {
        return data as SwapResponse
      })
  }

  // step 1
  const startBuyAndStake = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (dollars === 0) {
      alert(`Minimum purchase is $1`)
      return
    }

    // wait for user to enter credit card details
    fetchPaymentIntent().then((paymentIntent) => {
      setPaymentIntent(paymentIntent || null)
      renderStripeForm()
    })
  }

  // step 2
  const makeTradeUniswap = useCallback(async () => {
    const { ethereum } = window as any

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()

      // recipient wallet for sOHM's post-swap
      await connectWallet()

      // middle-man
      const ourWallet = '0x0da6D1Ace9905f4C7b21a719EfeA88ea0eDa1064' // Jim's Main Metamask Wallet
      // const ourWallet = '0x3b5F735966c029FF5a6ab2a14FD01ca67345893f' // Jim's Test Metamask Wallet
      await approveSwap()

      // TODO swap to OHM using our pre-bought USDC tokens
      console.log(`Swapping into account ${currentAccount}`)
      setIsStakingPrompt('Performing swap...')

      // const res = await makeTradeTo(dollars, ourTestWallet, signer)
      const res = await makeTradeToRinkeby(dollars, ourWallet, signer)
      console.log(res)

      // wait for transaction to finish
      setIsStakingPrompt('Waiting for transaction to settle')
    }
  }, [approveSwap, connectWallet, currentAccount, dollars])

  // step 2
  const stake = async () => {
    try {
      const { ethereum } = window as any

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      console.log('Staking OHM...')
      setIsStakingPrompt('Staking OHM')

      const _value = 0.1
      const value = _value.toString()
      const provider = new ethers.providers.Web3Provider(ethereum)
      const address = await provider.getSigner().getAddress()

      stakeOHM({ value, provider, address })
    } catch (error) {
      console.log(error)
    }
  }

  // step 4
  const transferBackToSender = async () => {
    // TODO issue a transaction back to the sender
    // How do we sign transaction without asking for approval?
    setIsStakingPrompt('Receiving staking rewards')
  }

  // CALLBACKS

  const stripeOnSuccess = useCallback(async () => {
    if (isStaking) {
      return
    }

    setIsStaking(true)

    await makeTradeUniswap()

    await stake()

    await transferBackToSender()
  }, [isStaking, makeTradeUniswap])

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.currentTarget.value)

    if (!isNaN(num)) {
      setDollars(num)
      calculateGasFees(num)
    } else {
      setEstimatedGas('')
    }
  }

  return (
    <Dashboard>
      <div className='bg-white max-w-xl mx-auto rounded-3xl shadow-2xl px-5 py-6 sm:px-6'>
        <div className='border-gray-200 rounded-lg p-4'>
          <h2
            id='applicant-information-title'
            className='text-3xl font-medium text-gray-700'
          >
            One-click staking
          </h2>

          <p className='mt-1 pb-4 font-medium text-gray-500 uppercase'>
            Fiat On-ramp
          </p>

          <div className='flex flex-col sm:flex-row sm:space-x-4'>
            <div
              className='rounded-2xl bg-indigo-100 px-4 py-4 border-0 mt-4 text-lg cursor-pointer'
              onClick={fetchPrice}
            >
              <h4 className='font-bold'>
                <b className='mr-2'>⚡️</b>OHM
              </h4>
            </div>

            <div className='rounded-2xl bg-green-100 px-5 py-4 border-0 mt-4 cursor-pointer'>
              <h4 className='font-bold'>
                {' '}
                <b className='mr-2'>🕛</b>TIME
              </h4>
            </div>

            <div className='rounded-2xl bg-yellow-200 px-5 py-4 border-0 mt-4 cursor-pointer'>
              <h4 className='font-bold'>
                {' '}
                <b className='mr-2'>🌔</b>LUNA
              </h4>
            </div>
          </div>

          {usdcToOHMPrice !== null && (
            <>
              <div className='flex flex-col sm:space-y-2 mt-4'>
                <div>
                  <p className='mt-4 font-medium text-gray-500'>
                    Set amount you want to buy
                  </p>
                </div>

                <div className='rounded-2xl bg-gray-50 px-4 py-4 border-2 border-gray-100 mt-4 text-lg cursor-pointer'>
                  <div className='flex flex-row font-lg'>
                    <div className='flex-initial'>
                      <b className='mr-2'>💵</b>USD
                    </div>

                    <div className='flex-grow text-right text-2xl'>
                      <input
                        className='text-right bg-transparent text-gray-700 focus:outline-none'
                        placeholder='0.00'
                        onChange={handleUSDChange}
                      ></input>
                    </div>
                  </div>
                </div>

                <div className='rounded-2xl bg-gray-50 px-4 py-4 border-2 border-gray-100 mt-4 text-lg cursor-pointer'>
                  <div className='flex flex-row font-lg'>
                    <div className='flex-initial'>
                      <b className='mr-2'>⚡️</b>
                      OHM
                    </div>

                    <div className='flex-grow text-right text-2xl font-bold'>
                      <input
                        className='text-right text-purple-500 bg-transparent focus:outline-none'
                        value={(dollars * usdcToOHMPrice).toFixed(6)}
                        readOnly
                      ></input>
                      <p className='text-gray-400 text-xs'>
                        Rounded to 6 decimals
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {estimatedGas != '' && (
                <p className='text-indigo-400 text-xs italic font-medium mt-4'>
                  Est. total gas: ${estimatedGas} USD. Total ~$
                  {(Number(dollars) + Number(estimatedGas)).toFixed(2)}
                </p>
              )}
            </>
          )}

          {usdcToOHMPrice !== null && !readyToPay && (
            <div className='mt-4'>
              <button
                className='rounded-xl bg-indigo-500 font-bold text-white px-5 py-4 border-0 mt-4 cursor-pointer'
                onClick={startBuyAndStake}
              >
                Buy and stake
              </button>
            </div>
          )}

          {usdcToOHMPrice !== null &&
            readyToPay &&
            paymentIntent?.clientSecret &&
            !isStaking && (
              <div className='flex items-left mt-4 pt-0 justify-end rounded-b'>
                <div className='w-full'>
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      clientSecret={paymentIntent.clientSecret}
                      successCallback={stripeOnSuccess}
                    />
                  </Elements>
                </div>
              </div>
            )}

          {usdcToOHMPrice !== null && stakingPrompt && (
            <div className='mt-4'>
              <button
                className='rounded-xl bg-indigo-500 font-bold text-white px-5 py-4 border-0 mt-4 cursor-pointer'
                onClick={startBuyAndStake}
              >
                {stakingPrompt}
              </button>
            </div>
          )}
        </div>
      </div>

      <Notification title={notificationTitle} text={notificationText} />
    </Dashboard>
  )
}

export default Index
