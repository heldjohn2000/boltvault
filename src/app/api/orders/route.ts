import { createServiceClient } from '@/lib/supabase'

interface OrderRequest {
  items: Array<{
    part_number: string
    quantity: number
  }>
  shipping: {
    email: string
    phone: string
    companyName?: string
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('X-API-Key')

    if (!apiKey) {
      return Response.json({ error: 'Missing API key' }, { status: 401 })
    }

    const supabaseAdmin = createServiceClient()

    // Verify API key
    const { data: keyRecord, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('customer_id')
      .eq('key', apiKey)
      .eq('active', true)
      .single()

    if (keyError || !keyRecord) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Update last used timestamp
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key', apiKey)

    const body: OrderRequest = await request.json()

    if (!body.items || body.items.length === 0) {
      return Response.json({ error: 'No items in order' }, { status: 400 })
    }

    // Fetch products by part number
    const partNumbers = body.items.map((i) => i.part_number)
    const { data: products, error: prodError } = await supabaseAdmin
      .from('products')
      .select('id, part_number, price_unit')
      .in('part_number', partNumbers)

    if (prodError) {
      return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Calculate subtotal
    let subtotal = 0
    const orderItems = []

    for (const item of body.items) {
      const product = products?.find((p: any) => p.part_number === item.part_number)
      if (!product) {
        return Response.json(
          { error: `Product ${item.part_number} not found` },
          { status: 404 }
        )
      }

      const itemTotal = product.price_unit * item.quantity
      subtotal += itemTotal

      orderItems.push({
        product_id: product.id,
        part_number: product.part_number,
        quantity: item.quantity,
        price_unit: product.price_unit,
        subtotal: itemTotal,
      })
    }

    // Create customer
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

    // Create order
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

    // Create order items
    const itemsToInsert = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      part_number: item.part_number,
      quantity: item.quantity,
      price_unit: item.price_unit,
      subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsToInsert)

    if (itemsError) {
      return Response.json({ error: 'Failed to create order items' }, { status: 500 })
    }

    return Response.json({
      orderId: order.id,
      status: order.status,
      subtotal: order.subtotal,
      shipping: order.shipping_cost,
      tax: order.tax,
      total: order.total,
      items: orderItems,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
