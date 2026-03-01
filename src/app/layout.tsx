import type { Metadata } from 'next'
import { CartProvider } from '@/lib/cart-context'
import Header from '@/components/header'
import Footer from '@/components/footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'BoltVault - Industrial Fasteners',
  description: 'API-First fastener e-commerce for engineers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100">
        <CartProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
