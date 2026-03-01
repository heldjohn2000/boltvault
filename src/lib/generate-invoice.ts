import jsPDF from 'jspdf'
import { Order, OrderItem, Customer, Product } from './types'

export interface InvoiceData {
  order: Order
  customer: Customer
  items: Array<OrderItem & { product?: Product }>
}

export function generateInvoicePDF(data: InvoiceData): Buffer {
  const { order, customer, items } = data
  const doc = new jsPDF()

  // Colors as RGB arrays
  const darkGray = [40, 40, 40] as [number, number, number]
  const lightGray = [220, 220, 220] as [number, number, number]
  const black = [0, 0, 0] as [number, number, number]

  // Set default font
  doc.setFont('helvetica')

  // Header section
  let yPosition = 15

  // Company name - BOLTVAULT (large, bold)
  doc.setFontSize(28)
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.setFont('helvetica', 'bold')
  doc.text('BOLTVAULT', 15, yPosition)

  yPosition += 10

  // Tagline
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.text('The Vault for Industrial Electronic Hardware', 15, yPosition)

  yPosition += 6

  // Company address
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('123 Industrial Way, Detroit, MI 48201', 15, yPosition)
  yPosition += 4
  doc.text('Phone: (313) 555-0123', 15, yPosition)
  yPosition += 4
  doc.text('Email: orders@boltvault.com', 15, yPosition)

  yPosition += 8

  // Order number - right aligned
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  const orderNumberText = `ORDER #${order.id.slice(0, 8).toUpperCase()}`
  const orderNumberWidth = doc.getTextWidth(orderNumberText)
  doc.text(orderNumberText, 200 - 15 - orderNumberWidth, yPosition)

  yPosition += 10

  // Order Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(black[0], black[1], black[2])
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.text(`Order Date: ${orderDate}`, 15, yPosition)

  yPosition += 8

  // Dashed separator line
  doc.setDrawColor(150, 150, 150)
  doc.line(15, yPosition, 200 - 15, yPosition)

  yPosition += 8

  // Shipping Instructions section
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Shipping Instructions:', 15, yPosition)
  yPosition += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Please ship via standard ground shipping.', 15, yPosition)

  yPosition += 10

  // Shipping Information section
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Shipping Information:', 15, yPosition)
  yPosition += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const shippingLines = [
    customer.company_name || 'Customer',
    customer.email,
    customer.phone || '',
    `${order.shipping_address.street}`,
    `${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}`,
    order.shipping_address.country,
  ].filter(Boolean)

  shippingLines.forEach((line) => {
    doc.text(line, 15, yPosition)
    yPosition += 4
  })

  yPosition += 6

  // Separator line
  doc.setDrawColor(150, 150, 150)
  doc.line(15, yPosition, 200 - 15, yPosition)

  yPosition += 8

  // Order Contents table header
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])

  const col1X = 15 // Qty
  const col2X = 35 // Item #
  const col3X = 65 // Description
  const col4X = 145 // Price Each
  const col5X = 175 // Total Price

  doc.text('Qty', col1X, yPosition)
  doc.text('Item #', col2X, yPosition)
  doc.text('Description', col3X, yPosition)
  doc.text('Price Each', col4X, yPosition)
  doc.text('Total Price', col5X, yPosition)

  yPosition += 6

  // Table separator
  doc.setDrawColor(150, 150, 150)
  doc.line(15, yPosition, 200 - 15, yPosition)

  yPosition += 4

  // Table rows
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(black[0], black[1], black[2])

  items.forEach((item) => {
    const qtyStr = item.quantity.toString()
    const itemNumStr = item.part_number
    const priceStr = `$${item.price_unit.toFixed(2)}`
    const totalStr = `$${item.subtotal.toFixed(2)}`

    doc.setFontSize(10)
    doc.text(qtyStr, col1X, yPosition)
    doc.text(itemNumStr, col2X, yPosition)

    // Description with wrapping
    const descText = item.product?.description || 'Product'
    doc.setFontSize(10)
    doc.text(descText, col3X, yPosition, { maxWidth: 75 })

    doc.text(priceStr, col4X, yPosition, { align: 'right' })
    doc.text(totalStr, col5X, yPosition, { align: 'right' })

    yPosition += 5

    // Add specs below item if available
    if (item.product) {
      const specs = []
      if (item.product.material) specs.push(`Material: ${item.product.material}`)
      if (item.product.thread_spec) specs.push(`Thread: ${item.product.thread_spec}`)
      if (item.product.diameter_inches)
        specs.push(`Dia: ${item.product.diameter_inches}"`)
      if (item.product.length_inches) specs.push(`Len: ${item.product.length_inches}"`)
      if (item.product.finish) specs.push(`Finish: ${item.product.finish}`)

      if (specs.length > 0) {
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(specs.join(' | '), col3X, yPosition)
        yPosition += 3
      }
    }

    yPosition += 2
  })

  // Totals section
  yPosition += 4

  doc.setDrawColor(150, 150, 150)
  doc.line(15, yPosition, 200 - 15, yPosition)

  yPosition += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(black[0], black[1], black[2])

  // Subtotal
  const subtotalStr = `$${order.subtotal.toFixed(2)}`
  doc.text('Subtotal:', 145, yPosition)
  doc.text(subtotalStr, 195, yPosition, { align: 'right' })
  yPosition += 5

  // Shipping
  const shippingStr = `$${order.shipping_cost.toFixed(2)}`
  doc.text('Shipping:', 145, yPosition)
  doc.text(shippingStr, 195, yPosition, { align: 'right' })
  yPosition += 5

  // Tax
  const taxStr = `$${order.tax.toFixed(2)}`
  doc.text('Tax:', 145, yPosition)
  doc.text(taxStr, 195, yPosition, { align: 'right' })
  yPosition += 6

  // Total line
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  const totalStr = `$${order.total.toFixed(2)}`
  doc.text('TOTAL DUE:', 145, yPosition)
  doc.text(totalStr, 195, yPosition, { align: 'right' })

  // Convert PDF to buffer
  return Buffer.from(doc.output('arraybuffer'))
}
