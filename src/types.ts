export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  image_url: string;
  stock: number;
  category: string;
  created_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  expiry_date: string;
  usage_limit: number;
  usage_count: number;
}

export interface ShippingRule {
  id: string;
  name: string;
  rate: number;
  free_delivery_threshold: number;
}

export interface Tax {
  id: string;
  name: string;
  rate: number; // Percentage, e.g., 18 for 18% GST
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_address: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  payment_method: 'razorpay' | 'cod';
  payment_id?: string;
  razorpay_order_id?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface Transaction {
  id: string;
  order_id: string;
  payment_id: string;
  signature?: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
