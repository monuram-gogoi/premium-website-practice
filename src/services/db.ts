import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { 
  Product, Coupon, ShippingRule, Tax, Order, Profile, CartItem, OrderItem,
  Category, Brand, PromoBanner, Review, WebsiteSettings, FlashSaleConfig, Subscriber, ProductAnalytics 
} from '../types';
import { 
  mockAllProducts as SEED_MOCK_ALL_PRODUCTS, 
  popularBrands as SEED_MOCK_BRANDS, 
  customerReviews as SEED_MOCK_REVIEWS, 
  categoryDataList as SEED_MOCK_CATEGORIES,
  todaysDeals as SEED_MOCK_TODAYS_DEALS
} from '../data/mockStoreData';

// ============================================================================
// MOCK / LOCALSTORAGE PERSISTENT DATABASE ENGINE (FALLBACK)
// ============================================================================

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'AeroGlide ANC Wireless Headphones',
    description: 'Experience pure audio bliss with active noise cancellation, 40-hour battery life, and high-fidelity drivers designed for audiophiles.',
    price: 8999,
    compare_at_price: 12999,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    stock: 12,
    category: 'Audio',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Vanguard Chronograph Slate Watch',
    description: 'A minimalist timekeeper featuring surgical-grade stainless steel casing, genuine Italian leather strap, and Japanese quartz movement.',
    price: 14999,
    compare_at_price: 18500,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    stock: 8,
    category: 'Watches',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Nomad Cordura Travel Pack (30L)',
    description: 'Designed for the modern digital nomad. Weatherproof exterior, dedicated 16" laptop pocket, and ergonomic back-support system.',
    price: 4999,
    compare_at_price: 5999,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    stock: 25,
    category: 'Bags',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Keystone Mechanical Keyboard',
    description: 'An elegant 75% mechanical keyboard with hot-swappable switches, PBT double-shot keycaps, and customizable white backlighting.',
    price: 3499,
    compare_at_price: 4500,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    stock: 18,
    category: 'Accessories',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Titanium Coffee Tumbler',
    description: 'Ultra-lightweight double-wall titanium container that keeps your coffee boiling hot or iced cold for up to 12 hours.',
    price: 1899,
    compare_at_price: 2490,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    stock: 45,
    category: 'Lifestyle',
    created_at: new Date().toISOString()
  }
];

const SEED_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_purchase: 1000,
    expiry_date: '2028-12-31',
    usage_limit: 100,
    usage_count: 5
  },
  {
    id: 'coup-2',
    code: 'FESTIVE500',
    discount_type: 'fixed',
    discount_value: 500,
    min_purchase: 3000,
    expiry_date: '2028-12-31',
    usage_limit: 50,
    usage_count: 2
  }
];

const SEED_SHIPPING: ShippingRule[] = [
  {
    id: 'ship-1',
    name: 'Standard Ground Delivery',
    rate: 99,
    free_delivery_threshold: 1999
  },
  {
    id: 'ship-2',
    name: 'Expedited Air Courier',
    rate: 249,
    free_delivery_threshold: 4999
  }
];

const SEED_TAXES: Tax[] = [
  {
    id: 'tax-1',
    name: 'GST (India Standard)',
    rate: 18
  },
  {
    id: 'tax-2',
    name: 'GST (India Reduced)',
    rate: 12
  }
];

const SEED_PROFILES: Profile[] = [
  {
    id: 'user-admin',
    email: 'admin@example.com',
    role: 'admin',
    full_name: 'Senior Architect (Admin)',
    phone: '+91 98765 43210',
    address: '102 Tech Enclave, Phase 3',
    city: 'Bengaluru',
    state: 'Karnataka',
    zip: '560001',
    country: 'India',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-customer',
    email: 'customer@example.com',
    role: 'customer',
    full_name: 'Jane Doe (Customer)',
    phone: '+91 91234 56789',
    address: '456 Serene Meadows',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400001',
    country: 'India',
    created_at: new Date().toISOString()
  }
];

