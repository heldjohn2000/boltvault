'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export default function Header() {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5">
            <div className="bg-blue-600 text-white font-bold text-lg px-2.5 py-0.5 rounded-md">
              BOLT
            </div>
            <span className="font-bold text-lg text-gray-900">VAULT</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
              Products
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
              Categories
            </Link>
            <Link href="/api-docs" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
              API Docs
            </Link>
          </nav>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="flex items-center space-x-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-700"
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
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
