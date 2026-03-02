'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import { useSearchParams } from 'next/navigation'

interface Product {
  id: string
  part_number: string
  description: string
  material: string
  thread_spec: string
  retail_price: number
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  pages: number
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [materials, setMaterials] = useState<string[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  const searchParams = useSearchParams()
  const { addItem } = useCart()

  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category') || ''
  const material = searchParams.get('material') || ''
  const thread = searchParams.get('thread') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    fetchProducts()
    fetchFilters()
  }, [search, categoryId, material, thread, page])

  async function fetchProducts() {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })

      if (search) {
        query = query.or(`part_number.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (material) {
        query = query.eq('material', material)
      }

      if (thread) {
        query = query.eq('thread_spec', thread)
      }

      const limit = 50
      const offset = (page - 1) * limit

      const { data, count, error } = await query
        .range(offset, offset + limit - 1)
        .order('part_number')

      if (error) {
        console.error('Error fetching products:', error)
        return
      }

      setProducts(data || [])
      setPagination({
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      })
    } finally {
      setLoading(false)
    }
  }

  async function fetchFilters() {
    try {
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')

      if (catData) {
        setCategories(catData)
      }

      const { data: matData } = await supabase
        .from('products')
        .select('material')
        .neq('material', null)

      if (matData) {
        const unique = [...new Set(matData.map((p: any) => p.material))]
        setMaterials(unique as string[])
      }
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  function handleAddToCart(product: Product) {
    addItem(
      {
        product_id: product.id,
        part_number: product.part_number,
        description: product.description,
        retail_price: product.retail_price,
        material: product.material,
        thread_spec: product.thread_spec,
        quantity: 0,
      },
      1
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Search */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Search</h3>
                <input
                  type="text"
                  placeholder="Part number or description"
                  defaultValue={search}
                  className="input-field w-full"
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString())
                    if (e.target.value) {
                      params.set('search', e.target.value)
                    } else {
                      params.delete('search')
                    }
                    params.set('page', '1')
                    window.history.pushState(null, '', `?${params.toString()}`)
                  }}
                />
              </div>

              {/* Material Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Material</h3>
                <div className="space-y-2">
                  {materials.map((mat) => (
                    <label key={mat} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={material === mat}
                        onChange={(e) => {
                          const params = new URLSearchParams(searchParams.toString())
                          if (e.target.checked) {
                            params.set('material', mat)
                          } else {
                            params.delete('material')
                          }
                          params.set('page', '1')
                          window.history.pushState(null, '', `?${params.toString()}`)
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-600 text-sm">{mat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Thread Spec Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Thread Spec</h3>
                <input
                  type="text"
                  placeholder="e.g., M6, #10-24"
                  defaultValue={thread}
                  className="input-field w-full"
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString())
                    if (e.target.value) {
                      params.set('thread', e.target.value)
                    } else {
                      params.delete('thread')
                    }
                    params.set('page', '1')
                    window.history.pushState(null, '', `?${params.toString()}`)
                  }}
                />
              </div>

              {/* Clear Filters */}
              <Link
                href="/products"
                className="btn btn-secondary block text-center"
              >
                Clear Filters
              </Link>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Products</h1>
              <p className="text-gray-500">
                {loading ? 'Loading...' : `${pagination.total} products found`}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid-products mb-8">
                  {products.map((product) => (
                    <div key={product.id} className="card group hover:border-blue-300 hover:shadow-md transition-all">
                      <Link href={`/products/${product.part_number}`}>
                        <h3 className="font-semibold text-blue-600 mb-2 text-sm group-hover:text-blue-700 transition-colors">
                          {product.part_number}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      </Link>

                      {product.material && (
                        <p className="text-xs text-gray-400 mb-2">
                          {product.material} • {product.thread_spec || 'Standard'}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-lg font-bold text-blue-600">
                          ${product.retail_price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="btn btn-primary text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-8">
                    {page > 1 && (
                      <Link
                        href={`/products?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: String(page - 1),
                        }).toString()}`}
                        className="btn btn-secondary"
                      >
                        Previous
                      </Link>
                    )}

                    <span className="text-gray-500 px-4">
                      Page {pagination.page} of {pagination.pages}
                    </span>

                    {page < pagination.pages && (
                      <Link
                        href={`/products?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: String(page + 1),
                        }).toString()}`}
                        className="btn btn-secondary"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-8"><div className="max-w-7xl mx-auto px-4"><p className="text-gray-400">Loading...</p></div></div>}>
      <ProductsContent />
    </Suspense>
  )
}
