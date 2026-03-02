'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import { Product } from '@/lib/types'

export default function ProductDetailPage() {
  const params = useParams()
  const partNumber = params.partNumber as string
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    fetchProduct()
  }, [partNumber])

  async function fetchProduct() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('part_number', partNumber)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        return
      }

      setProduct(data)

      if (data?.family_id) {
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('family_id', data.family_id)
          .neq('id', data.id)
          .limit(4)

        setRelatedProducts(related || [])
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-gray-400">Product not found</p>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
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
      quantity
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center space-x-2 text-sm text-gray-400">
          <Link href="/products" className="hover:text-blue-600">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.part_number}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl h-80 flex items-center justify-center border border-gray-200 shadow-sm">
              <svg className="w-20 h-20 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.part_number}</h1>
            <p className="text-lg text-gray-600 mb-6">{product.description}</p>

            <div className="card mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Specifications</h2>
              <div className="space-y-0">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Material</span>
                  <span className="text-gray-900 text-sm font-medium">{product.material || 'Standard'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Thread Spec</span>
                  <span className="text-gray-900 text-sm font-medium">{product.thread_spec || 'Standard'}</span>
                </div>
                {product.diameter && (
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Diameter</span>
                    <span className="text-gray-900 text-sm font-medium">{product.diameter}"</span>
                  </div>
                )}
                {product.length && (
                  <div className="flex justify-between py-3">
                    <span className="text-gray-500 text-sm">Length</span>
                    <span className="text-gray-900 text-sm font-medium">{product.length}"</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Unit Price</span>
                <span className="text-3xl font-bold text-blue-600">
                  ${product.retail_price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-gray-600 text-sm">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input-field w-24"
                />
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary px-8 py-3 text-base flex-grow"
                >
                  Add to Cart
                </button>
                <Link href="/cart" className="btn btn-secondary px-6 py-3">
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((relProduct) => (
                <Link
                  key={relProduct.id}
                  href={`/products/${relProduct.part_number}`}
                  className="card group hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-blue-600 mb-2 text-sm group-hover:text-blue-700">
                    {relProduct.part_number}
                  </h3>
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                    {relProduct.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-blue-600 font-bold">
                      ${relProduct.retail_price.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
