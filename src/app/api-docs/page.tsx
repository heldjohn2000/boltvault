'use client'

import { useState } from 'react'

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'get-products' | 'create-order'>('get-products')

  return (
    <div className="bg-slate-900 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-amber-400 mb-4">API Documentation</h1>
          <p className="text-xl text-slate-400">
            Integrate BoltVault into your application with our comprehensive REST API.
          </p>
        </div>

        {/* Authentication Section */}
        <div className="card mb-12">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Authentication</h2>
          <p className="text-slate-300 mb-4">
            All API requests require an API key passed as the <code className="bg-slate-700 px-2 py-1 rounded text-amber-400">X-API-Key</code> header:
          </p>
          <div className="bg-slate-700 rounded p-4 overflow-x-auto">
            <pre className="text-sm text-slate-300 font-mono">{`curl -H "X-API-Key: your-api-key-here" https://boltvault.com/api/products`}</pre>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            Contact sales@boltvault.com to request an API key for your account.
          </p>
        </div>

        {/* Endpoints Section */}
        <div className="card mb-12">
          <h2 className="text-2xl font-bold text-slate-100 mb-8">Endpoints</h2>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('get-products')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'get-products'
                  ? 'border-b-2 border-amber-500 text-amber-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              GET /api/products
            </button>
            <button
              onClick={() => setActiveTab('create-order')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'create-order'
                  ? 'border-b-2 border-amber-500 text-amber-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              POST /api/orders
            </button>
          </div>

          {/* GET Products */}
          {activeTab === 'get-products' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-amber-400 mb-3">
                  List Products
                </h3>
                <p className="text-slate-300 mb-4">
                  Retrieve a paginated list of fasteners. Supports filtering by category, material, thread spec, and full-text search.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 mb-3">Request</h4>
                <div className="bg-slate-700 rounded p-4 overflow-x-auto mb-4">
                  <pre className="text-sm text-slate-300 font-mono">{`GET /api/products?search=socket&material=Steel&page=1&limit=50

Headers:
X-API-Key: your-api-key-here`}</pre>
                </div>
                <p className="text-slate-400 text-sm mb-3">Query Parameters:</p>
                <ul className="text-slate-400 text-sm space-y-2 ml-4">
                  <li><code className="text-amber-400">search</code> - Search by part number or description</li>
                  <li><code className="text-amber-400">material</code> - Filter by material (e.g., Steel, Aluminum)</li>
                  <li><code className="text-amber-400">thread</code> - Filter by thread spec (e.g., M6, #10-24)</li>
                  <li><code className="text-amber-400">category</code> - Filter by category ID</li>
                  <li><code className="text-amber-400">page</code> - Page number (default: 1)</li>
                  <li><code className="text-amber-400">limit</code> - Results per page (default: 50, max: 100)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 mb-3">Response</h4>
                <div className="bg-slate-700 rounded p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-300 font-mono">{`{
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "part_number": "FC1600",
      "description": "Socket Head Cap Screw M6x16 Stainless Steel",
      "material": "Steel",
      "thread_spec": "M6",
      "price_unit": 0.45,
      "price_carton": 18.00,
      "carton_qty": 50,
      "stock_qty": 10000
    }
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 50,
    "pages": 25
  }
}`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* POST Orders */}
          {activeTab === 'create-order' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-amber-400 mb-3">
                  Create Order
                </h3>
                <p className="text-slate-300 mb-4">
                  Create a new order programmatically. Requires a valid API key.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 mb-3">Request</h4>
                <div className="bg-slate-700 rounded p-4 overflow-x-auto mb-4">
                  <pre className="text-sm text-slate-300 font-mono">{`POST /api/orders

Headers:
X-API-Key: your-api-key-here
Content-Type: application/json

Body:
{
  "items": [
    {
      "part_number": "FC1600",
      "quantity": 100
    },
    {
      "part_number": "WA2000",
      "quantity": 50
    }
  ],
  "shipping": {
    "email": "engineering@acme.com",
    "phone": "+1-555-1234",
    "companyName": "ACME Corp",
    "street": "123 Industrial Blvd",
    "city": "Boston",
    "state": "MA",
    "zip": "02101",
    "country": "USA"
  }
}`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 mb-3">Response</h4>
                <div className="bg-slate-700 rounded p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-300 font-mono">{`{
  "orderId": "order_1234567890",
  "status": "pending",
  "subtotal": 67.50,
  "shipping": 15.00,
  "tax": 6.60,
  "total": 89.10,
  "items": [
    {
      "part_number": "FC1600",
      "quantity": 100,
      "price_unit": 0.45,
      "subtotal": 45.00
    },
    {
      "part_number": "WA2000",
      "quantity": 50,
      "price_unit": 0.45,
      "subtotal": 22.50
    }
  ]
}`}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Code Examples Section */}
        <div className="card mb-12">
          <h2 className="text-2xl font-bold text-slate-100 mb-8">Code Examples</h2>

          <div className="space-y-8">
            {/* Python Example */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-3">Python</h3>
              <div className="bg-slate-700 rounded p-4 overflow-x-auto">
                <pre className="text-sm text-slate-300 font-mono">{`import requests

api_key = "your-api-key-here"
headers = {"X-API-Key": api_key}

# Get products
response = requests.get(
    "https://boltvault.com/api/products",
    params={"search": "socket", "limit": 10},
    headers=headers
)
products = response.json()

# Create order
order_data = {
    "items": [
        {"part_number": "FC1600", "quantity": 100}
    ],
    "shipping": {
        "email": "orders@acme.com",
        "phone": "+1-555-1234",
        "companyName": "ACME Corp",
        "street": "123 Industrial Blvd",
        "city": "Boston",
        "state": "MA",
        "zip": "02101",
        "country": "USA"
    }
}

response = requests.post(
    "https://boltvault.com/api/orders",
    json=order_data,
    headers=headers
)
order = response.json()`}</pre>
              </div>
            </div>

            {/* JavaScript Example */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-3">JavaScript</h3>
              <div className="bg-slate-700 rounded p-4 overflow-x-auto">
                <pre className="text-sm text-slate-300 font-mono">{`const apiKey = "your-api-key-here";

// Get products
const productsResponse = await fetch(
  "https://boltvault.com/api/products?search=socket&limit=10",
  { headers: { "X-API-Key": apiKey } }
);
const products = await productsResponse.json();

// Create order
const orderData = {
  items: [{ part_number: "FC1600", quantity: 100 }],
  shipping: {
    email: "orders@acme.com",
    phone: "+1-555-1234",
    companyName: "ACME Corp",
    street: "123 Industrial Blvd",
    city: "Boston",
    state: "MA",
    zip: "02101",
    country: "USA",
  },
};

const orderResponse = await fetch(
  "https://boltvault.com/api/orders",
  {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  }
);
const order = await orderResponse.json();`}</pre>
              </div>
            </div>

            {/* cURL Example */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-3">cURL</h3>
              <div className="bg-slate-700 rounded p-4 overflow-x-auto">
                <pre className="text-sm text-slate-300 font-mono">{`# Get products
curl -X GET \\
  'https://boltvault.com/api/products?search=socket&limit=10' \\
  -H 'X-API-Key: your-api-key-here'

# Create order
curl -X POST \\
  'https://boltvault.com/api/orders' \\
  -H 'X-API-Key: your-api-key-here' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "items": [{"part_number": "FC1600", "quantity": 100}],
    "shipping": {
      "email": "orders@acme.com",
      "phone": "+1-555-1234",
      "companyName": "ACME Corp",
      "street": "123 Industrial Blvd",
      "city": "Boston",
      "state": "MA",
      "zip": "02101",
      "country": "USA"
    }
  }'`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Error Codes Section */}
        <div className="card">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Error Responses</h2>
          <div className="space-y-4">
            <div className="flex gap-4 pb-4 border-b border-slate-700">
              <div className="font-mono text-red-400 font-bold flex-shrink-0">400</div>
              <div>
                <p className="font-bold text-slate-100">Bad Request</p>
                <p className="text-slate-400 text-sm">Invalid request parameters or missing required fields</p>
              </div>
            </div>
            <div className="flex gap-4 pb-4 border-b border-slate-700">
              <div className="font-mono text-red-400 font-bold flex-shrink-0">401</div>
              <div>
                <p className="font-bold text-slate-100">Unauthorized</p>
                <p className="text-slate-400 text-sm">Missing or invalid API key</p>
              </div>
            </div>
            <div className="flex gap-4 pb-4 border-b border-slate-700">
              <div className="font-mono text-red-400 font-bold flex-shrink-0">404</div>
              <div>
                <p className="font-bold text-slate-100">Not Found</p>
                <p className="text-slate-400 text-sm">Product or resource not found</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="font-mono text-red-400 font-bold flex-shrink-0">500</div>
              <div>
                <p className="font-bold text-slate-100">Server Error</p>
                <p className="text-slate-400 text-sm">Unexpected server error. Contact support if this persists.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
