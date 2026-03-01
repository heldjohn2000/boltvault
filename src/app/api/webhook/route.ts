import { createServiceClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
})

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return Response.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabaseAdmin = createServiceClient()

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Find order by Stripe session ID
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('stripe_session_id', session.id)

      if (orders && orders.length > 0) {
        const order = orders[0]

        // Update order status to paid
        await supabaseAdmin
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', order.id)
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return Response.json({ received: true })
}
