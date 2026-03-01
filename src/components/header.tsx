'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export default function Header() {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-amber-500 text-slate-900 font-bold text-xl px-3 py-1 rounded">
              BOLT
            </div>
            <span className="font-bold text-xl text-amber-400">VAULT</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="hover:text-amber-400 transition-colors">
              Products
            </Link>
            <Link href="/categories" className="hover:text-amber-400 transition-colors">
              Categories
            </Link>
            <Link href="/api-docs" className="hover:text-amber-400 transition-colors">
              API Docs
            </Link>
          </nav>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
