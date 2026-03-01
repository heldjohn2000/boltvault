'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart()

  const shipping = subtotal > 0 ? 15.0 : 0
  const tax = (subtotal + shipping) * 0.08
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="bg-slate-900 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-100 mb-8">Shopping Cart</h1>
          <div className="card text-center py-12">
            <p className="text-slate-400 mb-6">Your cart is empty</p>
            <Link href="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="card flex gap-4">
                  <div className="flex-grow">
                    <h3 className="font-bold text-amber-400 mb-2">{item.part_number}</h3>
                    <p className="text-slate-400 text-sm mb-3">{item.description}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-slate-400 text-sm">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.product_id,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="input-field w-20"
                        />
                      </div>
                      <span className="text-slate-400 text-sm">
                        ${(item.retail_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="btn btn-ghost text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/products" className="btn btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h2 className="text-xl font-bold text-slate-100 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-slate-700">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-amber-400 mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="btn btn-primary w-full text-center py-3">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
