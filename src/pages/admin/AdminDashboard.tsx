import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, ShoppingCart, Percent, Truck, PercentSquare, Eye, Edit2, Trash2, 
  Plus, Save, Users, RefreshCw, Layers, CheckCircle2, AlertCircle, Coins, LogOut,
  Settings, Image, Star, Mail, ArrowUp, ArrowDown, Check, Folder, Award
} from 'lucide-react';
import { 
  Product, Coupon, ShippingRule, Tax, Order, Profile,
  Category, Brand, PromoBanner, Review, WebsiteSettings, FlashSaleConfig, Subscriber
} from '../../types';
import { dbService } from '../../services/db';

interface AdminDashboardProps {
  currentUser: Profile | null;
  setCurrentView: (view: { page: string; productId?: string }) => void;
  onLogout: () => void;
}

type AdminTab = 'products' | 'orders' | 'coupons' | 'shipping' | 'taxes' | 'users' | 'categories' | 'brands' | 'banners' | 'reviews' | 'subscribers' | 'settings';

export default function AdminDashboard({
  currentUser,
  setCurrentView,
  onLogout
}: AdminDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Sync tab state with URL pathname
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin/dashboard') {
      setActiveTab('products');
    } else if (path === '/admin/products') {
      setActiveTab('products');
    } else if (path === '/admin/orders') {
      setActiveTab('orders');
    } else if (path === '/admin/coupons') {
      setActiveTab('coupons');
    } else if (path === '/admin/shipping') {
      setActiveTab('shipping');
    } else if (path === '/admin/categories') {
      setActiveTab('categories');
    } else if (path === '/admin/brands') {
      setActiveTab('brands');
    } else if (path === '/admin/banners') {
      setActiveTab('banners');
    } else if (path === '/admin/reviews') {
      setActiveTab('reviews');
    } else if (path === '/admin/subscribers') {
      setActiveTab('subscribers');
    } else if (path === '/admin/settings') {
      setActiveTab('settings');
    } else if (path.startsWith('/admin/')) {
      const segment = path.split('/')[2];
      if (['products', 'orders', 'coupons', 'shipping', 'taxes', 'users', 'categories', 'brands', 'banners', 'reviews', 'subscribers', 'settings'].includes(segment)) {
        setActiveTab(segment as AdminTab);
      }
    }
  }, [location.pathname]);

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);

  // Extended Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);
  const [flashSaleConfig, setFlashSaleConfig] = useState<FlashSaleConfig | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Editing / Create Modal states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [editingShipping, setEditingShipping] = useState<Partial<ShippingRule> | null>(null);
  const [editingTax, setEditingTax] = useState<Partial<Tax> | null>(null);

  // New Editing States
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingBrand, setEditingBrand] = useState<Partial<Brand> | null>(null);
  const [editingBanner, setEditingBanner] = useState<Partial<PromoBanner> | null>(null);
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadAllAdminData();
    }
  }, [currentUser]);

  const loadAllAdminData = async () => {
    setLoading(true);
    setActionSuccess('');
    setActionError('');
    try {
      const [p, o, c, s, t, u, cats, bnds, bans, revs, subs, sett, fs] = await Promise.all([
        dbService.getProducts(),
        dbService.getOrders(),
        dbService.getCoupons(),
        dbService.getShippingRules(),
        dbService.getTaxes(),
        dbService.getProfiles(),
        dbService.getCategories(),
        dbService.getBrands(),
        dbService.getBanners(),
        dbService.getReviews(),
        dbService.getSubscribers(),
        dbService.getWebsiteSettings(),
        dbService.getFlashSaleConfig()
      ]);

      setProducts(p);
      setOrders(o);
      setCoupons(c);
      setShippingRules(s);
      setTaxes(t);
      setUsers(u);
      setCategories(cats);
      setBrands(bnds);
      setBanners(bans);
      setReviews(revs);
      setSubscribers(subs);
      setWebsiteSettings(sett);
      setFlashSaleConfig(fs);
    } catch (err: any) {
      console.error('Error loading administrative lists:', err);
      setActionError('Failed to fetch real-time datastores.');
    } finally {
      setLoading(false);
    }
  };

  // --- PRODUCTS CRUD ACTIONS ---
  const handleProductSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setActionSuccess('');
    setActionError('');

    try {
      const payload = {
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: Number(editingProduct.price) || 0,
        compare_at_price: editingProduct.compare_at_price ? Number(editingProduct.compare_at_price) : undefined,
        image_url: editingProduct.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        stock: Number(editingProduct.stock) || 0,
        category: editingProduct.category || 'Lifestyle',
        brand: editingProduct.brand || '',
        product_status: editingProduct.product_status || 'active',
        sku: editingProduct.sku || '',
        weight: editingProduct.weight ? Number(editingProduct.weight) : undefined,
        product_tags: Array.isArray(editingProduct.product_tags) 
          ? editingProduct.product_tags 
          : (editingProduct.product_tags as string || '').split(',').map(t => t.trim()).filter(Boolean),
        product_badge: editingProduct.product_badge || '',
        flash_sale: editingProduct.flash_sale ?? false,
        trending_override: editingProduct.trending_override ?? false,
        best_seller_override: editingProduct.best_seller_override ?? false,
        new_arrival_override: editingProduct.new_arrival_override ?? false,
        recommended_override: editingProduct.recommended_override ?? false
      };

      if (editingProduct.id) {
        await dbService.updateProduct(editingProduct.id, payload);
        setActionSuccess('Product item updated successfully.');
      } else {
        await dbService.createProduct({
          ...payload,
          id: 'prod-' + Date.now(),
          created_at: new Date().toISOString()
        } as any);
        setActionSuccess('New premium product added to index.');
      }
      setEditingProduct(null);
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to sync product changes.');
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await dbService.deleteProduct(id);
      setActionSuccess('Product has been deleted.');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // --- COUPONS CRUD ACTIONS ---
  const handleCouponSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    setActionSuccess('');
    setActionError('');

    try {
      const payload = {
        code: (editingCoupon.code || '').toUpperCase(),
        discount_type: editingCoupon.discount_type || 'percentage',
        discount_value: Number(editingCoupon.discount_value) || 0,
        min_purchase: Number(editingCoupon.min_purchase) || 0,
        expiry_date: editingCoupon.expiry_date || '2028-12-31',
        usage_limit: Number(editingCoupon.usage_limit) || 100
      };

      if (editingCoupon.id) {
        await dbService.updateCoupon(editingCoupon.id, payload);
        setActionSuccess('WooCommerce Coupon specifications updated.');
      } else {
        await dbService.createCoupon(payload);
        setActionSuccess('New active coupon registered.');
      }
      setEditingCoupon(null);
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCouponDelete = async (id: string) => {
    if (!confirm('Delete coupon code?')) return;
    try {
      await dbService.deleteCoupon(id);
      setActionSuccess('Promo coupon code deleted.');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // --- SHIPPING RULES CRUD ACTIONS ---
  const handleShippingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipping) return;
    setActionSuccess('');
    setActionError('');

    try {
      const payload = {
        name: editingShipping.name || '',
        rate: Number(editingShipping.rate) || 0,
        free_delivery_threshold: Number(editingShipping.free_delivery_threshold) || 0
      };

      if (editingShipping.id) {
        await dbService.updateShippingRule(editingShipping.id, payload);
        setActionSuccess('Shipping rules modifications updated.');
      } else {
        await dbService.createShippingRule(payload);
        setActionSuccess('New Logistics dispatch rule created.');
      }
      setEditingShipping(null);
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleShippingDelete = async (id: string) => {
    if (!confirm('Remove this logistics class?')) return;
    try {
      await dbService.deleteShippingRule(id);
      setActionSuccess('Shipping class deleted.');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // --- TAXES CRUD ACTIONS ---
  const handleTaxSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTax) return;
    setActionSuccess('');
    setActionError('');

    try {
      const payload = {
        name: editingTax.name || '',
        rate: Number(editingTax.rate) || 0
      };

      if (editingTax.id) {
        await dbService.updateTax(editingTax.id, payload);
        setActionSuccess('Tax rule configuration updated.');
      } else {
        await dbService.createTax(payload);
        setActionSuccess('New Tax threshold (GST/VAT) added.');
      }
      setEditingTax(null);
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleTaxDelete = async (id: string) => {
    if (!confirm('Remove this tax bracket?')) return;
    try {
      await dbService.deleteTax(id);
      setActionSuccess('Tax bracket removed.');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // --- ORDER LIFECYCLE MANAGEMENT ---
  const handleOrderStatusChange = async (orderId: string, status: Order['status']) => {
    setActionSuccess('');
    setActionError('');
    try {
      await dbService.updateOrderStatus(orderId, status);
      setActionSuccess(`Order #${orderId} has been set to ${status.toUpperCase()}`);
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update order status');
    }
  };

  // --- USER ACCESS MANAGEMENT ---
  const handleUserRoleChange = async (userId: string, currentRole: 'admin' | 'customer') => {
    setActionSuccess('');
    setActionError('');
    const targetRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      await dbService.updateUserRole(userId, targetRole);
      setActionSuccess(`User account role updated successfully.`);
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // --- CATEGORIES CRUD ACTIONS ---
  const handleCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setActionSuccess('');
    setActionError('');
    try {
      if (editingCategory.id) {
        await dbService.updateCategory(editingCategory.id, editingCategory);
        setActionSuccess('Category updated.');
      } else {
        await dbService.createCategory(editingCategory as any);
        setActionSuccess('New category created.');
      }
      setEditingCategory(null);
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save category');
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await dbService.deleteCategory(id);
      setActionSuccess('Category deleted.');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // --- BRANDS CRUD ACTIONS ---
  const handleBrandSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;
    setActionSuccess('');
    setActionError('');
    try {
      if (editingBrand.id) {
        await dbService.updateBrand(editingBrand.id, editingBrand);
        setActionSuccess('Brand updated.');
      } else {
        await dbService.createBrand(editingBrand as any);
        setActionSuccess('New brand created.');
      }
      setEditingBrand(null);
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save brand');
    }
  };

  const handleBrandDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await dbService.deleteBrand(id);
      setActionSuccess('Brand deleted.');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // --- BANNER CRUD ACTIONS ---
  const handleBannerSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    setActionSuccess('');
    setActionError('');
    try {
      if (editingBanner.id) {
        await dbService.updateBanner(editingBanner.id, editingBanner);
        setActionSuccess('Banner updated.');
      } else {
        await dbService.createBanner(editingBanner as any);
        setActionSuccess('New banner created.');
      }
      setEditingBanner(null);
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save banner');
    }
  };

  const handleBannerDelete = async (id: string) => {
    if (!confirm('Delete banner?')) return;
    try {
      await dbService.deleteBanner(id);
      setActionSuccess('Banner deleted.');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // --- REVIEWS CRUD ACTIONS ---
  const handleReviewSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    setActionSuccess('');
    setActionError('');
    try {
      if (editingReview.id) {
        if (editingReview.status !== undefined) {
          await dbService.updateReviewStatus(editingReview.id, editingReview.status);
        }
        setActionSuccess('Review updated.');
      } else {
        await dbService.addReview({
          name: editingReview.name || 'Anonymous Client',
          rating: Number(editingReview.rating) || 5,
          text: editingReview.text || '',
          avatar: editingReview.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          verified: editingReview.verified ?? true,
          pinned: editingReview.pinned ?? false,
          status: editingReview.status || 'approved'
        });
        setActionSuccess('New client review logged.');
      }
      setEditingReview(null);
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save review');
    }
  };

  const handleReviewDelete = async (id: string) => {
    if (!confirm('Delete review?')) return;
    try {
      await dbService.deleteReview(id);
      setActionSuccess('Review deleted.');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleTogglePinReview = async (id: string) => {
    try {
      await dbService.togglePinReview(id);
      setActionSuccess('Review pin toggled.');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleToggleReviewStatus = async (id: string, currentStatus: Review['status']) => {
    try {
      const next: Review['status'] = currentStatus === 'approved' ? 'pending' : 'approved';
      await dbService.updateReviewStatus(id, next);
      setActionSuccess('Review status updated.');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // --- WEBSITE SETTINGS ACTIONS ---
  const handleWebsiteSettingsSave = async (settingsPayload: Partial<WebsiteSettings>) => {
    setActionSuccess('');
    setActionError('');
    try {
      await dbService.updateWebsiteSettings(settingsPayload);
      setActionSuccess('Website Settings updated successfully!');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update website settings');
    }
  };

  const handleFlashSaleConfigSave = async (fsPayload: Partial<FlashSaleConfig>) => {
    setActionSuccess('');
    setActionError('');
    try {
      await dbService.updateFlashSaleConfig(fsPayload);
      setActionSuccess('Flash Sale configuration updated!');
      loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update flash sale settings');
    }
  };


  if (currentUser?.role !== 'admin') {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Restricted Administration</h3>
        <p className="text-slate-500 text-sm mt-1">Only active Admin profiles have rights to edit stock indices or configure coupon discount rates.</p>
        <button
          onClick={() => setCurrentView({ page: 'store' })}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in relative">
      
      {/* Top Controls Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>OGhaitong Admin Console</span>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-mono rounded font-bold uppercase tracking-wider">WooCommerce Level</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure active products, inspect checkout logs, set GST values, and manage users.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAllAdminData}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-all"
            title="Reload database lists"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-all text-xs font-semibold cursor-pointer"
            title="Securely Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Notifications Banners */}
      {actionSuccess && (
        <p className="mb-6 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </p>
      )}
      {actionError && (
        <p className="mb-6 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100 p-3.5 rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </p>
      )}

      {/* Tab-Based Navigation Rails */}
      <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-none border-b border-slate-200 mb-8">
        {[
          { tab: 'products', name: 'Products Catalog', icon: Package },
          { tab: 'orders', name: 'Customer Orders', icon: ShoppingCart },
          { tab: 'coupons', name: 'Promo Coupons', icon: Percent },
          { tab: 'shipping', name: 'Shipping Rules', icon: Truck },
          { tab: 'taxes', name: 'Tax Structure', icon: Coins },
          { tab: 'users', name: 'User Management', icon: Users },
          { tab: 'categories', name: 'Categories', icon: Folder },
          { tab: 'brands', name: 'Brands', icon: Award },
          { tab: 'banners', name: 'Promo Banners', icon: Image },
          { tab: 'reviews', name: 'Reviews', icon: Star },
          { tab: 'subscribers', name: 'Subscribers', icon: Mail },
          { tab: 'settings', name: 'Website Settings', icon: Settings }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.tab}
              onClick={() => { 
                setActiveTab(item.tab as AdminTab); 
                setActionSuccess(''); 
                setActionError(''); 
                navigate(`/admin/${item.tab}`);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center space-x-1.5 border ${
                activeTab === item.tab
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 hover:text-indigo-600 border-slate-200 hover:border-indigo-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* ----------------------------------------------------------------------
          TAB PANEL: PRODUCTS CRUD
         ---------------------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">Products Inventory</h2>
            <button
              onClick={() => setEditingProduct({})}
              className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Product edit/creation inline stage */}
          {editingProduct && (
            <form onSubmit={handleProductSave} className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {editingProduct.id ? 'Edit Product Parameters' : 'Register New Catalog Entry'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Product Name *</label>
                  <input
                    type="text" required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category *</label>
                  <input
                    type="text" required
                    placeholder="e.g. Audio, Watches"
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Image Asset URL *</label>
                  <input
                    type="url" required
                    value={editingProduct.image_url || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Catalog Description</label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20 h-16"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Price (INR) *</label>
                  <input
                    type="number" required min="0"
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Compare At Price (M.R.P)</label>
                  <input
                    type="number" min="0"
                    value={editingProduct.compare_at_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, compare_at_price: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Available Stock *</label>
                  <input
                    type="number" required min="0"
                    value={editingProduct.stock === undefined ? '' : editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Nike"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SKU / Model Number</label>
                  <input
                    type="text"
                    placeholder="e.g. OGT-AUD-09"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Weight (kg)</label>
                  <input
                    type="number" step="0.01" min="0"
                    placeholder="e.g. 0.25"
                    value={editingProduct.weight || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status</label>
                  <select
                    value={editingProduct.product_status || 'active'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, product_status: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Product Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. smart, premium, audio"
                    value={editingProduct.product_tags ? (Array.isArray(editingProduct.product_tags) ? editingProduct.product_tags.join(', ') : editingProduct.product_tags) : ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, product_tags: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Product Badge / Label</label>
                  <input
                    type="text"
                    placeholder="e.g. SALE, 15% OFF, TRENDING"
                    value={editingProduct.product_badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, product_badge: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Homepage Visibility & Overrides</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-3 border border-slate-200/60 rounded-xl">
                  <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.flash_sale || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, flash_sale: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span>Flash Sale</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.trending_override || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, trending_override: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span>Trending override</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.best_seller_override || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, best_seller_override: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span>Best Seller override</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.new_arrival_override || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, new_arrival_override: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span>New Arrival override</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.recommended_override || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, recommended_override: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span>Recommended override</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Product</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Product Table Grid */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Product Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">M.R.P</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-100 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">ID: {p.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-600 rounded-md font-mono uppercase">{p.category}</span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-800">₹{p.price.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-mono text-slate-400">
                        {p.compare_at_price ? `₹${p.compare_at_price.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`font-bold font-mono ${p.stock <= 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleProductDelete(p.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB PANEL: CUSTOMER ORDERS
         ---------------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">Active Customer Orders</h2>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Recipient Detail</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Pay Method</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4 text-right">Update Order Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-indigo-600 font-mono block">{order.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{new Date(order.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{order.shipping_address.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">Phone: {order.shipping_address.phone}</span>
                      </td>
                      <td className="p-4 font-mono font-extrabold text-slate-900">₹{order.total_amount.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-600 rounded-md font-mono uppercase">{order.payment_method}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${
                          order.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          order.status === 'delivered' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                          order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value as Order['status'])}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB PANEL: PROMO COUPONS
         ---------------------------------------------------------------------- */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">Active Store Coupons</h2>
            <button
              onClick={() => setEditingCoupon({ discount_type: 'percentage' })}
              className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>

          {editingCoupon && (
            <form onSubmit={handleCouponSave} className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Configure Coupon Properties</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Coupon Code *</label>
                  <input
                    type="text" required placeholder="e.g. EXTRA20"
                    value={editingCoupon.code || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs uppercase font-mono focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Discount Type</label>
                  <select
                    value={editingCoupon.discount_type || 'percentage'}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value as Coupon['discount_type'] })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs text-slate-700"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Rate Discount (₹)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Discount Value *</label>
                  <input
                    type="number" required min="1"
                    value={editingCoupon.discount_value || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-mono focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Min Purchase Limit *</label>
                  <input
                    type="number" required min="0"
                    value={editingCoupon.min_purchase === undefined ? '' : editingCoupon.min_purchase}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, min_purchase: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Expiry Date *</label>
                  <input
                    type="date" required
                    value={editingCoupon.expiry_date || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, expiry_date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Usage Limit count *</label>
                  <input
                    type="number" required min="1"
                    value={editingCoupon.usage_limit || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, usage_limit: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold">Save Coupon</button>
                <button type="button" onClick={() => setEditingCoupon(null)} className="px-4 py-2 bg-white text-slate-600 border rounded-lg text-xs font-semibold">Cancel</button>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Coupon Code</th>
                    <th className="p-4">Discount Rate</th>
                    <th className="p-4">Min. Purchase Required</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Usage Tracker</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-mono">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800 uppercase font-sans">{c.code}</td>
                      <td className="p-4 font-bold text-emerald-600">
                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value.toLocaleString('en-IN')} OFF`}
                      </td>
                      <td className="p-4">₹{c.min_purchase.toLocaleString('en-IN')}</td>
                      <td className="p-4">{c.expiry_date}</td>
                      <td className="p-4 text-slate-500">
                        {c.usage_count} / {c.usage_limit} used
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button onClick={() => setEditingCoupon(c)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleCouponDelete(c.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB PANEL: SHIPPING RULES
         ---------------------------------------------------------------------- */}
      {activeTab === 'shipping' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">Logistic Dispatch Classes</h2>
            <button
              onClick={() => setEditingShipping({})}
              className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Logistic Rule</span>
            </button>
          </div>

          {editingShipping && (
            <form onSubmit={handleShippingSave} className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Configure Dispatch Class</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Shipping Class Name *</label>
                  <input
                    type="text" required placeholder="e.g. Express Air"
                    value={editingShipping.name || ''}
                    onChange={(e) => setEditingShipping({ ...editingShipping, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Standard Rate (INR) *</label>
                  <input
                    type="number" required min="0"
                    value={editingShipping.rate === undefined ? '' : editingShipping.rate}
                    onChange={(e) => setEditingShipping({ ...editingShipping, rate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Free Delivery Min. Order Threshold *</label>
                  <input
                    type="number" required min="0"
                    value={editingShipping.free_delivery_threshold === undefined ? '' : editingShipping.free_delivery_threshold}
                    onChange={(e) => setEditingShipping({ ...editingShipping, free_delivery_threshold: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold">Save Rule</button>
                <button type="button" onClick={() => setEditingShipping(null)} className="px-4 py-2 bg-white text-slate-600 border rounded-lg text-xs font-semibold">Cancel</button>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Shipping Method</th>
                    <th className="p-4">Standard Rate</th>
                    <th className="p-4">Free Shipping Min Order Threshold</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-mono">
                  {shippingRules.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800 uppercase font-sans">{r.name}</td>
                      <td className="p-4">₹{r.rate.toLocaleString('en-IN')}</td>
                      <td className="p-4">₹{r.free_delivery_threshold.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button onClick={() => setEditingShipping(r)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleShippingDelete(r.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB PANEL: TAX STRUCTURES (GST)
         ---------------------------------------------------------------------- */}
      {activeTab === 'taxes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">Active Tax Configurations</h2>
            <button
              onClick={() => setEditingTax({})}
              className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tax Rule</span>
            </button>
          </div>

          {editingTax && (
            <form onSubmit={handleTaxSave} className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Configure Tax Threshold</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tax Name *</label>
                  <input
                    type="text" required placeholder="e.g. Standard CGST/SGST"
                    value={editingTax.name || ''}
                    onChange={(e) => setEditingTax({ ...editingTax, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tax rate percentage (%) *</label>
                  <input
                    type="number" required min="0" max="100" step="0.1"
                    value={editingTax.rate === undefined ? '' : editingTax.rate}
                    onChange={(e) => setEditingTax({ ...editingTax, rate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold">Save Tax Bracket</button>
                <button type="button" onClick={() => setEditingTax(null)} className="px-4 py-2 bg-white text-slate-600 border rounded-lg text-xs font-semibold">Cancel</button>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Tax Description Name</th>
                    <th className="p-4">Rate Percentage</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-mono">
                  {taxes.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800 uppercase font-sans">{t.name}</td>
                      <td className="p-4 font-bold text-slate-900">{t.rate}%</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button onClick={() => setEditingTax(t)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleTaxDelete(t.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB PANEL: USER MANAGEMENT
         ---------------------------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">Registered Platform Users</h2>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">User Info Details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Address Coordinates</th>
                    <th className="p-4 text-right">Modify Access Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{u.full_name || 'Guest User'}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{u.email}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                          u.role === 'admin'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 leading-relaxed font-light text-slate-500">
                        {u.address ? `${u.address}, ${u.city} (${u.zip})` : 'No billing address saved yet.'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleUserRoleChange(u.id, u.role)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Change to {u.role === 'admin' ? 'Customer' : 'Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB PANEL: CATEGORIES
         ---------------------------------------------------------------------- */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">E-Commerce Categories</h2>
            <button
              onClick={() => setEditingCategory({ name: '', icon: '📦', count: 0 })}
              className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          {editingCategory && (
            <form onSubmit={handleCategorySave} className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 max-w-xl animate-fade-in">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {editingCategory.id ? 'Edit Category' : 'Create Category'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category Name *</label>
                  <input
                    type="text" required placeholder="e.g. Audio"
                    value={editingCategory.name || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Emoji Icon *</label>
                  <input
                    type="text" required placeholder="e.g. 🎧, ⌚"
                    value={editingCategory.icon || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs text-center focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Display Item Count</label>
                  <input
                    type="number" min="0"
                    value={editingCategory.count ?? 0}
                    onChange={(e) => setEditingCategory({ ...editingCategory, count: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Category</span>
                </button>
                <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 bg-white text-slate-600 border rounded-lg text-xs font-semibold">Cancel</button>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 w-16 text-center">Icon</th>
                    <th className="p-4">Category Name</th>
                    <th className="p-4">Virtual Item Count</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-center text-2xl">{cat.icon}</td>
                      <td className="p-4 font-bold text-slate-800">{cat.name}</td>
                      <td className="p-4 font-mono font-bold text-slate-500">{cat.count} items</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button onClick={() => setEditingCategory(cat)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleCategoryDelete(cat.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB PANEL: BRANDS
         ---------------------------------------------------------------------- */}
      {activeTab === 'brands' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">Partner Manufacturers & Brands</h2>
            <button
              onClick={() => setEditingBrand({ name: '', logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=80&auto=format&fit=crop&q=80' })}
              className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Brand Logo</span>
            </button>
          </div>

          {editingBrand && (
            <form onSubmit={handleBrandSave} className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 max-w-xl animate-fade-in">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {editingBrand.id ? 'Edit Brand' : 'Create Brand'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Brand Name *</label>
                  <input
                    type="text" required placeholder="e.g. Nothing"
                    value={editingBrand.name || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Logo URL *</label>
                  <input
                    type="url" required
                    value={editingBrand.logo || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, logo: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Brand</span>
                </button>
                <button type="button" onClick={() => setEditingBrand(null)} className="px-4 py-2 bg-white text-slate-600 border rounded-lg text-xs font-semibold">Cancel</button>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 w-24">Logo</th>
                    <th className="p-4">Brand Name</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {brands.map((b) => (
                    <tr key={b.id || b.name} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <img src={b.logo} alt={b.name} referrerPolicy="no-referrer" className="w-10 h-10 object-contain rounded-full bg-slate-50 p-0.5 border border-slate-100" />
                      </td>
                      <td className="p-4 font-bold text-slate-800">{b.name}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button onClick={() => setEditingBrand(b)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleBrandDelete(b.id!)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB PANEL: PROMO BANNERS
         ---------------------------------------------------------------------- */}
      {activeTab === 'banners' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">Promotional Campaign Banners</h2>
            <button
              onClick={() => setEditingBanner({ title: '', subtitle: '', description: '', button_text: 'Shop Now', enabled: true, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' })}
              className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Campaign</span>
            </button>
          </div>

          {editingBanner && (
            <form onSubmit={handleBannerSave} className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {editingBanner.id ? 'Edit Promo Banner' : 'Create Promo Banner'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Banner Title *</label>
                  <input
                    type="text" required placeholder="e.g. Summer Mega Sale"
                    value={editingBanner.title || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Subtitle Accent *</label>
                  <input
                    type="text" required placeholder="e.g. Up to 60% OFF"
                    value={editingBanner.subtitle || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Banner Image URL *</label>
                  <input
                    type="url" required
                    value={editingBanner.image_url || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, image_url: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Campaign Description</label>
                  <input
                    type="text" placeholder="Acquire next-level tech..."
                    value={editingBanner.description || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CTA Button Text *</label>
                  <input
                    type="text" required placeholder="e.g. Shop Now"
                    value={editingBanner.button_text || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, button_text: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="chk-banner-enabled"
                  checked={editingBanner.enabled ?? true}
                  onChange={(e) => setEditingBanner({ ...editingBanner, enabled: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                />
                <label htmlFor="chk-banner-enabled" className="text-xs text-slate-600 cursor-pointer">Set active on storefront (Only one banner can be active at a time)</label>
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Campaign Banner</span>
                </button>
                <button type="button" onClick={() => setEditingBanner(null)} className="px-4 py-2 bg-white text-slate-600 border rounded-lg text-xs font-semibold">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-4">
            {banners.map((ban) => (
              <div
                key={ban.id}
                className={`bg-white border p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 transition-all ${
                  ban.enabled ? 'border-indigo-200 bg-indigo-50/5 shadow-sm' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <img src={ban.image_url} alt={ban.title} referrerPolicy="no-referrer" className="w-16 h-16 object-contain rounded-xl bg-slate-50 border shrink-0" />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-slate-900">{ban.title}</h4>
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full uppercase border ${
                        ban.enabled ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {ban.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500">{ban.subtitle}</p>
                    <p className="text-[10px] text-slate-400 font-light max-w-lg">{ban.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={async () => {
                      const updatedBanners = banners.map(b => ({
                        ...b,
                        enabled: b.id === ban.id
                      }));
                      for (const ub of updatedBanners) {
                        await dbService.updateBanner(ub.id, { enabled: ub.enabled });
                      }
                      setActionSuccess('Storefront active banner updated.');
                      loadAllAdminData();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      ban.enabled 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default' 
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                    disabled={ban.enabled}
                  >
                    {ban.enabled ? 'Live Banner' : 'Set Active'}
                  </button>

                  <button onClick={() => setEditingBanner(ban)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleBannerDelete(ban.id)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB PANEL: REVIEWS
         ---------------------------------------------------------------------- */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">Storefront Customer Reviews</h2>
            <button
              onClick={() => setEditingReview({ name: '', rating: 5, text: '', verified: true, pinned: false, status: 'approved' })}
              className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Manual Review</span>
            </button>
          </div>

          {editingReview && (
            <form onSubmit={handleReviewSave} className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 max-w-xl animate-fade-in">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {editingReview.id ? 'Edit Review Status' : 'Log Customer Opinion'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Client Full Name *</label>
                  <input
                    type="text" required placeholder="e.g. Charles Montgomery"
                    value={editingReview.name || ''}
                    disabled={!!editingReview.id}
                    onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rating Star (1 to 5) *</label>
                  <select
                    value={editingReview.rating ?? 5}
                    disabled={!!editingReview.id}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                    <option value="2">⭐⭐ (2 Stars)</option>
                    <option value="1">⭐ (1 Star)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Review Comments *</label>
                <textarea
                  required placeholder="Enter comments here..."
                  value={editingReview.text || ''}
                  disabled={!!editingReview.id}
                  onChange={(e) => setEditingReview({ ...editingReview, text: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs focus:ring-2 focus:ring-indigo-500/20 h-20 disabled:bg-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="chk-verified"
                    checked={editingReview.verified ?? true}
                    onChange={(e) => setEditingReview({ ...editingReview, verified: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <label htmlFor="chk-verified" className="text-xs text-slate-600 cursor-pointer">Verified Purchase badge</label>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status</label>
                  <select
                    value={editingReview.status || 'approved'}
                    onChange={(e) => setEditingReview({ ...editingReview, status: e.target.value as any })}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="approved">Approved (Visible)</option>
                    <option value="pending">Pending Review (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Review</span>
                </button>
                <button type="button" onClick={() => setEditingReview(null)} className="px-4 py-2 bg-white text-slate-600 border rounded-lg text-xs font-semibold">Cancel</button>
              </div>
            </form>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Comments</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Highlights</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 flex items-center space-x-2.5">
                        <img src={rev.avatar} alt={rev.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <span className="font-bold text-slate-900 block">{rev.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{rev.date}</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs truncate italic text-slate-600">"{rev.text}"</td>
                      <td className="p-4">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="p-4 space-x-1">
                        {rev.verified && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-100 rounded-full uppercase">Verified</span>
                        )}
                        {rev.pinned && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold border border-indigo-100 rounded-full uppercase">Pinned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleReviewStatus(rev.id, rev.status)}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-full border transition-colors uppercase cursor-pointer ${
                            rev.status === 'approved' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-100' 
                              : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100'
                          }`}
                        >
                          {rev.status || 'approved'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleTogglePinReview(rev.id)}
                            className={`p-1.5 rounded transition-all cursor-pointer ${
                              rev.pinned ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-400'
                            }`}
                            title="Toggle Homepage Pinning"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingReview(rev)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleReviewDelete(rev.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB PANEL: SUBSCRIBERS
         ---------------------------------------------------------------------- */}
      {activeTab === 'subscribers' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight">Newsletter Email Subscribers</h2>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold font-mono rounded-full uppercase border">
              Total: {subscribers.length} Emails
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Subscribed At Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-mono">
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400 font-sans italic">No email subscribers registered yet.</td>
                    </tr>
                  ) : (
                    subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800 font-sans">{sub.email}</td>
                        <td className="p-4 text-slate-500">{new Date(sub.subscribed_at).toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={async () => {
                              if (!confirm('Remove subscriber?')) return;
                              const filtered = subscribers.filter(s => s.id !== sub.id);
                              localStorage.setItem('ec_subscribers', JSON.stringify(filtered));
                              setActionSuccess('Subscriber removed.');
                              loadAllAdminData();
                            }}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-all cursor-pointer"
                            title="Unsubscribe Client"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB PANEL: WEBSITE SETTINGS
         ---------------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="space-y-8 animate-fade-in">
          {/* General Branding Section */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-base text-slate-900 tracking-tight flex items-center space-x-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>Global Website Customizations</span>
              </h3>
              <p className="text-[11px] text-slate-400">Specify platform-wide branding, SEO tags, titles, and footer legal text.</p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const branding_name = (form.elements.namedItem('branding_name') as HTMLInputElement).value;
                const site_title = (form.elements.namedItem('site_title') as HTMLInputElement).value;
                const site_description = (form.elements.namedItem('site_description') as HTMLTextAreaElement).value;
                const footer_text = (form.elements.namedItem('footer_text') as HTMLInputElement).value;
                
                handleWebsiteSettingsSave({
                  branding_name,
                  site_title,
                  site_description,
                  footer_text
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Website Branding Name *</label>
                  <input
                    type="text" required name="branding_name"
                    defaultValue={websiteSettings?.branding_name || 'OGhaitong'}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Browser Window Title *</label>
                  <input
                    type="text" required name="site_title"
                    defaultValue={websiteSettings?.site_title || 'OGhaitong | Premium Grade Components'}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SEO Search Description</label>
                <textarea
                  name="site_description" rows={2}
                  defaultValue={websiteSettings?.site_description || 'Discover high-performance components and premium wear at OGhaitong.'}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Footer Attribution Text *</label>
                  <input
                    type="text" required name="footer_text"
                    defaultValue={websiteSettings?.footer_text || 'OGhaitong © 2026. Certified premium Grade A materials only.'}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow transition-colors">
                <Save className="w-3.5 h-3.5" />
                <span>Save General Settings</span>
              </button>
            </form>
          </div>

          {/* Flash Sale Settings Section */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-base text-slate-900 tracking-tight flex items-center space-x-2">
                <Percent className="w-4 h-4 text-rose-500" />
                <span>Flash Sale Campaign Manager</span>
              </h3>
              <p className="text-[11px] text-slate-400">Toggle visibility, countdown end timestamps, and badges for the Flash Sale strip.</p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const enabled = (form.elements.namedItem('fs_enabled') as HTMLInputElement).checked;
                const title = (form.elements.namedItem('fs_title') as HTMLInputElement).value;
                const subtitle = (form.elements.namedItem('fs_subtitle') as HTMLInputElement).value;
                const offer_badge = (form.elements.namedItem('fs_badge') as HTMLInputElement).value;
                const end_date = (form.elements.namedItem('fs_end_date') as HTMLInputElement).value;
                
                handleFlashSaleConfigSave({
                  enabled,
                  title,
                  subtitle,
                  offer_badge,
                  end_date: new Date(end_date).toISOString()
                });
              }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 bg-rose-50/50 p-3 border border-rose-100 rounded-xl max-w-sm">
                <input
                  type="checkbox"
                  id="fs_enabled"
                  name="fs_enabled"
                  defaultChecked={flashSaleConfig?.enabled ?? true}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500/20"
                />
                <label htmlFor="fs_enabled" className="text-xs text-rose-800 font-bold cursor-pointer">Master Flash Sale Switch (Enabled)</label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Display Section Heading *</label>
                  <input
                    type="text" required name="fs_title"
                    defaultValue={flashSaleConfig?.title || 'Flash Sale'}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Subtitle description *</label>
                  <input
                    type="text" required name="fs_subtitle"
                    defaultValue={flashSaleConfig?.subtitle || 'Incredible limited-quantity prices expiring shortly.'}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Offer Stamp Badge *</label>
                  <input
                    type="text" required name="fs_badge"
                    defaultValue={flashSaleConfig?.offer_badge || 'Ends Today'}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Countdown End Timestamp *</label>
                  <input
                    type="datetime-local" required name="fs_end_date"
                    defaultValue={flashSaleConfig?.end_date ? new Date(flashSaleConfig.end_date).toISOString().slice(0, 16) : ''}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs focus:bg-white font-mono"
                  />
                </div>
              </div>

              <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow transition-colors">
                <Save className="w-3.5 h-3.5" />
                <span>Save Flash Campaign</span>
              </button>
            </form>
          </div>

          {/* Home Section Reordering & Toggles */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-base text-slate-900 tracking-tight flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Dynamic Homepage Section Arrangement</span>
              </h3>
              <p className="text-[11px] text-slate-400">Drag or shift sections up and down to change sequence and toggle their visibility switches.</p>
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-slate-50/50">
              {(websiteSettings?.section_order || [
                'flash_sale', 'categories', 'todays_deals', 'new_arrivals', 'best_sellers',
                'trending_now', 'promo_banner', 'popular_brands', 'recommended', 'recently_viewed',
                'why_shop', 'customer_reviews', 'newsletter'
              ]).map((secName, index, arr) => {
                const isVisible = websiteSettings?.section_visibility?.[secName] !== false;
                
                const secHumanNames: Record<string, string> = {
                  flash_sale: '⚡ Flash Sale Countdown Slider',
                  categories: '🗂️ Browse Components Category Grid',
                  todays_deals: '🎯 Premium Daily Deals Dashboard',
                  new_arrivals: '🆕 New Arrivals Catalog Carousel',
                  best_sellers: '🏆 Highly Demanded Best Sellers Grid',
                  trending_now: '🔥 Hot Electronics Momentum Slider',
                  promo_banner: '📣 High-Contrast Campaign Promo Banner',
                  popular_brands: '🤝 Collaborated Partner Brands logos',
                  recommended: '✨ Personalized Recommended Picks Grid',
                  recently_viewed: '⏮️ Client Recently Viewed Tracker',
                  why_shop: '🛡️ Core Values & Customer Promises',
                  customer_reviews: '💬 Verified Patron Feedback Sliders',
                  newsletter: '✉️ Newsletter updates Signup Dispatch'
                };

                return (
                  <div key={secName} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/30 transition-all">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs text-slate-300 font-bold">#{(index + 1).toString().padStart(2, '0')}</span>
                      <span className="text-xs font-bold text-slate-800">{secHumanNames[secName] || secName}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={async () => {
                          const currentVis = websiteSettings?.section_visibility || {};
                          const nextVis = { ...currentVis, [secName]: !isVisible };
                          await handleWebsiteSettingsSave({ section_visibility: nextVis });
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          isVisible 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-slate-100 hover:text-slate-500' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100'
                        }`}
                      >
                        {isVisible ? '● Active' : '○ Hidden'}
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={async () => {
                            if (index === 0) return;
                            const copyOrder = [...arr];
                            const temp = copyOrder[index - 1];
                            copyOrder[index - 1] = copyOrder[index];
                            copyOrder[index] = temp;
                            await handleWebsiteSettingsSave({ section_order: copyOrder });
                          }}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded hover:bg-slate-100"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (index === arr.length - 1) return;
                            const copyOrder = [...arr];
                            const temp = copyOrder[index + 1];
                            copyOrder[index + 1] = copyOrder[index];
                            copyOrder[index] = temp;
                            await handleWebsiteSettingsSave({ section_order: copyOrder });
                          }}
                          disabled={index === arr.length - 1}
                          className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded hover:bg-slate-100"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
