export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  created_at: string
}

export interface ProductFamily {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  material: string | null
  shape: string | null
  base_diameter: string | null
  thread_spec: string | null
  gender: string | null
  image_url: string | null
  created_at: string
}

export interface Product {
  id: string
  family_id: string
  category_id: string
  part_number: string
  description: string
  length: string
  length_numeric: number | null
  cost_price: number
  retail_price: number
  weight_each: number | null
  unit_of_measure: string
  pack_quantity: number
  material: string | null
  thread_spec: string | null
  hex_size: string | null
  diameter: string | null
  is_active: boolean
  created_at: string
}

export interface Customer {
  id: string
  email: string
  company_name: string | null
  contact_name: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string
  stripe_customer_id: string | null
  created_at: string
}

export interface Order {
  id: string
  order_number: number
  customer_id: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  shipping_method: string | null
  shipping_name: string | null
  shipping_company: string | null
  shipping_address1: string | null
  shipping_address2: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_zip: string | null
  shipping_country: string
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  notes: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  part_number: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface ApiKey {
  id: string
  customer_id: string
  key_hash: string
  key_prefix: string
  name: string
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

export interface CartItem {
  id: string
  product_id: string
  part_number: string
  description: string
  quantity: number
  retail_price: number
  material: string | null
  thread_spec: string | null
}
