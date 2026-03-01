import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-800 border-t border-slate-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-4">BoltVault</h3>
            <p className="text-slate-400 text-sm">
              API-first industrial fastener supplier. Engineered for developers.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-slate-100 mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/products" className="hover:text-amber-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-amber-400 transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="font-bold text-slate-100 mb-4">Developers</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/api-docs" className="hover:text-amber-400 transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Status Page
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-slate-100 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <p className="text-center text-slate-400 text-sm">
            &copy; 2026 BoltVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