// Initialize local storage database helper
function initLocalStorageDB() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('ec_products')) {
    const seededProducts = SEED_MOCK_ALL_PRODUCTS.map((p, idx) => ({
      ...p,
      brand: p.category === 'Smartphones' ? (p.name.includes('iPhone') ? 'Apple' : p.name.includes('Galaxy') ? 'Samsung' : 'OnePlus') :
             p.category === 'Audio' ? (p.name.includes('Sony') ? 'Sony' : p.name.includes('AirPods') ? 'Apple' : 'JBL') :
             p.category === 'Laptops' ? (p.name.includes('MacBook') ? 'Apple' : 'Dell') :
             p.category === 'Gaming' ? (p.name.includes('PlayStation') ? 'Sony' : 'Razer') :
             p.category === 'Smart Watches' ? (p.name.includes('Apple') ? 'Apple' : 'Samsung') :
             p.category === 'Cameras' ? (p.name.includes('Fujifilm') ? 'Fujifilm' : 'DJI') : 'Logitech',
      subcategory: 'Premium',
      sku: `SKU-${p.category.substring(0, 3).toUpperCase()}-${idx + 100}`,
      availability: p.stock > 0 ? 'in_stock' : 'out_of_stock',
      product_status: 'active',
      featured: idx % 3 === 0,
      flash_sale: idx % 4 === 0,
      best_seller_override: idx % 5 === 0,
      trending_override: idx % 6 === 0,
      new_arrival: idx % 2 === 0,
      recommended: idx % 3 === 1,
      tags: [p.category, 'Premium', 'Summer'],
      warranty: '1 Year Brand Warranty',
      return_policy: '14 Days Hassle-Free Return'
    }));
    localStorage.setItem('ec_products', JSON.stringify(seededProducts));
  }
  if (!localStorage.getItem('ec_coupons')) {
    localStorage.setItem('ec_coupons', JSON.stringify(SEED_COUPONS));
  }
  if (!localStorage.getItem('ec_shipping')) {
    localStorage.setItem('ec_shipping', JSON.stringify(SEED_SHIPPING));
  }
  if (!localStorage.getItem('ec_taxes')) {
    localStorage.setItem('ec_taxes', JSON.stringify(SEED_TAXES));
  }
  if (!localStorage.getItem('ec_profiles')) {
    localStorage.setItem('ec_profiles', JSON.stringify(SEED_PROFILES));
  }
  if (!localStorage.getItem('ec_orders')) {
    localStorage.setItem('ec_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('ec_categories')) {
    const seededCategories = SEED_MOCK_CATEGORIES.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      image: c.image,
      enabled: true
    }));
    localStorage.setItem('ec_categories', JSON.stringify(seededCategories));
  }
  if (!localStorage.getItem('ec_brands')) {
    const seededBrands = SEED_MOCK_BRANDS.map((b, idx) => ({
      id: `brand-${idx + 1}`,
      name: b.name,
      logo: b.logo,
      enabled: true,
      display_order: idx + 1
    }));
    localStorage.setItem('ec_brands', JSON.stringify(seededBrands));
  }
  if (!localStorage.getItem('ec_banners')) {
    const seededBanners = [
      {
        id: 'banner-1',
        title: 'Summer Gadgets Fest',
        subtitle: 'Exclusive Campaign',
        offer_text: 'Starts at just ₹1,999',
        image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&auto=format&fit=crop&q=80',
        cta_text: 'Explore Deals',
        cta_url: 'All',
        enabled: true
      },
      {
        id: 'banner-2',
        title: 'Summer Mega Sale',
        subtitle: 'Limited Time Offer',
        offer_text: 'Up to 60% OFF on Premium Electronics',
        image_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&auto=format&fit=crop&q=80',
        cta_text: 'Shop Now',
        cta_url: 'All',
        enabled: true
      }
    ];
    localStorage.setItem('ec_banners', JSON.stringify(seededBanners));
  }
  if (!localStorage.getItem('ec_reviews')) {
    const seededReviews = SEED_MOCK_REVIEWS.map((r) => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      rating: r.rating,
      text: r.text,
      verified: r.verified,
      date: r.date,
      status: 'approved',
      pinned: true,
      featured: true
    }));
    localStorage.setItem('ec_reviews', JSON.stringify(seededReviews));
  }
  if (!localStorage.getItem('ec_website_settings')) {
    const seededWebsiteSettings = {
      section_visibility: {
        announcement_bar: true,
        promo_carousel: true,
        flash_sale: true,
        categories: true,
        todays_deals: true,
        new_arrivals: true,
        best_sellers: true,
        trending_now: true,
        promo_banner: true,
        popular_brands: true,
        recommended: true,
        recently_viewed: true,
        why_shop: true,
        customer_reviews: true,
        newsletter: true
      },
      section_order: [
        'promo_carousel',
        'flash_sale',
        'categories',
        'todays_deals',
        'new_arrivals',
        'best_sellers',
        'trending_now',
        'promo_banner',
        'popular_brands',
        'recommended',
        'recently_viewed',
        'why_shop',
        'customer_reviews',
        'newsletter'
      ],
      logo_url: '',
      favicon_url: '',
      theme_color: '#2563eb',
      footer_content: 'Premium high-performance equipment and luxury goods. Senior engineered to ensure seamless scale and elegant utility.',
      contact_info: {
        email: 'support@oghaitong.com',
        phone: '+91 98765 43210',
        address: '102 Tech Enclave, Bangalore, Karnataka, India'
      },
      social_links: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        twitter: 'https://twitter.com',
        youtube: 'https://youtube.com'
      },
      seo_metadata: {
        title: 'OGhaitong Storefront',
        description: 'Premium High-Performance Electronics and Gadgets',
        keywords: 'electronics, gadgets, headphones, smartphones, laptops'
      },
      announcement_bar: {
        text: '⚡ Summer Mega Sale Live: Free International Express Dispatch on All Orders! ⚡',
        enabled: true
      },
      currency: 'INR',
      shipping_settings: {
        default_rate: 99,
        free_threshold: 1999
      },
      tax_settings: {
        default_gst: 18
      }
    };
    localStorage.setItem('ec_website_settings', JSON.stringify(seededWebsiteSettings));
  }
  if (!localStorage.getItem('ec_flash_sale')) {
    const seededFlashSale = {
      enabled: true,
      title: 'Flash Sale',
      subtitle: 'Incredible limited-quantity prices expiring shortly.',
      offer_text: 'Ends Today',
      background_banner: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 4 * 3600 * 1000 + 19 * 60 * 1000).toISOString(),
      cta_text: 'Buy Now',
      cta_url: '',
      display_order: 1,
      product_ids: ['prod-1', 'm-phone-1', 'm-watch-1', 'm-camera-2']
    };
    localStorage.setItem('ec_flash_sale', JSON.stringify(seededFlashSale));
  }
  if (!localStorage.getItem('ec_subscribers')) {
    localStorage.setItem('ec_subscribers', JSON.stringify([]));
  }
  if (!localStorage.getItem('ec_analytics')) {
    const seededAnalytics = SEED_MOCK_ALL_PRODUCTS.map((p, idx) => ({
      id: p.id,
      views: 100 + (idx * 15) % 150,
      wishlist_count: 10 + (idx * 5) % 40,
      cart_count: 5 + (idx * 3) % 20,
      sales_count: 2 + (idx * 2) % 15,
      orders_count: 2 + (idx * 2) % 15,
      ratings_sum: 5 * (4 + (idx % 2)),
      ratings_count: 5
    }));
    localStorage.setItem('ec_analytics', JSON.stringify(seededAnalytics));
  }
}

