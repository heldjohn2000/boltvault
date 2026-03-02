'use client'

import { useState } from 'react'

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'get-products' | 'create-order'>('get-products')

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
            DEVELOPER DOCS
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
          <p className="text-lg text-gray-500">
            Integrate BoltVault into your application with our comprehensive REST API.
          </p>
        </div>

        {/* Authentication Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Authentication</h2>
          <p className="text-gray-600 mb-4">
            All API requests require an API key passed as the <code className="bg-gray-100 px-2 py-1 rounded text-blue-600 text-sm">X-API-Key</code> header:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300 font-mono">{`curl -H "X-API-Key: your-api-key-here" https://boltvault.com/api/products`}</pre>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Contact sales@boltvault.com to request an API key for your account.
          </p>
        </div>

        {/* Endpoints Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Endpoints</h2>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('get-products')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'get-products'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              GET /api/products
            </button>
            <button
              onClick={() => setActiveTab('create-order')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'create-order'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              POST /api/orders
            </button>
          </div>

          {/* GET Products */}
          {activeTab === 'get-products' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  List Products
                </h3>
                <p className="text-gray-600 mb-4">
                  Retrieve a paginated list of fasteners. Supports filtering by category, material, thread spec, and full-text search.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Request</h4>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
                  <pre className="text-sm text-gray-300 font-mono">{`GET /api/products?search=socket&material=Steel&page=1&limit=50

Headers:
X-API-Key: your-api-key-here`}</pre>
                </div>
                <p className="text-gray-500 text-sm mb-3">Query Parameters:</p>
                <div className="space-y-2 ml-4">
                  <p className="text-gray-600 text-sm"><code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">search</code> — Search by part number or description</p>
                  <p className="text-gray-600 text-sm"><code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">material</code> — Filter by material (e.g., Steel, Aluminum)</p>
                  <p className="text-gray-600 text-sm"><code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">thread</code> — Filter by thread spec (e.g., M6, #10-24)</p>
                  <p className="text-gray-600 text-sm"><code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">category</code> — Filter by category ID</p>
                  <p className="text-gray-600 text-sm"><code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">page</code> — Page number (default: 1)</p>
                  <p className="text-gray-600 text-sm"><code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">limit</code> — Results per page (default: 50, max: 100)</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Response</h4>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 font-mono">{`{
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "part_number": "FC1600",
      "description": "Socket Head Cap Screw M6x16 Stainless Steel",
      "material": "Steel",
      "thread_spec": "M6",
      "retail_price": 0.45,
      "pack_quantity": 50
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Create Order
                </h3>
                <p className="text-gray-600 mb-4">
                  Create a new order programmatically. Requires a valid API key.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Request</h4>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
                  <pre className="text-sm text-gray-300 font-mono">{`POST /api/orders

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
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Response</h4>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300 font-mono">{`{
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
      "retail_price": 0.45,
      "total_price": 45.00
    },
    {
      "part_number": "WA2000",
      "quantity": 50,
      "retail_price": 0.45,
      "total_price": 22.50
    }
  ]
}`}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Code Examples Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Code Examples</h2>

          <div className="space-y-8">
            {/* JavaScript/TypeScript Example */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">JavaScript / TypeScript</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono">{`const apiKey = "your-api-key-here";

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
              <h3 className="text-base font-semibold text-gray-900 mb-3">cURL</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono">{`# Get products
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

            {/* Python Example */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Python</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono">{`import requests

api_key = "your-api-key-here"
headers = {"X-API-Key": api_key}

# Get products
response = requests.get(
  "https://boltvault.com/api/products?search=socket&limit=10",
  headers=headers
)
products = response.json()

# Create order
order_data = {
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
}

response = requests.post(
  "https://boltvault.com/api/orders",
  headers=headers,
  json=order_data
)
order = response.json()`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Error Handling Section */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Error Responses</h2>
          <div className="space-y-0">
            <div className="flex gap-4 py-4 border-b border-gray-100">
              <div className="font-mono text-red-500 font-bold flex-shrink-0 text-sm">400</div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Bad Request</p>
                <p className="text-gray-500 text-sm">Invalid request parameters or missing required fields</p>
              </div>
            </div>
            <div className="flex gap-4 py-4 border-b border-gray-100">
              <div className="font-mono text-red-500 font-bold flex-shrink-0 text-sm">401</div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Unauthorized</p>
                <p className="text-gray-500 text-sm">Missing or invalid API key</p>
              </div>
            </div>
            <div className="flex gap-4 py-4 border-b border-gray-100">
              <div className="font-mono text-red-500 font-bold flex-shrink-0 text-sm">404</div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Not Found</p>
                <p className="text-gray-500 text-sm">Product or resource not found</p>
              </div>
            </div>
            <div className="flex gap-4 py-4">
              <div className="font-mono text-red-500 font-bold flex-shrink-0 text-sm">500</div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Internal Server Error</p>
                <p className="text-gray-500 text-sm">Server-side error processing your request</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
