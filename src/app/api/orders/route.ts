import { createServiceClient } from '@/lib/supabase'
import crypto from 'crypto'

interface OrderRequest {
  items: Array<{
    part_number: string
    quantity: number
  }>
  shipping: {
    name: string
    email: string
    phone?: string
    companyName?: string
    street: string
    street2?: string
    city: string
    state: string
    zip: string
    country?: string
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('X-API-Key')

    if (!apiKey) {
      return Response.json(
        { error: 'Missing API key. Include X-API-Key header.' },
        { status: 401 }
      )
    }

    const supabaseAdmin = createServiceClient()

    // Hash the API key and check against stored hashes
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
    const { data: keyRecord, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('customer_id, is_active')
      .eq('key_hash', keyHash)
      .single()

    if (keyError || !keyRecord || !keyRecord.is_active) {
      return Response.json({ error: 'Invalid or inactive API key' }, { status: 401 })
    }

    // Update last used timestamp
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', keyHash)

    const body: OrderRequest = await request.json()

    if (!body.items || body.items.length === 0) {
      return Response.json({ error: 'No items in order' }, { status: 400 })
    }

    if (!body.shipping?.street || !body.shipping?.city || !body.shipping?.state || !body.shipping?.zip) {
      return Response.json({ error: 'Incomplete shipping address' }, { status: 400 })
    }

    // Fetch products by part number
    const partNumbers = body.items.map((i) => i.part_number)
    const { data: products, error: prodError } = await supabaseAdmin
      .from('products')
      .select('id, part_number, retail_price, description')
      .in('part_number', partNumbers)

    if (prodError || !products) {
      return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Validate all products exist and calculate subtotal
    let subtotal = 0
    const orderItems = []

    for (const item of body.items) {
      const product = products.find((p: { part_number: string }) => p.part_number === item.part_number)
      if (!product) {
        return Response.json(
          { error: `Product ${item.part_number} not found` },
          { status: 404 }
        )
      }

      const unitPrice = Number(product.retail_price)
      const itemTotal = unitPrice * item.quantity
      subtotal += itemTotal

      orderItems.push({
        product_id: product.id,
        part_number: product.part_number,
        description: product.description,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: Number(itemTotal.toFixed(2)),
      })
    }

    const shippingCost = subtotal >= 99 ? 0 : 15.0
    const total = subtotal + shippingCost

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: keyRecord.customer_id,
        status: 'pending',
        subtotal: subtotal.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        tax: '0.00',
        total: total.toFixed(2),
        shipping_method: 'UPS Ground',
        shipping_name: body.shipping.name,
        shipping_company: body.shipping.companyName || null,
        shipping_address1: body.shipping.street,
        shipping_address2: body.shipping.street2 || null,
        shipping_city: body.shipping.city,
        shipping_state: body.shipping.state,
        shipping_zip: body.shipping.zip,
        shipping_country: body.shipping.country || 'US',
        notes: 'API order',
      })
      .select('id, order_number, status, subtotal, shipping_cost, tax, total, created_at')
      .single()

    if (orderError || !order) {
      return Response.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Insert order items
    const itemsToInsert = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      part_number: item.part_number,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))

    await supabaseAdmin.from('order_items').insert(itemsToInsert)

    return Response.json({
      order_id: order.id,
      order_number: order.order_number,
      status: order.status,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping_cost),
      tax: Number(order.tax),
      total: Number(order.total),
      created_at: order.created_at,
      items: orderItems.map((item) => ({
        part_number: item.part_number,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
      invoice_url: `/api/orders/${order.id}/invoice`,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Order creation failed' },
      { status: 500 }
    )
  }
}
