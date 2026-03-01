# PDF Invoice Generation API - BoltVault

## Overview
This document describes the PDF invoice generation API route implementation for the BoltVault Next.js application. The API generates professional PDF invoices matching the FastenerFront style and returns them as downloadable attachments.

## Files Created

### 1. API Route Handler
**File:** `/src/app/api/orders/[id]/invoice/route.ts`

**Purpose:** Handles GET requests to generate and return invoice PDFs

**Endpoint:** `GET /api/orders/{order_id}/invoice`

**Functionality:**
- Accepts order ID from URL parameters
- Fetches order data from Supabase using the service client
- Retrieves customer information
- Joins with order items and product details
- Generates PDF using the invoice utility function
- Returns PDF with proper HTTP headers for download

**Response Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="invoice-{id}.pdf"`
- `Cache-Control: no-cache, no-store, must-revalidate`

**Error Handling:**
- 400: Order ID is missing
- 404: Order or customer not found
- 500: Database or PDF generation errors

### 2. Invoice PDF Generation Utility
**File:** `/src/lib/generate-invoice.ts`

**Purpose:** Encapsulates PDF generation logic using jsPDF

**Exports:**
- `InvoiceData` interface - Type definition for invoice data
- `generateInvoicePDF(data: InvoiceData): Buffer` - Function to generate PDF

**PDF Layout:**

The generated PDF includes the following sections:

1. **Company Header**
   - Large bold "BOLTVAULT" title (28pt)
   - Tagline: "The Vault for Industrial Electronic Hardware"
   - Company contact information:
     - Address: 123 Industrial Way, Detroit, MI 48201
     - Phone: (313) 555-0123
     - Email: orders@boltvault.com

2. **Order Number**
   - Right-aligned, bold text
   - Format: "ORDER #{first-8-chars-of-id}"

3. **Order Date**
   - Formatted as: Month Day, Year

4. **Shipping Instructions**
   - Default: "Please ship via standard ground shipping."

5. **Shipping Information**
   - Customer company name
   - Customer email
   - Customer phone
   - Shipping address (street, city, state, zip, country)

6. **Order Contents Table**
   - Column Headers:
     - Qty (Quantity)
     - Item # (Part Number)
     - Description
     - Price Each
     - Total Price
   - Each item row includes:
     - Quantity, part number, product description
     - Price per unit and line total
     - Product specifications on secondary row:
       - Material, Thread spec, Diameter, Length, Finish

7. **Order Totals**
   - Subtotal
   - Shipping Cost
   - Tax
   - TOTAL DUE (bold, 12pt)

**Color Scheme:**
- Dark Gray (40, 40, 40): Headings
- Black (0, 0, 0): Body text
- Light Gray (100-220): Secondary text
- Light Gray (150, 150, 150): Borders/lines

## Dependencies

**New Package Installed:**
- `jspdf` (v4.2.0) - PDF generation library optimized for Node.js

**No breaking changes to existing dependencies.**

## Usage

### Generate Invoice PDF
```bash
curl https://boltvault.vercel.app/api/orders/{order_id}/invoice -o invoice.pdf
```

### Integration with Frontend

```typescript
// Download invoice button
async function downloadInvoice(orderId: string) {
  const response = await fetch(`/api/orders/${orderId}/invoice`)
  if (response.ok) {
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${orderId}.pdf`
    a.click()
  }
}
```

## Database Requirements

The implementation expects the following Supabase tables:

### orders table
- id (primary key)
- customer_id (foreign key)
- status (enum: pending, paid, shipped, delivered, cancelled)
- subtotal (decimal)
- shipping_cost (decimal)
- tax (decimal)
- total (decimal)
- shipping_address (jsonb with street, city, state, zip, country)
- created_at (timestamp)
- updated_at (timestamp)

### customers table
- id (primary key)
- email (text)
- phone (text, nullable)
- company_name (text, nullable)
- created_at (timestamp)

### order_items table
- id (primary key)
- order_id (foreign key)
- product_id (foreign key)
- part_number (text)
- quantity (integer)
- price_unit (decimal)
- subtotal (decimal)
- created_at (timestamp)

### products table
- id (primary key)
- part_number (text)
- description (text)
- material (text)
- thread_spec (text)
- diameter_inches (decimal, nullable)
- length_inches (decimal, nullable)
- finish (text)
- price_unit (decimal)

## Build Status

Successfully compiled with `npm run build`.

Route registered as: `GET /api/orders/[id]/invoice` (Dynamic server-rendered route)

## Future Enhancements

Potential improvements for future versions:

1. **Multi-page Support** - Handle orders with many items spanning multiple pages
2. **Custom Branding** - Allow different company headers and formats
3. **Invoice Number** - Add sequential invoice numbering system
4. **Payment Status** - Display payment status on invoice
5. **Email Integration** - Send invoice as email attachment
6. **Customizable Shipping Methods** - Dynamic shipping instruction text
7. **QR Codes** - Add tracking or payment QR codes
8. **Digital Signatures** - Add authorized approver signatures

## Testing

To test the invoice generation:

1. Create a test order via the `/api/orders` endpoint
2. Note the order ID
3. Make a GET request to `/api/orders/{order_id}/invoice`
4. Verify the PDF downloads and displays correctly

## Notes

- The PDF is generated server-side in Node.js runtime
- Output format is A4 (standard letter size)
- PDFs are not cached (appropriate for frequently updated order data)
- Maximum width is 170mm (~6.7 inches) to accommodate standard page margins
