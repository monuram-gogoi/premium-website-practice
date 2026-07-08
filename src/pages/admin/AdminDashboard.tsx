import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, ShoppingCart, Percent, Truck, PercentSquare, Eye, Edit2, Trash2, 
  Plus, Save, Users, RefreshCw, Layers, CheckCircle2, AlertCircle, Coins, LogOut 
} from 'lucide-react';
import { Product, Coupon, ShippingRule, Tax, Order, Profile } from '../../types';
import { dbService } from '../../services/db';

interface AdminDashboardProps {
  currentUser: Profile | null;
  setCurrentView: (view: { page: string; productId?: string }) => void;
  onLogout: () => void;
}

type AdminTab = 'products' | 'orders' | 'coupons' | 'shipping' | 'taxes' | 'users';

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
      setActiveTab('products');
    } else if (path === '/admin/settings') {
      setActiveTab('shipping');
    } else if (path.startsWith('/admin/')) {
      const segment = path.split('/')[2];
      if (['products', 'orders', 'coupons', 'shipping', 'taxes', 'users'].includes(segment)) {
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

  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Editing / Create Modal states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [editingShipping, setEditingShipping] = useState<Partial<ShippingRule> | null>(null);
  const [editingTax, setEditingTax] = useState<Partial<Tax> | null>(null);

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
      const [p, o, c, s, t, u] = await Promise.all([
        dbService.getProducts(),
        dbService.getOrders(),
        dbService.getCoupons(),
        dbService.getShippingRules(),
        dbService.getTaxes(),
        dbService.getProfiles()
      ]);

      setProducts(p);
      setOrders(o);
      setCoupons(c);
      setShippingRules(s);
      setTaxes(t);
      setUsers(u);
    } catch (err: any) {
      console.error('Error loading administrative lists:', err);
      setActionError('Failed to fetch real-time datastores from Supabase.');
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
        category: editingProduct.category || 'Lifestyle'
      };

      if (editingProduct.id) {
        await dbService.updateProduct(editingProduct.id, payload);
        setActionSuccess('Product item updated successfully.');
      } else {
        await dbService.createProduct({
          ...payload,
          created_at: new Date().toISOString()
        });
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
          { tab: 'users', name: 'User Management', icon: Users }
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

    </div>
  );
}
