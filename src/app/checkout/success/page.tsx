import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card text-center py-12 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-green-600 text-3xl">✓</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You for Your Order
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            Your order has been successfully placed. You will receive a confirmation
            email shortly with tracking information.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto border border-gray-200">
            <p className="text-gray-500 mb-2">Order Status</p>
            <p className="text-lg font-bold text-green-600">Processing Payment</p>
            <p className="text-sm text-gray-400 mt-4">
              We'll send you tracking information once your order ships.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/products" className="btn btn-primary inline-block px-8 py-3">
              Continue Shopping
            </Link>
            <p className="text-gray-400 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-700">
                Return to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