// Call immediately
initLocalStorageDB();

// Helper functions for local state
function getLocalStorageItem<T>(key: string): T[] {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function setLocalStorageItem<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ============================================================================
// ARCHITECTED DB SERVICE WRAPPER (SEAMLESS SWAP)
// ============================================================================

export const dbService = {
  // --- AUTH & PROFILES ---
  async getCurrentUser(): Promise<Profile | null> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) {
          console.warn('Profiles table check/query failed. Falling back to local admin session.', error.message);
          const currentUser = localStorage.getItem('ec_current_user');
          return currentUser ? JSON.parse(currentUser) : SEED_PROFILES[0];
        }
        return data || null;
      } catch (err: any) {
        console.warn('Supabase session retrieval failed, falling back to local storage:', err.message || err);
        const currentUser = localStorage.getItem('ec_current_user');
        return currentUser ? JSON.parse(currentUser) : SEED_PROFILES[0];
      }
    } else {
      const currentUser = localStorage.getItem('ec_current_user');
      return currentUser ? JSON.parse(currentUser) : null;
    }
  },

  async getProfiles(): Promise<Profile[]> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) {
          console.warn('Profiles table check failed. Returning local mock profiles.', error.message);
          return getLocalStorageItem<Profile>('ec_profiles');
        }
        return data || [];
      } catch (err: any) {
        console.warn('Supabase getProfiles failed, falling back to local profiles:', err.message || err);
        return getLocalStorageItem<Profile>('ec_profiles');
      }
    } else {
      return getLocalStorageItem<Profile>('ec_profiles');
    }
  },

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    if (hasSupabaseConfig && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated');
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const current = await this.getCurrentUser();
      if (!current) throw new Error('Unauthenticated');
      const updated = { ...current, ...profile };
      localStorage.setItem('ec_current_user', JSON.stringify(updated));

      const profiles = getLocalStorageItem<Profile>('ec_profiles');
      const updatedProfiles = profiles.map(p => p.id === updated.id ? updated : p);
      setLocalStorageItem('ec_profiles', updatedProfiles);

      return updated;
    }
  },

  async updateUserRole(userId: string, role: 'admin' | 'customer'): Promise<void> {
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      if (error) throw error;
    } else {
      const profiles = getLocalStorageItem<Profile>('ec_profiles');
      const updated = profiles.map(p => p.id === userId ? { ...p, role } : p);
      setLocalStorageItem('ec_profiles', updated);

      // If updating the active user
      const current = await this.getCurrentUser();
      if (current && current.id === userId) {
        localStorage.setItem('ec_current_user', JSON.stringify({ ...current, role }));
      }
    }
  },

  async signIn(emailOrPhone: string, password?: string, role: 'admin' | 'customer' = 'customer'): Promise<Profile> {
    if (hasSupabaseConfig && supabase) {
      if (!password) {
        throw new Error('Password is required for secure authentication.');
      }
      let loginEmail = emailOrPhone;
      if (!emailOrPhone.includes('@')) {
        // Look up profile by phone
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone', emailOrPhone)
          .maybeSingle();
        if (data?.email) {
          loginEmail = data.email;
        } else {
          throw new Error('No user found with this mobile number. Please sign up or use a registered email.');
        }
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Authentication failed.');
      }

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        // Fallback profile if the row wasn't automatically fetched
        return {
          id: data.user.id,
          email: data.user.email || loginEmail,
          role: 'customer',
          full_name: data.user.user_metadata?.full_name || splitEmailName(loginEmail),
        };
      }
      return profile;
    } else {
      const profiles = getLocalStorageItem<Profile>('ec_profiles');
      // Normalize comparison by stripping non-digits if looking for phone
      const isEmail = emailOrPhone.includes('@');
      let profile = profiles.find(p => {
        if (isEmail) {
          return p.email.toLowerCase() === emailOrPhone.toLowerCase();
        } else {
          const cleanInput = emailOrPhone.replace(/[^0-9]/g, '');
          const cleanPhone = p.phone ? p.phone.replace(/[^0-9]/g, '') : '';
          return cleanPhone && cleanPhone === cleanInput;
        }
      });

      if (!profile) {
        if (!isEmail) {
          throw new Error('No account found with this mobile number. Please sign up first.');
        }
        // Create auto profile for mock login if email
        profile = {
          id: `user-${Math.random().toString(36).substr(2, 9)}`,
          email: emailOrPhone,
          role,
          full_name: splitEmailName(emailOrPhone),
          country: 'India',
          created_at: new Date().toISOString()
        };
        profiles.push(profile);
        setLocalStorageItem('ec_profiles', profiles);
      }

      localStorage.setItem('ec_current_user', JSON.stringify(profile));
      return profile;
    }
  },

  async signUp(email: string, password?: string, fullName: string = '', role: 'admin' | 'customer' = 'customer', phone: string = ''): Promise<Profile> {
    if (hasSupabaseConfig && supabase) {
      if (!password) {
        throw new Error('Password is required for secure sign up.');
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Sign up failed');

      // Update phone on profile if trigger didn't catch it
      if (phone) {
        try {
          await supabase
            .from('profiles')
            .update({ phone, full_name: fullName })
            .eq('id', data.user.id);
        } catch (phoneErr) {
          console.warn('Failed to update extra metadata on profiles table:', phoneErr);
        }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return profile || {
        id: data.user.id,
        email,
        role: 'customer',
        full_name: fullName,
        phone: phone
      };
    } else {
      const profiles = getLocalStorageItem<Profile>('ec_profiles');
      const exists = profiles.some(p => p.email.toLowerCase() === email.toLowerCase());
      if (exists) throw new Error('Email already registered.');

      const profile: Profile = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        email,
        role,
        full_name: fullName,
        phone: phone,
        country: 'India',
        created_at: new Date().toISOString()
      };

      profiles.push(profile);
      setLocalStorageItem('ec_profiles', profiles);
      localStorage.setItem('ec_current_user', JSON.stringify(profile));
      return profile;
    }
  },

  async signOut(): Promise<void> {
    if (hasSupabaseConfig && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('ec_current_user');
    }
  },

  async resetPassword(email: string): Promise<void> {
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (error) throw error;
    } else {
      // Offline fallback
      const profiles = getLocalStorageItem<Profile>('ec_profiles');
      const exists = profiles.some(p => p.email.toLowerCase() === email.toLowerCase());
      if (!exists) {
        throw new Error('Email address not found.');
      }
    }
  },

  // --- PRODUCTS CRUD ---
  async getProducts(): Promise<Product[]> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) {
          console.warn('Products table check failed. Returning local mock products.', error.message);
          return getLocalStorageItem<Product>('ec_products');
        }
        return data || [];
      } catch (err: any) {
        console.warn('Supabase getProducts failed, falling back to local products:', err.message || err);
        return getLocalStorageItem<Product>('ec_products');
      }
    } else {
      return getLocalStorageItem<Product>('ec_products');
    }
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.from('products').insert(product).select().single();
      if (error) throw error;
      return data;
    } else {
      const products = getLocalStorageItem<Product>('ec_products');
      const newProduct = { ...product, id: `prod-${Math.random().toString(36).substr(2, 9)}` };
      products.unshift(newProduct);
      setLocalStorageItem('ec_products', products);
      return newProduct;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const products = getLocalStorageItem<Product>('ec_products');
      const index = products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Product not found');
      const updated = { ...products[index], ...updates };
      products[index] = updated;
      setLocalStorageItem('ec_products', products);
      return updated;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } else {
      const products = getLocalStorageItem<Product>('ec_products');
      const filtered = products.filter(p => p.id !== id);
      setLocalStorageItem('ec_products', filtered);
    }
  },

  // --- COUPONS CRUD ---
  async getCoupons(): Promise<Coupon[]> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase.from('coupons').select('*');
        if (error) {
          console.warn('Coupons table check failed. Returning local mock coupons.', error.message);
          return getLocalStorageItem<Coupon>('ec_coupons');
        }
        return data || [];
      } catch (err: any) {
        console.warn('Supabase getCoupons failed, falling back to local coupons:', err.message || err);
        return getLocalStorageItem<Coupon>('ec_coupons');
      }
    } else {
      return getLocalStorageItem<Coupon>('ec_coupons');
    }
  },

  async createCoupon(coupon: Omit<Coupon, 'id' | 'usage_count'>): Promise<Coupon> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.from('coupons').insert({ ...coupon, usage_count: 0 }).select().single();
      if (error) throw error;
      return data;
    } else {
      const coupons = getLocalStorageItem<Coupon>('ec_coupons');
      const newCoupon: Coupon = { ...coupon, id: `coup-${Math.random().toString(36).substr(2, 9)}`, usage_count: 0 };
      coupons.push(newCoupon);
      setLocalStorageItem('ec_coupons', coupons);
      return newCoupon;
    }
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.from('coupons').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const coupons = getLocalStorageItem<Coupon>('ec_coupons');
      const index = coupons.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Coupon not found');
      const updated = { ...coupons[index], ...updates };
      coupons[index] = updated;
      setLocalStorageItem('ec_coupons', coupons);
      return updated;
    }
  },

  async deleteCoupon(id: string): Promise<void> {
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    } else {
      const coupons = getLocalStorageItem<Coupon>('ec_coupons');
      const filtered = coupons.filter(c => c.id !== id);
      setLocalStorageItem('ec_coupons', filtered);
    }
  },

  // --- SHIPPING RULES CRUD ---
  async getShippingRules(): Promise<ShippingRule[]> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase.from('shipping_rules').select('*');
        if (error) {
          console.warn('Shipping rules table check failed. Returning local mock shipping rules.', error.message);
          return getLocalStorageItem<ShippingRule>('ec_shipping');
        }
        return data || [];
      } catch (err: any) {
        console.warn('Supabase getShippingRules failed, falling back to local shipping rules:', err.message || err);
        return getLocalStorageItem<ShippingRule>('ec_shipping');
      }
    } else {
      return getLocalStorageItem<ShippingRule>('ec_shipping');
    }
  },

  async createShippingRule(rule: Omit<ShippingRule, 'id'>): Promise<ShippingRule> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.from('shipping_rules').insert(rule).select().single();
      if (error) throw error;
      return data;
    } else {
      const rules = getLocalStorageItem<ShippingRule>('ec_shipping');
      const newRule = { ...rule, id: `ship-${Math.random().toString(36).substr(2, 9)}` };
      rules.push(newRule);
      setLocalStorageItem('ec_shipping', rules);
      return newRule;
    }
  },

  async updateShippingRule(id: string, updates: Partial<ShippingRule>): Promise<ShippingRule> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.from('shipping_rules').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const rules = getLocalStorageItem<ShippingRule>('ec_shipping');
      const index = rules.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Shipping rule not found');
      const updated = { ...rules[index], ...updates };
      rules[index] = updated;
      setLocalStorageItem('ec_shipping', rules);
      return updated;
    }
  },

  async deleteShippingRule(id: string): Promise<void> {
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from('shipping_rules').delete().eq('id', id);
      if (error) throw error;
    } else {
      const rules = getLocalStorageItem<ShippingRule>('ec_shipping');
      const filtered = rules.filter(r => r.id !== id);
      setLocalStorageItem('ec_shipping', filtered);
    }
  },

  // --- TAXES CRUD ---
  async getTaxes(): Promise<Tax[]> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase.from('taxes').select('*');
        if (error) {
          console.warn('Taxes table check failed. Returning local mock taxes.', error.message);
          return getLocalStorageItem<Tax>('ec_taxes');
        }
        return data || [];
      } catch (err: any) {
        console.warn('Supabase getTaxes failed, falling back to local taxes:', err.message || err);
        return getLocalStorageItem<Tax>('ec_taxes');
      }
    } else {
      return getLocalStorageItem<Tax>('ec_taxes');
    }
  },

  async createTax(tax: Omit<Tax, 'id'>): Promise<Tax> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.from('taxes').insert(tax).select().single();
      if (error) throw error;
      return data;
    } else {
      const taxes = getLocalStorageItem<Tax>('ec_taxes');
      const newTax = { ...tax, id: `tax-${Math.random().toString(36).substr(2, 9)}` };
      taxes.push(newTax);
      setLocalStorageItem('ec_taxes', taxes);
      return newTax;
    }
  },

  async updateTax(id: string, updates: Partial<Tax>): Promise<Tax> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.from('taxes').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const taxes = getLocalStorageItem<Tax>('ec_taxes');
      const index = taxes.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Tax not found');
      const updated = { ...taxes[index], ...updates };
      taxes[index] = updated;
      setLocalStorageItem('ec_taxes', taxes);
      return updated;
    }
  },

  async deleteTax(id: string): Promise<void> {
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from('taxes').delete().eq('id', id);
      if (error) throw error;
    } else {
      const taxes = getLocalStorageItem<Tax>('ec_taxes');
      const filtered = taxes.filter(t => t.id !== id);
      setLocalStorageItem('ec_taxes', filtered);
    }
  },

  // --- ORDERS MANAGEMENT & HISTORY ---
  async getOrders(): Promise<Order[]> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*)
          `)
          .order('created_at', { ascending: false });
        if (error) {
          console.warn('Orders table check failed. Returning local mock orders.', error.message);
          return getLocalStorageItem<Order>('ec_orders');
        }
        return data || [];
      } catch (err: any) {
        console.warn('Supabase getOrders failed, falling back to local orders:', err.message || err);
        return getLocalStorageItem<Order>('ec_orders');
      }
    } else {
      return getLocalStorageItem<Order>('ec_orders');
    }
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) {
          console.warn('Orders table check failed for user. Returning local mock orders.', error.message);
          const orders = getLocalStorageItem<Order>('ec_orders');
          return orders.filter(o => o.user_id === userId);
        }
        return data || [];
      } catch (err: any) {
        console.warn('Supabase getUserOrders failed, falling back to local orders:', err.message || err);
        const orders = getLocalStorageItem<Order>('ec_orders');
        return orders.filter(o => o.user_id === userId);
      }
    } else {
      const orders = getLocalStorageItem<Order>('ec_orders');
      return orders.filter(o => o.user_id === userId);
    }
  },

  async createOrder(orderData: Omit<Order, 'id' | 'created_at'>, cartItems: CartItem[]): Promise<Order> {
    const orderId = `ord-${Math.random().toString(36).substr(2, 9)}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      created_at: new Date().toISOString(),
      items: cartItems.map(item => ({
        id: `ord-item-${Math.random().toString(36).substr(2, 9)}`,
        order_id: orderId,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image_url: item.product.image_url
      }))
    };

    if (hasSupabaseConfig && supabase) {
      // 1. Insert parent order
      const { error: orderError } = await supabase.from('orders').insert({
        id: newOrder.id,
        user_id: newOrder.user_id,
        status: newOrder.status,
        total_amount: newOrder.total_amount,
        subtotal: newOrder.subtotal,
        tax_amount: newOrder.tax_amount,
        shipping_amount: newOrder.shipping_amount,
        discount_amount: newOrder.discount_amount,
        coupon_code: newOrder.coupon_code,
        shipping_address: newOrder.shipping_address,
        payment_method: newOrder.payment_method,
        payment_id: newOrder.payment_id,
        razorpay_order_id: newOrder.razorpay_order_id
      });
      if (orderError) throw orderError;

      // 2. Insert order items
      const itemsToInsert = newOrder.items!.map(item => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      // 3. Deduct product stock in Supabase
      for (const item of cartItems) {
        const { data: currentProduct } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product.id)
          .single();

        if (currentProduct) {
          const nextStock = Math.max(0, currentProduct.stock - item.quantity);
          await supabase
            .from('products')
            .update({ stock: nextStock })
            .eq('id', item.product.id);
        }
      }

      // 4. If coupon was used, increment usage count
      if (newOrder.coupon_code) {
        const { data: currentCoupon } = await supabase
          .from('coupons')
          .select('id, usage_count')
          .eq('code', newOrder.coupon_code)
          .single();

        if (currentCoupon) {
          await supabase
            .from('coupons')
            .update({ usage_count: currentCoupon.usage_count + 1 })
            .eq('id', currentCoupon.id);
        }
      }

      return newOrder;
    } else {
      const orders = getLocalStorageItem<Order>('ec_orders');
      orders.unshift(newOrder);
      setLocalStorageItem('ec_orders', orders);

      // Deduct stock locally
      const products = getLocalStorageItem<Product>('ec_products');
      cartItems.forEach(item => {
        const pIdx = products.findIndex(p => p.id === item.product.id);
        if (pIdx !== -1) {
          products[pIdx].stock = Math.max(0, products[pIdx].stock - item.quantity);
        }
      });
      setLocalStorageItem('ec_products', products);

      // Coupon usage locally
      if (newOrder.coupon_code) {
        const coupons = getLocalStorageItem<Coupon>('ec_coupons');
        const cIdx = coupons.findIndex(c => c.code.toLowerCase() === newOrder.coupon_code?.toLowerCase());
        if (cIdx !== -1) {
          coupons[cIdx].usage_count += 1;
        }
        setLocalStorageItem('ec_coupons', coupons);
      }

      return newOrder;
    }
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const orders = getLocalStorageItem<Order>('ec_orders');
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) throw new Error('Order not found');
      orders[index].status = status;
      setLocalStorageItem('ec_orders', orders);
      return orders[index];
    }
  },

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    // In local simulation mode or if using local orders:
    const orders = getLocalStorageItem<Order>('ec_orders');
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = 'paid';
      orders[index].payment_id = paymentId;
      setLocalStorageItem('ec_orders', orders);
    }

    if (hasSupabaseConfig && supabase) {
      // Update Supabase order
      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid', payment_id: paymentId })
        .eq('id', orderId);
      if (error) throw error;

      // Log transaction
      await supabase.from('transactions').insert({
        order_id: orderId,
        payment_id: paymentId,
        signature: signature,
        amount: orders[index]?.total_amount || 0,
        status: 'captured'
      });
    }

    return true;
  },

  // --- NEW ADVANCED METHODS FOR FULLY DYNAMIC E-COMMERCE CONFIGURATION ---

  async getCategories(): Promise<Category[]> {
    return getLocalStorageItem<Category>('ec_categories');
  },
  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const categories = getLocalStorageItem<Category>('ec_categories');
    const newCategory: Category = {
      ...category,
      id: `cat-${Math.random().toString(36).substr(2, 9)}`
    };
    categories.push(newCategory);
    setLocalStorageItem('ec_categories', categories);
    return newCategory;
  },
  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const categories = getLocalStorageItem<Category>('ec_categories');
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    categories[idx] = { ...categories[idx], ...category };
    setLocalStorageItem('ec_categories', categories);
    return categories[idx];
  },
  async deleteCategory(id: string): Promise<boolean> {
    const categories = getLocalStorageItem<Category>('ec_categories');
    const filtered = categories.filter(c => c.id !== id);
    setLocalStorageItem('ec_categories', filtered);
    return true;
  },

  async getBrands(): Promise<Brand[]> {
    return getLocalStorageItem<Brand>('ec_brands');
  },
  async createBrand(brand: Omit<Brand, 'id'>): Promise<Brand> {
    const brands = getLocalStorageItem<Brand>('ec_brands');
    const newBrand: Brand = {
      ...brand,
      id: `brand-${Math.random().toString(36).substr(2, 9)}`
    };
    brands.push(newBrand);
    setLocalStorageItem('ec_brands', brands);
    return newBrand;
  },
  async updateBrand(id: string, brand: Partial<Brand>): Promise<Brand> {
    const brands = getLocalStorageItem<Brand>('ec_brands');
    const idx = brands.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Brand not found');
    brands[idx] = { ...brands[idx], ...brand };
    setLocalStorageItem('ec_brands', brands);
    return brands[idx];
  },
  async deleteBrand(id: string): Promise<boolean> {
    const brands = getLocalStorageItem<Brand>('ec_brands');
    const filtered = brands.filter(b => b.id !== id);
    setLocalStorageItem('ec_brands', filtered);
    return true;
  },

  async getBanners(): Promise<PromoBanner[]> {
    return getLocalStorageItem<PromoBanner>('ec_banners');
  },
  async createBanner(banner: Omit<PromoBanner, 'id'>): Promise<PromoBanner> {
    const banners = getLocalStorageItem<PromoBanner>('ec_banners');
    const newBanner: PromoBanner = {
      ...banner,
      id: `banner-${Math.random().toString(36).substr(2, 9)}`
    };
    banners.push(newBanner);
    setLocalStorageItem('ec_banners', banners);
    return newBanner;
  },
  async updateBanner(id: string, banner: Partial<PromoBanner>): Promise<PromoBanner> {
    const banners = getLocalStorageItem<PromoBanner>('ec_banners');
    const idx = banners.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Banner not found');
    banners[idx] = { ...banners[idx], ...banner };
    setLocalStorageItem('ec_banners', banners);
    return banners[idx];
  },
  async deleteBanner(id: string): Promise<boolean> {
    const banners = getLocalStorageItem<PromoBanner>('ec_banners');
    const filtered = banners.filter(b => b.id !== id);
    setLocalStorageItem('ec_banners', filtered);
    return true;
  },

  async getReviews(): Promise<Review[]> {
    return getLocalStorageItem<Review>('ec_reviews');
  },
  async addReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
    const reviews = getLocalStorageItem<Review>('ec_reviews');
    const newReview: Review = {
      ...review,
      id: `rev-${Math.random().toString(36).substr(2, 9)}`,
      date: 'Just now'
    };
    reviews.unshift(newReview);
    setLocalStorageItem('ec_reviews', reviews);
    return newReview;
  },
  async updateReviewStatus(id: string, status: Review['status']): Promise<Review> {
    const reviews = getLocalStorageItem<Review>('ec_reviews');
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Review not found');
    reviews[idx].status = status;
    setLocalStorageItem('ec_reviews', reviews);
    return reviews[idx];
  },
  async togglePinReview(id: string): Promise<Review> {
    const reviews = getLocalStorageItem<Review>('ec_reviews');
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Review not found');
    reviews[idx].pinned = !reviews[idx].pinned;
    setLocalStorageItem('ec_reviews', reviews);
    return reviews[idx];
  },
  async deleteReview(id: string): Promise<boolean> {
    const reviews = getLocalStorageItem<Review>('ec_reviews');
    const filtered = reviews.filter(r => r.id !== id);
    setLocalStorageItem('ec_reviews', filtered);
    return true;
  },

  async getSubscribers(): Promise<Subscriber[]> {
    return getLocalStorageItem<Subscriber>('ec_subscribers');
  },
  async addSubscriber(email: string): Promise<Subscriber> {
    const subs = getLocalStorageItem<Subscriber>('ec_subscribers');
    if (subs.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('You are already subscribed to our newsletter.');
    }
    const newSub: Subscriber = {
      id: `sub-${Math.random().toString(36).substr(2, 9)}`,
      email,
      subscribed_at: new Date().toISOString()
    };
    subs.unshift(newSub);
    setLocalStorageItem('ec_subscribers', subs);
    return newSub;
  },

  async getWebsiteSettings(): Promise<WebsiteSettings> {
    const data = localStorage.getItem('ec_website_settings');
    if (!data) return {} as WebsiteSettings;
    return JSON.parse(data);
  },
  async updateWebsiteSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const current = await this.getWebsiteSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('ec_website_settings', JSON.stringify(updated));
    return updated;
  },
  async getFlashSaleConfig(): Promise<FlashSaleConfig> {
    const data = localStorage.getItem('ec_flash_sale');
    if (!data) return {} as FlashSaleConfig;
    return JSON.parse(data);
  },
  async updateFlashSaleConfig(config: Partial<FlashSaleConfig>): Promise<FlashSaleConfig> {
    const current = await this.getFlashSaleConfig();
    const updated = { ...current, ...config };
    localStorage.setItem('ec_flash_sale', JSON.stringify(updated));
    return updated;
  },

  async getAnalytics(): Promise<ProductAnalytics[]> {
    return getLocalStorageItem<ProductAnalytics>('ec_analytics');
  },
  async trackProductInteraction(productId: string, action: 'views' | 'wishlist_count' | 'cart_count' | 'sales_count' | 'orders_count' | 'rating', ratingValue?: number): Promise<void> {
    const analytics = getLocalStorageItem<ProductAnalytics>('ec_analytics');
    let item = analytics.find(a => a.id === productId);
    if (!item) {
      item = {
        id: productId,
        views: 0,
        wishlist_count: 0,
        cart_count: 0,
        sales_count: 0,
        orders_count: 0,
        ratings_sum: 0,
        ratings_count: 0
      };
      analytics.push(item);
    }
    if (action === 'rating' && ratingValue !== undefined) {
      item.ratings_sum += ratingValue;
      item.ratings_count += 1;
    } else if (action !== 'rating') {
      item[action] = (item[action] || 0) + 1;
    }
    setLocalStorageItem('ec_analytics', analytics);
  },

  async getTrendingProducts(): Promise<Product[]> {
    const allProducts = await this.getProducts();
    const analytics = await this.getAnalytics();
    
    // Sort in-stock active products
    const activeProducts = allProducts.filter(p => p.product_status !== 'draft');
    
    // We compute score for active products
    const scored = activeProducts.map(p => {
      const pAnalytic = analytics.find(a => a.id === p.id) || {
        views: 0, wishlist_count: 0, cart_count: 0, sales_count: 0, orders_count: 0, ratings_sum: 0, ratings_count: 0
      };
      
      const isOutOfStock = p.stock <= 0;
      
      // score calculation: views*1 + wishlist*2 + cart*3 + sales*5 + orders*5 + ratingAvg*4
      const ratingAvg = pAnalytic.ratings_count > 0 ? (pAnalytic.ratings_sum / pAnalytic.ratings_count) : 4.5;
      let score = pAnalytic.views * 1 +
                  pAnalytic.wishlist_count * 2 +
                  pAnalytic.cart_count * 3 +
                  pAnalytic.sales_count * 5 +
                  pAnalytic.orders_count * 5 +
                  ratingAvg * 4;
                  
      // If product is out of stock, reduce score massively (so we automatically prefer in-stock)
      if (isOutOfStock) {
        score -= 10000;
      }
      
      // Override boost
      if (p.trending_override) {
        score += 5000;
      }
      
      return { product: p, score };
    });
    
    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.product);
  },

  async getBestSellers(): Promise<Product[]> {
    const allProducts = await this.getProducts();
    const analytics = await this.getAnalytics();
    
    const activeProducts = allProducts.filter(p => p.product_status !== 'draft');
    
    const scored = activeProducts.map(p => {
      const pAnalytic = analytics.find(a => a.id === p.id) || {
        sales_count: 0, orders_count: 0
      };
      
      let score = pAnalytic.sales_count * 10 + pAnalytic.orders_count * 5;
      
      if (p.stock <= 0) {
        score -= 10000; // Prefer in stock
      }
      
      if (p.best_seller_override) {
        score += 5000; // Override boost
      }
      
      return { product: p, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.product);
  },

  async getNewArrivals(limit: number = 8): Promise<Product[]> {
    const allProducts = await this.getProducts();
    const activeProducts = allProducts.filter(p => p.product_status !== 'draft');
    
    // Sort active products by created_at descending (or id as fallback)
    const sorted = [...activeProducts].sort((a, b) => {
      if (a.new_arrival && !b.new_arrival) return -1;
      if (!a.new_arrival && b.new_arrival) return 1;
      
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
    
    return sorted.slice(0, limit);
  },

  async getRecommendedProducts(userId?: string): Promise<Product[]> {
    const allProducts = await this.getProducts();
    const activeProducts = allProducts.filter(p => p.product_status !== 'draft' && p.stock > 0);
    
    if (!userId) {
      // Not logged in: return featured active in-stock products
      return activeProducts.filter(p => p.featured || p.recommended).slice(0, 8);
    }
    
    // Logged in: Recommend based on order history categories if any
    const orders = getLocalStorageItem<Order>('ec_orders');
    const userOrders = orders.filter(o => o.user_id === userId);
    
    const purchasedCategories = new Set<string>();
    userOrders.forEach(o => {
      o.items?.forEach(item => {
        const prod = allProducts.find(p => p.id === item.product_id);
        if (prod) {
          purchasedCategories.add(prod.category);
        }
      });
    });
    
    if (purchasedCategories.size === 0) {
      return activeProducts.filter(p => p.featured || p.recommended).slice(0, 8);
    }
    
    // Score based on matching category
    const scored = activeProducts.map(p => {
      let score = 0;
      if (purchasedCategories.has(p.category)) {
        score += 100;
      }
      if (p.recommended) {
        score += 50;
      }
      if (p.featured) {
        score += 25;
      }
      return { product: p, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.product).slice(0, 8);
  }
};

// Helper for splitting email names nicely
function splitEmailName(email: string): string {
  const parts = email.split('@');
  if (parts.length === 0) return 'Guest User';
  const name = parts[0].replace(/[^a-zA-Z]/g, ' ');
  return name.replace(/\b\w/g, c => c.toUpperCase());
}
