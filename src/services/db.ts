import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { Product, Coupon, ShippingRule, Tax, Order, Profile, CartItem, OrderItem } from '../types';

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
    localStorage.setItem('ec_products', JSON.stringify(SEED_PRODUCTS));
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
  if (!localStorage.getItem('ec_current_user')) {
    // Default to the admin profile for easy out-of-the-box exploration
    localStorage.setItem('ec_current_user', JSON.stringify(SEED_PROFILES[0]));
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data || null;
    } else {
      const currentUser = localStorage.getItem('ec_current_user');
      return currentUser ? JSON.parse(currentUser) : null;
    }
  },

  async getProfiles(): Promise<Profile[]> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
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

  async signIn(email: string, password?: string, role: 'admin' | 'customer' = 'customer'): Promise<Profile> {
    if (hasSupabaseConfig && supabase) {
      if (!password) {
        throw new Error('Password is required for secure authentication.');
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
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
          email: data.user.email || email,
          role: 'customer',
          full_name: data.user.user_metadata?.full_name || splitEmailName(email),
        };
      }
      return profile;
    } else {
      const profiles = getLocalStorageItem<Profile>('ec_profiles');
      let profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

      if (!profile) {
        // Create auto profile for mock login
        profile = {
          id: `user-${Math.random().toString(36).substr(2, 9)}`,
          email,
          role,
          full_name: splitEmailName(email),
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

  async signUp(email: string, password?: string, fullName: string = '', role: 'admin' | 'customer' = 'customer'): Promise<Profile> {
    if (hasSupabaseConfig && supabase) {
      if (!password) {
        throw new Error('Password is required for secure sign up.');
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (error) throw error;
      if (!data.user) throw new Error('Sign up failed');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return profile || {
        id: data.user.id,
        email,
        role: 'customer',
        full_name: fullName
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

  // --- PRODUCTS CRUD ---
  async getProducts(): Promise<Product[]> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase.from('coupons').select('*');
      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase.from('shipping_rules').select('*');
      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase.from('taxes').select('*');
      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalStorageItem<Order>('ec_orders');
    }
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
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
  }
};

// Helper for splitting email names nicely
function splitEmailName(email: string): string {
  const parts = email.split('@');
  if (parts.length === 0) return 'Guest User';
  const name = parts[0].replace(/[^a-zA-Z]/g, ' ');
  return name.replace(/\b\w/g, c => c.toUpperCase());
}
