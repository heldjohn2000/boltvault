import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Category } from '@/lib/types'

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
  const categories = await getCategories()

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-20 px-4 border-b border-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-100 mb-4">
            Industrial Fasteners.
            <br />
            <span className="text-amber-400">Delivered Fast.</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            API-first ordering for engineers. Millions of fasteners in stock.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/products" className="btn btn-primary text-lg">
              Browse Products
            </Link>
            <Link href="/api-docs" className="btn btn-secondary text-lg">
              API Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title">Categories</h2>
          <div className="grid-categories">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="card hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer group"
              >
                <div className="text-4xl mb-4">
                  {categoryIcons[category.slug] || '🔩'}
                </div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors mb-2">
                  {category.name}
                </h3>
                <p className="text-slate-400 text-sm">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title">Featured Products</h2>
          <div className="grid-products">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card">
                <div className="bg-slate-700 h-40 rounded mb-4 flex items-center justify-center">
                  <span className="text-slate-500">Product Image</span>
                </div>
                <h3 className="font-bold text-slate-100 mb-2">{`Part #SKU-${String(i).padStart(4, '0')}`}</h3>
                <p className="text-slate-400 text-sm mb-4">High-quality industrial fastener</p>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">$0.00</span>
                  <button className="btn btn-primary text-sm">Add</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API-First Ordering Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="card border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold text-amber-400 mb-4">
                  API-First Ordering
                </h2>
                <p className="text-slate-300 mb-6">
                  Integrate BoltVault into your workflow. Query millions of fasteners, automate orders, and streamline procurement.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center space-x-3">
                    <span className="text-amber-400">✓</span>
                    <span>RESTful API with comprehensive documentation</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-amber-400">✓</span>
                    <span>Authentication with API keys</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-amber-400">✓</span>
                    <span>Full-text search and filtering</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-amber-400">✓</span>
                    <span>Programmatic order creation</span>
                  </li>
                </ul>
                <Link href="/api-docs" className="btn btn-primary">
                  View API Docs
                </Link>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 font-mono text-sm text-slate-300 overflow-x-auto">
                <pre>{`curl -X GET \\
  'https://boltvault.com/api/products' \\
  -H 'X-API-Key: your-api-key'

{
  "products": [
    {
      "part_number": "FC1600",
      "description": "Socket Head Cap Screw",
      "price_unit": 0.45,
      "stock_qty": 10000
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
