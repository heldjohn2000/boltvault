import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-slate-900 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card text-center py-12 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="text-6xl mb-6">✓</div>
          <h1 className="text-4xl font-bold text-amber-400 mb-4">
            Thank You for Your Order
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Your order has been successfully placed. You will receive a confirmation
            email shortly with tracking information.
          </p>

          <div className="bg-slate-800 rounded-lg p-6 mb-8 max-w-md mx-auto">
            <p className="text-slate-400 mb-2">Order Status</p>
            <p className="text-lg font-bold text-amber-400">Processing Payment</p>
            <p className="text-sm text-slate-400 mt-4">
              We'll send you tracking information once your order ships.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/products" className="btn btn-primary inline-block px-8 py-3">
              Continue Shopping
            </Link>
            <p className="text-slate-400 text-sm">
              <Link href="/" className="text-amber-400 hover:text-amber-300">
                Return to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
