import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'FAULTY_KEY'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // CREATE OR FETCH a paymentIntent
  if (req.method === 'POST') {
    const { amount } = req.body

    const stripe = new Stripe(STRIPE_KEY, {
      apiVersion: '2020-08-27'
    })

    let paymentIntent: Stripe.PaymentIntent | null = null
    const customer = await stripe.customers.create()

    try {
      paymentIntent = await stripe.paymentIntents.create({
        // amount is stored and expressed in USD cents
        // to avoid floating point issues and to ensure
        // compatibility with the Stripe API
        amount: 100,
        currency: 'usd',
        customer: customer.id,
        payment_method_types: ['card'],
        capture_method: 'manual',
        metadata: {}
      })
    } catch (_error: any) {
      const error = _error as { type: string; message: string }
      console.error(error)
      res.status(401).json({ error: error.toString() })
    }

    if (paymentIntent) {
      res.status(200).json({
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      })
      return
    }
  }

  res.status(404).json({ status: 'NOT FOUND' })
}
