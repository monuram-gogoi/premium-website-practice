import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import StoreFront from './pages/StoreFront';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderFailure from './pages/OrderFailure';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

import { Product, CartItem, Profile, Order } from './types';
import { dbService } from './services/db';

export default function App() {
  const [currentView, setCurrentView] = useState<{ page: string; productId?: string }>({ page: 'store' });
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Cart calculation state passed to checkout
  const [calcSummary, setCalcSummary] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    couponCode: ''
  });

  // Global toasts helper
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function initApp() {
      try {
        // Load active user session
        const user = await dbService.getCurrentUser();
        setCurrentUser(user);

        // Load active products list
        const p = await dbService.getProducts();
        setProducts(p);

        // Load cart items from localStorage
        const storedCart = localStorage.getItem('ec_cart');
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      } catch (err) {
        console.error('App init failed:', err);
      }
    }
    initApp();
  }, []);

  // Sync state and path-based routing
  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname;
      if (path === '/admin/login' || path === '/login' || path === '/dashboard/login') {
        window.history.replaceState(null, '', '/admin');
        setCurrentView({ page: 'admin' });
      } else if (path === '/admin') {
        setCurrentView({ page: 'admin' });
      } else if (currentView.page === 'admin') {
        setCurrentView({ page: 'store' });
      }
    };

    handleRouting();

    window.addEventListener('popstate', handleRouting);
    return () => {
      window.removeEventListener('popstate', handleRouting);
    };
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (currentView.page === 'admin') {
      if (path !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      if (path === '/admin' || path === '/admin/login' || path === '/login' || path === '/dashboard/login') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [currentView.page]);

  // Sync cart state with local storage
  const syncCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('ec_cart', JSON.stringify(newCart));
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    const existing = cart.find(item => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const targetQty = currentQty + quantity;

    if (targetQty > product.stock) {
      triggerToast(`Sorry, we only have ${product.stock} units of ${product.name} in stock.`, 'error');
      return;
    }

    let nextCart: CartItem[];
    if (existing) {
      nextCart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: targetQty }
          : item
      );
    } else {
      nextCart = [...cart, { product, quantity }];
    }

    syncCart(nextCart);
    triggerToast(`Added ${quantity} × ${product.name} to your Shopping Bag!`, 'success');
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    const item = cart.find(c => c.product.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    if (quantity > item.product.stock) {
      triggerToast(`Only ${item.product.stock} items are available in stock.`, 'error');
      return;
    }

    const nextCart = cart.map(c =>
      c.product.id === productId ? { ...c, quantity } : c
    );
    syncCart(nextCart);
  };

  const handleRemoveFromCart = (productId: string) => {
    const nextCart = cart.filter(c => c.product.id !== productId);
    syncCart(nextCart);
    triggerToast('Item removed from Shopping Bag.', 'info');
  };

  const handleClearCart = () => {
    syncCart([]);
  };

  const handleLogout = async () => {
    await dbService.signOut();
    setCurrentUser(null);
    setCurrentView({ page: 'store' });
    triggerToast('Logged out of secure session.', 'info');
  };

  const handleRoleToggle = async () => {
    if (!currentUser) return;
    const nextRole = currentUser.role === 'admin' ? 'customer' : 'admin';
    try {
      await dbService.updateUserRole(currentUser.id, nextRole);
      const updatedUser = { ...currentUser, role: nextRole };
      setCurrentUser(updatedUser);
      triggerToast(`Role updated to ${nextRole.toUpperCase()} instantly.`, 'success');
    } catch (err) {
      triggerToast('Failed to switch role.', 'error');
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setCurrentUser(updatedProfile);
  };

  const handleProceedToCheckout = (summary: typeof calcSummary) => {
    if (!currentUser) {
      triggerToast('Please login or register to complete checkout.', 'info');
      setCurrentView({ page: 'login' });
      return;
    }
    setCalcSummary(summary);
    setCurrentView({ page: 'checkout' });
  };

  // Reload products (triggered when admin updates catalog CRUD)
  const refreshProductsList = async () => {
    try {
      const p = await dbService.getProducts();
      setProducts(p);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Toast Alert System */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center space-x-2 border text-white ${
            toast.type === 'error' ? 'bg-rose-600 border-rose-500 shadow-rose-200' :
            toast.type === 'info' ? 'bg-slate-900 border-slate-800 shadow-slate-300' :
            'bg-indigo-600 border-indigo-500 shadow-indigo-200'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Primary Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        cart={cart}
        currentUser={currentUser}
        onLogout={handleLogout}
        onRoleToggle={handleRoleToggle}
      />

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Router View Switches */}
        {currentView.page === 'store' && (
          <StoreFront
            products={products}
            onAddToCart={handleAddToCart}
            setCurrentView={setCurrentView}
            cart={cart}
          />
        )}

        {currentView.page === 'detail' && currentView.productId && (
          <ProductDetail
            productId={currentView.productId}
            products={products}
            onAddToCart={handleAddToCart}
            setCurrentView={setCurrentView}
            cart={cart}
          />
        )}

        {currentView.page === 'cart' && (
          <Cart
            cart={cart}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveFromCart={handleRemoveFromCart}
            setCurrentView={setCurrentView}
            onProceedToCheckout={handleProceedToCheckout}
          />
        )}

        {currentView.page === 'checkout' && (
          <Checkout
            cart={cart}
            currentUser={currentUser}
            calcSummary={calcSummary}
            setCurrentView={setCurrentView}
            onClearCart={handleClearCart}
            onSetLastOrder={setLastOrder}
          />
        )}

        {currentView.page === 'order-success' && (
          <OrderSuccess
            lastOrder={lastOrder}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView.page === 'order-failure' && (
          <OrderFailure
            setCurrentView={setCurrentView}
          />
        )}

        {currentView.page === 'dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            onProfileUpdate={handleProfileUpdate}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView.page === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard
              currentUser={currentUser}
              setCurrentView={setCurrentView}
            />
          ) : (
            <div className="py-12 max-w-md mx-auto animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="text-center space-y-2">
                  <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-mono font-bold rounded-md uppercase tracking-wider">
                    Restricted Area
                  </span>
                  <h1 className="font-display font-extrabold text-xl text-slate-900 tracking-tight text-center">
                    Admin Authenticate Required
                  </h1>
                  <p className="text-xs text-slate-400 font-light max-w-xs mx-auto leading-relaxed text-center">
                    Please log in with an authorized administrator account to access the control panel.
                  </p>
                </div>
                <Login
                  onLoginSuccess={(profile) => {
                    setCurrentUser(profile);
                    refreshProductsList();
                  }}
                  setCurrentView={setCurrentView}
                />
              </div>
            </div>
          )
        )}

        {currentView.page === 'login' && (
          <Login
            onLoginSuccess={(profile) => {
              setCurrentUser(profile);
              refreshProductsList();
            }}
            setCurrentView={setCurrentView}
          />
        )}

      </main>

      {/* Responsive Elegant Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 mt-16 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <span className="font-display font-bold text-base tracking-wider text-white">SOVEREIGN</span>
              <p className="text-xs font-light text-slate-500 leading-relaxed">
                Premium high-performance equipment and luxury goods. Senior engineered to ensure seamless scale and elegant utility.
              </p>
            </div>
            <div>
              <span className="font-display text-xs font-extrabold text-white tracking-widest uppercase block mb-3">Shop Categories</span>
              <ul className="space-y-1.5 text-xs font-light text-slate-400">
                <li className="hover:text-white cursor-pointer" onClick={() => { setCurrentView({ page: 'store' }); }}>Audio Headgear</li>
                <li className="hover:text-white cursor-pointer" onClick={() => { setCurrentView({ page: 'store' }); }}>Chronometer Watches</li>
                <li className="hover:text-white cursor-pointer" onClick={() => { setCurrentView({ page: 'store' }); }}>Weatherproof Travel Packs</li>
              </ul>
            </div>
            <div>
              <span className="font-display text-xs font-extrabold text-white tracking-widest uppercase block mb-3">Security & Compliance</span>
              <ul className="space-y-1.5 text-xs font-light text-slate-400">
                <li>SSL 256-Bit Cryptography</li>
                <li>Secure Razorpay Verification</li>
                <li>Supabase Row Level Security</li>
              </ul>
            </div>
            <div>
              <span className="font-display text-xs font-extrabold text-white tracking-widest uppercase block mb-3">Architect Environment</span>
              <ul className="space-y-1.5 text-xs text-slate-500 font-mono">
                <li>Host Ingress: Port 3000</li>
                <li>Engine: React + Express</li>
                <li>Platform: Cloud Run container</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800/60 mt-8 pt-6 text-center text-[10px] text-slate-600 font-light flex flex-col sm:flex-row justify-between items-center gap-4">
            <span>&copy; {new Date().getFullYear()} Sovereign Storefront. All rights reserved. Registered Trademark.</span>
            <div className="flex space-x-4">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Charter</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Carriage</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Vercel Web Analytics */}
      <Analytics />

    </div>
  );
}
