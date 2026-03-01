import { createServiceClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
})

interface CheckoutRequest {
  items: Array<{
    id: string
    product_id: string
    part_number: string
    description: string
    quantity: number
    price_unit: number
  }>
  shipping: {
    email: string
    phone: string
    companyName: string
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export async function POST(request: Request) {
  try {
    const body: CheckoutRequest = await request.json()

    if (!body.items || body.items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const supabaseAdmin = createServiceClient()

    // Verify products and prices
    const productIds = body.items.map((item) => item.product_id)
    const { data: products, error: prodError } = await supabaseAdmin
      .from('products')
      .select('id, price_unit, part_number')
      .in('id', productIds)

    if (prodError) {
      return Response.json({ error: 'Failed to verify products' }, { status: 400 })
    }

    // Verify prices match
    for (const item of body.items) {
      const product = products?.find((p: any) => p.id === item.product_id)
      if (!product) {
        return Response.json(
          { error: `Product ${item.part_number} not found` },
          { status: 400 }
        )
      }
      if (product.price_unit !== item.price_unit) {
        return Response.json(
          { error: `Price mismatch for ${item.part_number}` },
          { status: 400 }
        )
      }
    }

    const subtotal = body.items.reduce(
      (sum, item) => sum + item.price_unit * item.quantity,
      0
    )

    // Create customer in Supabase
    const { data: customer, error: custError } = await supabaseAdmin
      .from('customers')
      .insert([
        {
          email: body.shipping.email,
          phone: body.shipping.phone,
          company_name: body.shipping.companyName,
        },
      ])
      .select()
      .single()

    if (custError) {
      return Response.json({ error: 'Failed to create customer' }, { status: 500 })
    }

    // Create order in Supabase
    const shippingCost = 15.0
    const tax = (subtotal + shippingCost) * 0.08
    const total = subtotal + shippingCost + tax

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          customer_id: customer.id,
          status: 'pending',
          subtotal,
          shipping_cost: shippingCost,
          tax,
          total,
          shipping_address: {
            street: body.shipping.street,
            city: body.shipping.city,
            state: body.shipping.state,
            zip: body.shipping.zip,
            country: body.shipping.country,
          },
        },
      ])
      .select()
      .single()

    if (orderError) {
      return Response.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      customer_email: body.shipping.email,
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      line_items: body.items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.part_number,
            description: item.description,
          },
          unit_amount: Math.round(item.price_unit * 100),
        },
        quantity: item.quantity,
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1500,
              currency: 'usd',
            },
            display_name: 'Standard Shipping (5-7 days)',
          },
        },
      ],
    })

    if (!session.url) {
      return Response.json({ error: 'Failed to create checkout URL' }, { status: 500 })
    }

    // Update order with Stripe session ID
    await supabaseAdmin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return Response.json({
      checkoutUrl: session.url,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
