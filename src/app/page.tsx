import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Category, Product } from '@/lib/types'

export const revalidate = 3600

async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .gt('retail_price', 0)
    .order('retail_price', { ascending: false })
    .limit(4)

  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }

  return data || []
}

const categoryIcons: Record<string, string> = {
  spacers: '⬤',
  fasteners: '🔩',
  washers: '⭕',
  nuts: '⬛',
  bolts: '↳',
  screws: '🔧',
  anchors: '⚓',
  rivets: '📌',
  hinges: '🔀',
  clips: '📎',
}

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Industrial Fasteners.
            <br />
            <span className="text-blue-200">Delivered Fast.</span>
          </h1>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            API-first ordering for engineers. Over 1,500 SKUs in stock with competitive pricing and same-week shipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="px-8 py-3.5 rounded-lg font-medium text-blue-700 bg-white hover:bg-blue-50 shadow-lg transition-all text-base">
              Browse Products
            </Link>
            <Link href="/api-docs" className="px-8 py-3.5 rounded-lg font-medium text-white border-2 border-white/30 hover:bg-white/10 transition-all text-base">
              API Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">1,500+</p>
            <p className="text-sm text-gray-500">SKUs In Stock</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">10</p>
            <p className="text-sm text-gray-500">Categories</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">REST</p>
            <p className="text-sm text-gray-500">API Access</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">$99+</p>
            <p className="text-sm text-gray-500">Free Shipping</p>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title">Shop by Category</h2>
          <div className="grid-categories">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="card hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="text-4xl mb-4">
                  {categoryIcons[category.slug] || '🔩'}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-500 text-sm">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-semibold text-gray-900">Featured Products</h2>
            <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View all →
            </Link>
          </div>
          <div className="grid-products">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.part_number}`} className="card hover:border-blue-300 hover:shadow-md transition-all group">
                <div className="bg-gray-100 h-36 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm group-hover:text-blue-600 transition-colors">{product.part_number}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-blue-600 font-bold">${product.retail_price.toFixed(2)}</span>
                  <span className="text-xs text-gray-400">{product.material || ''}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* API-First Ordering Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="card border-blue-200 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-2">
              <div>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
                  FOR DEVELOPERS
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  API-First Ordering
                </h2>
                <p className="text-gray-600 mb-6">
                  Integrate BoltVault into your workflow. Query our full catalog, automate orders, and streamline procurement with a simple REST API.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-gray-700 text-sm">RESTful API with comprehensive documentation</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-gray-700 text-sm">Authentication with API keys</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-gray-700 text-sm">Full-text search and filtering</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-gray-700 text-sm">Programmatic order creation</span>
                  </li>
                </ul>
                <Link href="/api-docs" className="btn btn-primary">
                  View API Docs →
                </Link>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm text-gray-300 overflow-x-auto shadow-lg">
                <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-500 text-xs ml-2">terminal</span>
                </div>
                <pre>{`curl -X GET \\
  'https://boltvault.com/api/products' \\
  -H 'X-API-Key: your-api-key'

{
  "products": [
    {
      "part_number": "FC1600",
      "description": "Socket Head Cap Screw",
      "retail_price": 0.45
    }
  ]
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
