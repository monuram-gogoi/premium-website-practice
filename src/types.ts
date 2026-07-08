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
  // New extended properties
  brand?: string;
  subcategory?: string;
  sku?: string;
  images?: string[]; // Multiple image URLs
  videos?: string[]; // Video asset URLs
  specifications?: Record<string, string>; // JSON or key-value pair of specs
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
  product_status?: 'active' | 'draft';
  featured?: boolean;
  flash_sale?: boolean;
  best_seller_override?: boolean;
  trending_override?: boolean;
  new_arrival?: boolean;
  recommended?: boolean;
  tags?: string[];
  warranty?: string;
  return_policy?: string;
}

export interface Category {
  id: string;
  name: string;
  count?: number; // generated dynamically or static
  icon: string; // e.g. 📱, 🎧
  image: string; // banner image URL
  enabled: boolean;
  parent_id?: string; // for subcategories
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  enabled: boolean;
  display_order: number;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle?: string;
  offer_text?: string;
  image_url: string;
  cta_text?: string;
  cta_url?: string;
  start_date?: string;
  end_date?: string;
  enabled: boolean;
}

export interface Review {
  id: string;
  product_id?: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  verified: boolean;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  pinned?: boolean;
  featured?: boolean;
}

export interface WebsiteSettings {
  section_visibility: Record<string, boolean>; // e.g., { 'flash_sale': true, 'categories': true }
  section_order: string[]; // List of section names for drag & drop
  logo_url?: string;
  favicon_url?: string;
  theme_color?: string; // e.g. '#2563eb'
  footer_content?: string;
  branding_name?: string;
  site_title?: string;
  site_description?: string;
  footer_text?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  seo_metadata?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  announcement_bar?: {
    text: string;
    enabled: boolean;
  };
  currency?: string; // e.g. 'INR', 'USD'
  shipping_settings?: {
    default_rate?: number;
    free_threshold?: number;
  };
  tax_settings?: {
    default_gst?: number;
  };
}

export interface FlashSaleConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  offer_text: string;
  background_banner: string;
  start_date: string;
  end_date: string;
  cta_text: string;
  cta_url: string;
  display_order: number;
  product_ids: string[]; // Product IDs in the flash sale
  offer_badge?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

export interface ProductAnalytics {
  id: string; // product_id
  views: number;
  wishlist_count: number;
  cart_count: number;
  sales_count: number;
  orders_count: number;
  ratings_sum: number;
  ratings_count: number;
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
