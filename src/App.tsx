import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import StoreFront from './pages/StoreFront';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderFailure from './pages/OrderFailure';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import Login from './pages/Login';
import { Analytics } from "@vercel/analytics/react";
import RouteFix from './components/RouteFix';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import PublicAdminRoute from './components/PublicAdminRoute';

import { Product, CartItem, Profile, Order } from './types';
import { dbService } from './services/db';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, _setCurrentView] = useState<{ page: string; productId?: string; tab?: 'orders' | 'profile' }>({ page: 'store' });

  const setCurrentView = (view: { page: string; productId?: string; tab?: 'orders' | 'profile' }) => {
    _setCurrentView(view);
    if (view.page === 'store') {
      navigate('/');
    } else if (view.page === 'cart') {
      navigate('/cart');
    } else if (view.page === 'checkout') {
      navigate('/checkout');
    } else if (view.page === 'dashboard') {
      if (view.tab === 'profile') {
        navigate('/profile/edit');
      } else {
        navigate('/profile');
      }
    } else if (view.page === 'login') {
      navigate('/login');
    } else if (view.page === 'signup') {
      navigate('/signup');
    } else if (view.page === 'admin') {
      navigate('/admin');
    } else if (view.page === 'admin-login') {
      navigate('/admin/login');
    } else if (view.page === 'detail' && view.productId) {
      navigate(`/products/${view.productId}`);
    } else if (view.page === 'order-success') {
      navigate('/order-success');
    } else if (view.page === 'order-failure') {
      navigate('/order-failure');
    }
  };
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

  // Sync view state based on actual URL path location
  useEffect(() => {
    const path = location.pathname;
    const productMatch = path.match(/^\/products\/([^/]+)$/);

    if (path === '/') {
      if (currentView.page !== 'store') {
        _setCurrentView({ page: 'store' });
      }
    } else if (path === '/cart') {
      if (currentView.page !== 'cart') {
        _setCurrentView({ page: 'cart' });
      }
    } else if (path === '/checkout') {
      if (currentView.page !== 'checkout') {
        _setCurrentView({ page: 'checkout' });
      }
    } else if (path === '/profile' || path === '/profile/edit') {
      const storedUserString = localStorage.getItem('ec_current_user');
      const hasSession = currentUser || storedUserString;
      if (!hasSession) {
        navigate('/login', { state: { from: path }, replace: true });
      } else {
        const targetTab = path === '/profile/edit' ? 'profile' : 'orders';
        if (currentView.page !== 'dashboard' || currentView.tab !== targetTab) {
          _setCurrentView({ page: 'dashboard', tab: targetTab });
        }
      }
    } else if (path === '/login' || path === '/signup') {
      const storedUserString = localStorage.getItem('ec_current_user');
      const hasSession = currentUser || storedUserString;
      if (hasSession) {
        navigate('/', { replace: true });
      } else {
        const targetPage = path === '/signup' ? 'signup' : 'login';
        if (currentView.page !== targetPage) {
          _setCurrentView({ page: targetPage });
        }
      }
    } else if (path === '/admin' || (path.startsWith('/admin/') && path !== '/admin/login')) {
      if (currentView.page !== 'admin') {
        _setCurrentView({ page: 'admin' });
      }
    } else if (path === '/admin/login') {
      if (currentView.page !== 'admin-login') {
        _setCurrentView({ page: 'admin-login' });
      }
    } else if (productMatch) {
      const productId = productMatch[1];
      if (currentView.page !== 'detail' || currentView.productId !== productId) {
        _setCurrentView({ page: 'detail', productId });
      }
    } else if (path === '/order-success') {
      if (currentView.page !== 'order-success') {
        _setCurrentView({ page: 'order-success' });
      }
    } else if (path === '/order-failure') {
      if (currentView.page !== 'order-failure') {
        _setCurrentView({ page: 'order-failure' });
      }
    } else {
      // Catch-all: Route unrecognized paths back to store
      if (currentView.page !== 'store') {
        _setCurrentView({ page: 'store' });
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname, currentUser]);

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
    const wasAdmin = currentUser?.role === 'admin' || currentView.page === 'admin';
    await dbService.signOut();
    localStorage.removeItem('ec_current_user');
    setCurrentUser(null);
    if (wasAdmin) {
      setCurrentView({ page: 'admin-login' });
      triggerToast('Admin logged out successfully.', 'info');
    } else {
      setCurrentView({ page: 'store' });
      triggerToast('Logged out successfully.', 'success');
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setCurrentUser(updatedProfile);
  };

  const handleProceedToCheckout = (summary: typeof calcSummary) => {
    if (!currentUser) {
      triggerToast('Please login or register to complete checkout.', 'info');
      navigate('/login', { state: { from: '/checkout' } });
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-violet-200 selection:text-violet-900">
      <RouteFix />
      <Analytics />
      
      {/* Toast Alert System */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce transition-all duration-300 ease-in-out">
          <div className={`px-4 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 border border-white/20 text-white backdrop-blur-md ${
            toast.type === 'error' ? 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-[0_10px_25px_rgba(225,29,72,0.4)]' :
            toast.type === 'info' ? 'bg-gradient-to-r from-slate-900 to-slate-800 shadow-[0_10px_25px_rgba(15,23,42,0.4)]' :
            'bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_10px_25px_rgba(124,58,237,0.4)]'
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
            initialTab={currentView.tab || 'orders'}
          />
        )}

        {currentView.page === 'admin' && (
          <ProtectedAdminRoute>
            <AdminDashboard
              currentUser={currentUser}
              setCurrentView={setCurrentView}
              onLogout={handleLogout}
            />
          </ProtectedAdminRoute>
        )}

        {currentView.page === 'admin-login' && (
          <PublicAdminRoute>
            <AdminLogin
              onLoginSuccess={(profile) => {
                setCurrentUser(profile);
                refreshProductsList();
              }}
              setCurrentView={setCurrentView}
            />
          </PublicAdminRoute>
        )}

        {(currentView.page === 'login' || currentView.page === 'signup') && (
          <Login
            onLoginSuccess={(profile) => {
              setCurrentUser(profile);
              refreshProductsList();
            }}
            setCurrentView={setCurrentView}
            initialSignUp={currentView.page === 'signup'}
          />
        )}

      </main>

      {/* Premium Multi-Column Footer (Section 14) */}
      <Footer setCurrentView={setCurrentView} />

    </div>
  );
}
