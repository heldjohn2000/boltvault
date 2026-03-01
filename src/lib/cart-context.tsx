'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { CartItem } from './types'

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('boltvault-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e)
      }
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('boltvault-cart', JSON.stringify(items))
    }
  }, [items, isHydrated])

  const addItem = (item: Omit<CartItem, 'id'>, quantity: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.product_id === item.product_id)
      if (existingItem) {
        return prevItems.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [
        ...prevItems,
        {
          ...item,
          id: `${item.product_id}-${Date.now()}`,
          quantity,
        },
      ]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.product_id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
    } else {
      setItems((prevItems) =>
        prevItems.map((i) =>
          i.product_id === productId ? { ...i, quantity } : i
        )
      )
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + item.price_unit * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
