# Invoice API - Code Snippets & Examples

## React Component Example

```tsx
// components/InvoiceDownloadButton.tsx
import { useState } from 'react'

interface InvoiceDownloadButtonProps {
  orderId: string
  disabled?: boolean
}

export function InvoiceDownloadButton({ 
  orderId, 
  disabled = false 
}: InvoiceDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`)
      
      if (!response.ok) {
        throw new Error(`Failed to download invoice: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={disabled || loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Downloading...' : 'Download Invoice'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
```

## Usage in Order Page

```tsx
// app/orders/[id]/page.tsx
import { InvoiceDownloadButton } from '@/components/InvoiceDownloadButton'

export default function OrderPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1>Order #{params.id}</h1>
      
      {/* Order details */}
      <div className="mt-8 border-t pt-4">
        <InvoiceDownloadButton orderId={params.id} />
      </div>
    </div>
  )
}
```

## Direct Link Example

```tsx
// Simple button with direct href
<a 
  href={`/api/orders/${orderId}/invoice`}
  download={`invoice-${orderId}.pdf`}
  className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
>
  Download Invoice
</a>
```

## Fetch Wrapper Hook

```tsx
// hooks/useInvoiceDownload.ts
import { useState } from 'react'

export function useInvoiceDownload() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const downloadInvoice = async (orderId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download invoice')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { downloadInvoice, loading, error }
}

// Usage
const { downloadInvoice, loading, error } = useInvoiceDownload()
await downloadInvoice(orderId)
```

## Server-Side Generation (Node.js)

```typescript
// scripts/generate-invoice.ts
// Run: npx ts-node scripts/generate-invoice.ts <order-id>

import { createServiceClient } from '@/lib/supabase'
import { generateInvoicePDF } from '@/lib/generate-invoice'
import fs from 'fs'

async function generateInvoice(orderId: string) {
  const supabase = createServiceClient()

  // Fetch order
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) {
    console.error('Order not found')
    return
  }

  // Fetch customer
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', order.customer_id)
    .single()

  // Fetch items
  const { data: items } = await supabase
    .from('order_items')
    .select('*, products:product_id(*)')
    .eq('order_id', orderId)

  // Generate PDF
  const pdf = generateInvoicePDF({
    order,
    customer,
    items: items || [],
  })

  // Save to file
  fs.writeFileSync(`invoice-${orderId}.pdf`, pdf)
  console.log(`Invoice saved to invoice-${orderId}.pdf`)
}

const orderId = process.argv[2]
if (!orderId) {
  console.error('Usage: npx ts-node scripts/generate-invoice.ts <order-id>')
  process.exit(1)
}

generateInvoice(orderId).catch(console.error)
```

## API Integration Examples

### With Axios

```typescript
import axios from 'axios'

async function downloadInvoiceAxios(orderId: string) {
  try {
    const response = await axios.get(`/api/orders/${orderId}/invoice`, {
      responseType: 'blob',
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${orderId}.pdf`
    link.click()
  } catch (error) {
    console.error('Download failed:', error)
  }
}
```

### With React Query

```tsx
import { useMutation } from '@tanstack/react-query'

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch(`/api/orders/${orderId}/invoice`)
      if (!response.ok) throw new Error('Failed to download')
      return response.blob()
    },
    onSuccess: (blob, orderId) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    },
  })
}

// Usage
const { mutate, isPending } = useDownloadInvoice()
<button onClick={() => mutate(orderId)} disabled={isPending}>
  Download Invoice
</button>
```

## Error Handling Examples

```typescript
async function downloadWithErrorHandling(orderId: string) {
  try {
    const response = await fetch(`/api/orders/${orderId}/invoice`)

    if (response.status === 404) {
      alert('Order not found. Please check the order ID.')
      return
    }

    if (response.status === 400) {
      alert('Invalid request. Order ID is required.')
      return
    }

    if (!response.ok) {
      const error = await response.json()
      alert(`Error: ${error.error}`)
      return
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${orderId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Network error:', error)
    alert('Failed to download invoice. Please try again.')
  }
}
```

## Testing with cURL

```bash
# Download invoice to file
curl -X GET http://localhost:3000/api/orders/123abc/invoice \
  -H "Accept: application/pdf" \
  -o invoice.pdf

# Check if invoice endpoint is working
curl -I http://localhost:3000/api/orders/123abc/invoice

# Test with verbose output
curl -v http://localhost:3000/api/orders/123abc/invoice \
  -o invoice.pdf

# Test with invalid order ID (should return 404)
curl -i http://localhost:3000/api/orders/invalid-id/invoice
```

## Integration with Email Service

```typescript
// lib/send-invoice-email.ts
import nodemailer from 'nodemailer'
import { createServiceClient } from '@/lib/supabase'
import { generateInvoicePDF } from '@/lib/generate-invoice'

export async function sendInvoiceEmail(orderId: string, recipientEmail: string) {
  const supabase = createServiceClient()

  // Fetch order data
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', order.customer_id)
    .single()

  const { data: items } = await supabase
    .from('order_items')
    .select('*, products:product_id(*)')
    .eq('order_id', orderId)

  // Generate PDF
  const pdfBuffer = generateInvoicePDF({
    order,
    customer,
    items,
  })

  // Send email with PDF attachment
  const transporter = nodemailer.createTransport({
    // Configure your email service
  })

  await transporter.sendMail({
    from: 'orders@boltvault.com',
    to: recipientEmail,
    subject: `Invoice for Order #${orderId}`,
    html: `<p>Please find your invoice attached.</p>`,
    attachments: [
      {
        filename: `invoice-${orderId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })
}
```

## TypeScript Type Definitions

```typescript
// types/invoice.ts
import { Order, Customer, OrderItem, Product } from '@/lib/types'

export interface InvoiceData {
  order: Order
  customer: Customer
  items: Array<OrderItem & { product?: Product }>
}

export interface InvoiceResponse {
  success: true
  invoiceUrl: string
}

export interface InvoiceError {
  success: false
  error: string
  status: number
}
```

## Next.js App Router Integration

```typescript
// app/orders/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${orderId}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <button 
        onClick={handleDownload} 
        disabled={downloading}
      >
        {downloading ? 'Downloading...' : 'Download Invoice'}
      </button>
    </div>
  )
}
```

## Performance Optimization

```typescript
// Memoized download function
import { useCallback } from 'react'

export function useInvoiceDownloadOptimized(orderId: string) {
  const downloadInvoice = useCallback(async () => {
    const response = await fetch(`/api/orders/${orderId}/invoice`, {
      // Cache for 1 hour (adjust as needed)
      headers: {
        'Cache-Control': 'max-age=3600',
      },
    })

    if (!response.ok) throw new Error('Download failed')

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${orderId}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  }, [orderId])

  return { downloadInvoice }
}
```
