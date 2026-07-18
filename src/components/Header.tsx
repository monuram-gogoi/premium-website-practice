import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, User, Search, LogOut, ChevronRight } from 'lucide-react';
import { Profile, CartItem } from '../types';
import { dbService } from '../services/db';

interface HeaderProps {
  currentView: { page: string; productId?: string; tab?: 'orders' | 'profile' };
  setCurrentView: (view: { page: string; productId?: string; tab?: 'orders' | 'profile' }) => void;
  cart: CartItem[];
  currentUser: Profile | null;
  onLogout: () => void;
}

export default function Header({
  currentView,
  setCurrentView,
  cart,
  currentUser,
  onLogout
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await dbService.getWebsiteSettings();
        setSettings(s);
        if (s?.site_title) {
          document.title = s.site_title;
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, [currentView.page]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-neutral-900 text-white text-[11px] font-medium tracking-widest uppercase py-2 text-center flex justify-center items-center">
        <span>Free Priority Shipping on orders over ₹5,000</span>
      </div>

      {/* Main Header */}
      <div className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Mobile Menu Toggle & Desktop Links */}
            <div className="flex-1 flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 -ml-2 text-neutral-900 lg:hidden focus:outline-none"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <nav className="hidden lg:flex space-x-8">
                <button 
                  onClick={() => setCurrentView({ page: 'store' })}
                  className="text-sm font-medium text-neutral-900 hover:text-neutral-500 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Shop All
                </button>
                <button 
                  className="text-sm font-medium text-neutral-900 hover:text-neutral-500 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  New Arrivals
                </button>
              </nav>
            </div>

            {/* Center: Brand Logo */}
            <div 
              onClick={() => setCurrentView({ page: 'store' })}
              className="flex-shrink-0 cursor-pointer flex flex-col items-center justify-center"
            >
              <span className="font-display font-black text-2xl tracking-tighter text-neutral-900 uppercase">
                {settings?.branding_name || 'OGhaitong'}
              </span>
            </div>

            {/* Right: Icons (Search, User, Cart) */}
            <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-4 relative">
              
              <button className="p-2 text-neutral-900 hover:text-neutral-500 transition-colors hidden sm:block cursor-pointer">
                <Search className="w-5 h-5" />
              </button>

              {/* User Dropdown Wrapper */}
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 text-neutral-900 hover:text-neutral-500 transition-colors hidden sm:block cursor-pointer"
                >
                  <User className="w-5 h-5" />
                </button>

                {/* User Dropdown Menu (Desktop) - Animated */}
                <div 
                  className={`absolute right-0 mt-2 w-48 bg-white border shadow-xl z-50 hidden sm:block overflow-hidden transition-all duration-200 ease-in-out origin-top-right ${
                    isUserMenuOpen 
                      ? 'max-h-[300px] opacity-100 scale-100 visible border-neutral-200' 
                      : 'max-h-0 opacity-0 scale-95 invisible border-transparent shadow-none'
                  }`}
                >
                  {currentUser ? (
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-neutral-100 mb-1">
                        <p className="text-xs font-bold text-neutral-900 truncate">{currentUser.full_name || 'Customer'}</p>
                      </div>
                      <button onClick={() => { setCurrentView({ page: 'dashboard', tab: 'profile' }); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 cursor-pointer">Account</button>
                      <button onClick={() => { setCurrentView({ page: 'dashboard', tab: 'orders' }); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 cursor-pointer">Orders</button>
                      <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 cursor-pointer">Logout</button>
                    </div>
                  ) : (
                    <div className="py-2">
                      <button onClick={() => { setCurrentView({ page: 'login' }); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 cursor-pointer">Log In</button>
                      <button onClick={() => { setCurrentView({ page: 'signup' }); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 cursor-pointer">Create Account</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Icon */}
              <button 
                onClick={() => setCurrentView({ page: 'cart' })}
                className="p-2 relative text-neutral-900 hover:text-neutral-500 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Mobile Full-Width Menu Dropdown - Animated */}
      <div 
        className={`absolute top-[104px] left-0 w-full bg-white border-b border-neutral-200 shadow-xl z-40 lg:hidden overflow-hidden transition-all duration-300 ease-in-out origin-top ${
          isMenuOpen 
            ? 'max-h-[500px] opacity-100 scale-y-100 visible' 
            : 'max-h-0 opacity-0 scale-y-95 invisible'
        }`}
      >
        <div className="px-4 py-6 space-y-6">
          <div className="space-y-4">
            <button onClick={() => { setCurrentView({ page: 'store' }); setIsMenuOpen(false); }} className="flex items-center justify-between w-full text-lg font-display font-bold text-neutral-900 uppercase cursor-pointer">
              Shop All <ChevronRight className="w-5 h-5 text-neutral-400" />
            </button>
            <div className="h-px w-full bg-neutral-100"></div>
          </div>

          <div className="space-y-4">
            {currentUser ? (
              <>
                <button onClick={() => { setCurrentView({ page: 'dashboard', tab: 'profile' }); setIsMenuOpen(false); }} className="block text-sm text-neutral-600 cursor-pointer">My Account</button>
                <button onClick={() => { setCurrentView({ page: 'dashboard', tab: 'orders' }); setIsMenuOpen(false); }} className="block text-sm text-neutral-600 cursor-pointer">Order History</button>
                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="block text-sm text-red-600 cursor-pointer">Sign Out</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setCurrentView({ page: 'login' }); setIsMenuOpen(false); }} className="w-full py-3 bg-neutral-100 text-neutral-900 text-sm font-bold uppercase tracking-wider cursor-pointer">Log In</button>
                <button onClick={() => { setCurrentView({ page: 'signup' }); setIsMenuOpen(false); }} className="w-full py-3 bg-black text-white text-sm font-bold uppercase tracking-wider cursor-pointer">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
