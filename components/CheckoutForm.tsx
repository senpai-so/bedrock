import React, { FormEvent, useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Stripe from '@stripe/stripe-js'
import { useEffect } from 'react'

type Props = {
  clientSecret: string
  successCallback: () => void
  buttonPrompt?: string
}

function userFriendlyStripeMessage(stripeError: Stripe.StripeError): string {
  if (stripeError.message) return stripeError.message
  return 'An error happened with processing, please try again or contact support@senpai.so'
}

export const CheckoutForm: React.FC<Props> = ({
  clientSecret,
  successCallback,
  buttonPrompt = 'Buy and stake'
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [inProgress, setInProgress] = useState(false)
  const [checkoutError, setCheckoutError] = useState()
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  const handleSubmit = React.useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      // ensure user doesn't double-submit from ui
      if (inProgress) return
      else setInProgress(true)

      if (stripe && elements && clientSecret) {
        try {
          const cardElem = elements.getElement(CardElement)
          if (cardElem !== null) {
            const { error, paymentIntent } = await stripe.confirmCardPayment(
              clientSecret,
              {
                payment_method: {
                  card: cardElem
                }
              }
            )

            if (paymentIntent?.status) {
              // clean up payment state so we can
              // re-request a new payment intent
              // if needed

              const status = paymentIntent.status
              if (status === 'requires_capture') {
                setCheckoutSuccess(true)
              } else {
                setInProgress(false)
              }
            }

            if (error) {
              console.error(error)
              const msg = userFriendlyStripeMessage(error)
              throw new Error(msg)
            }
          }
        } catch (err) {
          // if we get an erorr, set progress
          setInProgress(false)
          setCheckoutError((err as any)?.message)
        }
      }
    },
    [elements, inProgress, clientSecret, stripe]
  )

  useEffect(() => {
    if (checkoutSuccess) {
      successCallback()
    }
  }, [checkoutSuccess, successCallback])

  return (
    <div>
      {checkoutSuccess ? (
        <p className='text-green-600 font-medium'>
          Payment successful! Completing staking...
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <h4 className='font-medium text-gray-500'>Pay with card</h4>
          <div className='mt-2 mb-4 px-5 py-4 rounded-lg border-2 border-gray-200'>
            <CardElement />
          </div>
          <button
            className='rounded-xl bg-indigo-500 font-bold text-white px-5 py-4 border-0 mt-4 cursor-pointer'
            type='submit'
            disabled={!stripe}
          >
            {buttonPrompt}
          </button>

          {checkoutError && (
            <span style={{ color: 'indigo' }}>{checkoutError}</span>
          )}
        </form>
      )}
    </div>
  )
}
