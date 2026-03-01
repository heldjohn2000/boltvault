import { createServiceClient } from '@/lib/supabase'
import { generateInvoicePDF } from '@/lib/generate-invoice'
import { OrderItem, Product } from '@/lib/types'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return Response.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const supabaseAdmin = createServiceClient()

    // Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    // Fetch customer
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', order.customer_id)
      .single()

    if (customerError || !customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Fetch order items with product details
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*, products:product_id(id, part_number, description, material, thread_spec, length, diameter)')
      .eq('order_id', id)

    if (itemsError) {
      return Response.json({ error: 'Failed to fetch order items' }, { status: 500 })
    }

    const itemsWithProducts = (orderItems || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      part_number: item.part_number,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      created_at: item.created_at,
      product: item.products as Product | undefined,
    } as OrderItem & { product?: Product }))

    // Generate PDF
    const pdfBuffer = generateInvoicePDF({
      order,
      customer,
      items: itemsWithProducts,
    })

    const pdfData = new Uint8Array(pdfBuffer)

    return new Response(pdfData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="BoltVault-Order-${order.order_number}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Invoice generation failed' },
      { status: 500 }
    )
  }
}
