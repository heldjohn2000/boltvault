'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Category, ProductFamily, Product } from '@/lib/types'

interface GroupedFamily {
  family: ProductFamily
  products: Product[]
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [category, setCategory] = useState<Category | null>(null)
  const [families, setFamilies] = useState<GroupedFamily[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null)

  useEffect(() => {
    fetchCategory()
  }, [slug])

  async function fetchCategory() {
    setLoading(true)
    try {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

      if (catError) {
        console.error('Error fetching category:', catError)
        return
      }

      setCategory(catData)

      const { data: familiesData } = await supabase
        .from('product_families')
        .select('*')
        .eq('category_id', catData.id)

      if (familiesData) {
        const grouped: GroupedFamily[] = []

        for (const family of familiesData) {
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('family_id', family.id)

          grouped.push({
            family,
            products: products || [],
          })
        }

        setFamilies(grouped)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-900 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-400">Loading category...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="bg-slate-900 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-400">Category not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="text-slate-400 hover:text-amber-400 mb-4 inline-block">
            Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mb-2">{category.name}</h1>
          <p className="text-slate-400">{category.description}</p>
        </div>

        {families.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No product families in this category</p>
          </div>
        ) : (
          <div className="space-y-6">
            {families.map((item) => (
              <div key={item.family.id} className="card">
                <button
                  onClick={() =>
                    setExpandedFamily(
                      expandedFamily === item.family.id ? null : item.family.id
                    )
                  }
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-amber-400 mb-2">
                        {item.family.name}
                      </h2>
                      <p className="text-slate-400 text-sm">{item.family.description}</p>
                    </div>
                    <span className="text-2xl text-slate-500">
                      {expandedFamily === item.family.id ? '▼' : '▶'}
                    </span>
                  </div>
                </button>

                {expandedFamily === item.family.id && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.part_number}`}
                          className="p-4 bg-slate-700/50 rounded hover:bg-slate-600 transition-colors border border-slate-600 hover:border-amber-500"
                        >
                          <h3 className="font-bold text-amber-400 text-sm mb-1">
                            {product.part_number}
                          </h3>
                          <p className="text-slate-300 text-xs mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-amber-400 font-bold">
                              ${product.price_unit.toFixed(2)}
                            </span>
                            {product.stock_qty === 0 && (
                              <span className="text-xs text-red-400">Out of Stock</span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
