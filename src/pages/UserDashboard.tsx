import React, { useState, useEffect } from 'react';
import { User, ClipboardList, MapPin, Save, Eye, CheckCircle2, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import { Profile, Order } from '../types';
import { dbService } from '../services/db';

interface UserDashboardProps {
  currentUser: Profile | null;
  onProfileUpdate: (updated: Profile) => void;
  setCurrentView: (view: { page: string; productId?: string; tab?: 'orders' | 'profile' }) => void;
  initialTab?: 'orders' | 'profile';
}

export default function UserDashboard({
  currentUser,
  onProfileUpdate,
  setCurrentView,
  initialTab = 'orders'
}: UserDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'profile' | 'addresses'>(initialTab);

  useEffect(() => {
    setActiveSubTab(initialTab);
  }, [initialTab]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Form States
  const [formData, setFormData] = useState({
    full_name: currentUser?.full_name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    zip: currentUser?.zip || '',
    country: currentUser?.country || 'India'
  });

  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zip: currentUser.zip || '',
        country: currentUser.country || 'India'
      });
      loadUserOrders();
    }
  }, [currentUser]);

  const loadUserOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      const o = await dbService.getUserOrders(currentUser.id);
      setOrders(o);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');

    try {
      const updated = await dbService.updateProfile(formData);
      onProfileUpdate(updated);
      setSaveSuccess('Your profile configurations have been updated successfully.');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile details.');
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'paid':
        return <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase border border-emerald-100">Paid</span>;
      case 'shipped':
        return <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full uppercase border border-indigo-100">Shipped</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold rounded-full uppercase border border-sky-100">Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-full uppercase border border-rose-100">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full uppercase border border-amber-100">Pending</span>;
    }
  };

  if (!currentUser) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
        <p className="text-slate-500 text-sm mt-1">Please sign in to access your personal checkout credentials and orders history.</p>
        <button
          onClick={() => setCurrentView({ page: 'login' })}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in">
      
      {/* Dashboard Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered Email ID: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-semibold">{currentUser.email}</span>
          </p>
        </div>

        {/* Dynamic Navigation Pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto shrink-0">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'orders' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Orders History ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              activeSubTab === 'profile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* SubTab 1: Orders list */}
        {activeSubTab === 'orders' && (
          <div className="space-y-6">
            {loadingOrders ? (
              <p className="text-slate-400 text-center text-sm font-light">Retrieving secure purchase history...</p>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-sm">No Active Orders Yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                  You have not registered any transactions yet. Your dispatched logistics will display here.
                </p>
                <button
                  onClick={() => setCurrentView({ page: 'store' })}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs"
                >
                  Shop Essentials
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-all p-5 sm:p-6"
                  >
                    {/* Collapsible header summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono block">SECURE ORDER ID</span>
                        <span className="text-xs font-bold text-indigo-600 font-mono block">{order.id}</span>
                      </div>
                      <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 sm:space-x-8 text-xs shrink-0">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">PLACED ON</span>
                          <span className="font-semibold text-slate-700 font-mono">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">FINAL TOTAL</span>
                          <span className="font-bold text-slate-900 font-mono">₹{order.total_amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono block">PAY METHOD</span>
                          <span className="font-bold text-slate-700 uppercase font-mono">{order.payment_method}</span>
                        </div>
                      </div>
                      <div className="shrink-0 self-start sm:self-auto">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Order purchased item checklist inside card */}
                    <div className="py-4 divide-y divide-slate-100">
                      {order.items?.map((item) => (
                        <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-100 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block line-clamp-1">{item.product_name}</span>
                              <span className="text-slate-400 font-light font-mono">Qty: {item.quantity} × ₹{item.price}</span>
                            </div>
                          </div>
                          <span className="font-bold text-slate-800 font-mono">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order tracking footer */}
                    <div className="pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Delivery Address:</span>
                        <span className="text-slate-600 block leading-tight font-light mt-0.5">
                          {order.shipping_address.full_name}, {order.shipping_address.address}, {order.shipping_address.city} - {order.shipping_address.zip}
                        </span>
                      </div>
                      {order.payment_id && (
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-mono text-right sm:text-right">RP TRANSACTION ID:</span>
                          <span className="font-mono text-[11px] font-bold text-slate-700 block truncate max-w-[200px]">{order.payment_id}</span>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SubTab 2: Profile settings form */}
        {activeSubTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight pb-4 border-b border-slate-100">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Billing / Shipping Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">ZIP / PIN Code</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {saveSuccess && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">{saveSuccess}</p>}
            {saveError && <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl">{saveError}</p>}

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configurations</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
