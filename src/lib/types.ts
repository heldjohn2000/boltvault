export interface Category {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  created_at: string
}

export interface ProductFamily {
  id: string
  category_id: string
  name: string
  description: string
  common_specs: Record<string, string>
  created_at: string
}

export interface Product {
  id: string
  family_id: string
  part_number: string
  description: string
  material: string
  thread_spec: string
  diameter_inches: number | null
  length_inches: number | null
  finish: string
  price_unit: number
  price_carton: number
  carton_qty: number
  stock_qty: number
  created_at: string
}

export interface Customer {
  id: string
  email: string
  phone: string | null
  company_name: string | null
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  shipping_address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  part_number: string
  quantity: number
  price_unit: number
  subtotal: number
  created_at: string
}

export interface ApiKey {
  id: string
  customer_id: string
  key: string
  name: string
  active: boolean
  created_at: string
  last_used_at: string | null
}

export interface CartItem {
  id: string
  product_id: string
  part_number: string
  description: string
  quantity: number
  price_unit: number
  material: string
  thread_spec: string
}
