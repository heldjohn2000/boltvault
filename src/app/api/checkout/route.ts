import { createServiceClient } from '@/lib/supabase'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

interface CheckoutItem {
  product_id: string
  part_number: string
  description: string
  quantity: number
  retail_price: number
}

interface CheckoutRequest {
  items: CheckoutItem[]
  shipping: {
    email: string
    phone: string
    name: string
    companyName: string
    street: string
    street2?: string
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
    const partNumbers = body.items.map((item) => item.part_number)
    const { data: products, error: prodError } = await supabaseAdmin
      .from('products')
      .select('id, retail_price, part_number, description')
      .in('part_number', partNumbers)

    if (prodError || !products) {
      return Response.json({ error: 'Failed to verify products' }, { status: 400 })
    }

    // Calculate subtotal from verified prices
    const subtotal = body.items.reduce((sum, item) => {
      const product = products.find((p: { part_number: string }) => p.part_number === item.part_number)
      if (!product) return sum
      return sum + Number(product.retail_price) * item.quantity
    }, 0)

    // Create or find customer
    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', body.shipping.email)
      .maybeSingle()

    let customerId: string

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const { data: newCustomer, error: custError } = await supabaseAdmin
        .from('customers')
        .insert({
          email: body.shipping.email,
          phone: body.shipping.phone,
          contact_name: body.shipping.name,
          company_name: body.shipping.companyName,
          address_line1: body.shipping.street,
          address_line2: body.shipping.street2 || null,
          city: body.shipping.city,
          state: body.shipping.state,
          zip: body.shipping.zip,
          country: body.shipping.country || 'US',
        })
        .select('id')
        .single()

      if (custError || !newCustomer) {
        return Response.json({ error: 'Failed to create customer' }, { status: 500 })
      }
      customerId = newCustomer.id
    }

    // Create order
    const shippingCost = subtotal >= 99 ? 0 : 15.0
    const total = subtotal + shippingCost

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        subtotal: subtotal.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        tax: '0.00',
        total: total.toFixed(2),
        shipping_method: 'UPS Ground',
        shipping_name: body.shipping.name,
        shipping_company: body.shipping.companyName,
        shipping_address1: body.shipping.street,
        shipping_address2: body.shipping.street2 || null,
        shipping_city: body.shipping.city,
        shipping_state: body.shipping.state,
        shipping_zip: body.shipping.zip,
        shipping_country: body.shipping.country || 'US',
      })
      .select('id, order_number')
      .single()

    if (orderError || !order) {
      return Response.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create order items
    const orderItems = body.items.map((item) => {
      const product = products.find((p: { part_number: string }) => p.part_number === item.part_number)
      const unitPrice = product ? Number(product.retail_price) : item.retail_price
      return {
        order_id: order.id,
        product_id: product?.id || null,
        part_number: item.part_number,
        description: item.description,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: (unitPrice * item.quantity).toFixed(2),
      }
    })

    await supabaseAdmin.from('order_items').insert(orderItems)

    // Create Stripe checkout session
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      customer_email: body.shipping.email,
      mode: 'payment',
      payment_method_types: ['card'],
      metadata: {
        order_id: order.id,
        order_number: String(order.order_number),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://boltvault.vercel.app'}/checkout/success?order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://boltvault.vercel.app'}/cart`,
      line_items: body.items.map((item) => {
        const product = products.find((p: { part_number: string }) => p.part_number === item.part_number)
        const unitPrice = product ? Number(product.retail_price) : item.retail_price
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.part_number,
              description: item.description,
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity: item.quantity,
        }
      }),
      ...(shippingCost > 0
        ? {
            shipping_options: [
              {
                shipping_rate_data: {
                  type: 'fixed_amount' as const,
                  fixed_amount: { amount: Math.round(shippingCost * 100), currency: 'usd' },
                  display_name: 'UPS Ground (5-7 business days)',
                },
              },
            ],
          }
        : {}),
    })

    // Update order with Stripe session ID
    await supabaseAdmin
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id)

    return Response.json({
      checkoutUrl: session.url,
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    )
  }
}
