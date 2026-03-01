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
      <div className="bg-slate-900 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-400">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-slate-900 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-400">Product not found</p>
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
    <div className="bg-slate-900 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center space-x-2 text-sm text-slate-400">
          <Link href="/products" className="hover:text-amber-400">
            Products
          </Link>
          <span>/</span>
          <span className="text-amber-400">{product.part_number}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="bg-slate-800 rounded-lg h-80 flex items-center justify-center border border-slate-700">
              <span className="text-slate-500">Product Image</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-amber-400 mb-4">{product.part_number}</h1>
            <p className="text-xl text-slate-300 mb-6">{product.description}</p>

            <div className="card mb-8">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Specifications</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Material</span>
                  <span className="text-slate-100">{product.material || 'Standard'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Thread Spec</span>
                  <span className="text-slate-100">{product.thread_spec || 'Standard'}</span>
                </div>
                {product.diameter && (
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-slate-400">Diameter</span>
                    <span className="text-slate-100">{product.diameter}"</span>
                  </div>
                )}
                {product.length && (
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-slate-400">Length</span>
                    <span className="text-slate-100">{product.length}"</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card mb-8">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Pricing</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400">Unit Price</span>
                  <span className="text-2xl font-bold text-amber-400">
                    ${product.retail_price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-slate-300">Quantity:</label>
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
                  className="btn btn-primary px-8 py-3 text-lg flex-grow"
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
            <h2 className="text-3xl font-bold text-slate-100 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relProduct) => (
                <Link
                  key={relProduct.id}
                  href={`/products/${relProduct.part_number}`}
                  className="card group hover:border-amber-500 transition-all"
                >
                  <h3 className="font-bold text-amber-400 mb-2 text-sm group-hover:text-amber-300">
                    {relProduct.part_number}
                  </h3>
                  <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                    {relProduct.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                    <span className="text-amber-400 font-bold">
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
