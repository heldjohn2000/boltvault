import { createServiceClient } from '@/lib/supabase'
import { generateInvoicePDF } from '@/lib/generate-invoice'
import { Order, OrderItem, Customer, Product } from '@/lib/types'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return new Response(JSON.stringify({ error: 'Order ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createServiceClient()

    // Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch customer
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', order.customer_id)
      .single()

    if (customerError || !customer) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch order items with product details
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*, products:product_id(id, part_number, description, material, thread_spec, diameter_inches, length_inches, finish, price_unit)')
      .eq('order_id', id)

    if (itemsError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch order items' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Transform items to include product data
    const itemsWithProducts = (orderItems || []).map((item: any) => ({
      ...item,
      product: item.products,
    }))

    // Generate PDF
    const pdfBuffer = generateInvoicePDF({
      order: order as Order,
      customer: customer as Customer,
      items: itemsWithProducts,
    })

    // Convert buffer to Uint8Array for Response
    const pdfData = new Uint8Array(pdfBuffer)

    // Return PDF response
    return new Response(pdfData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
