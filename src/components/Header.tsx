import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, User, ClipboardList, LogOut, LogIn, UserPlus, Sparkles } from 'lucide-react';
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
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [settings, setSettings] = useState<any>(null);

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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-violet-100/50 shadow-[0_4px_30px_rgba(124,58,237,0.03)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentView({ page: 'store' })}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            {/* Custom E-Commerce Premium Logo */}
            <div className="relative w-10 h-10 flex items-center justify-center transition-all duration-500 group-hover:scale-105 active:scale-95">
              {/* Background glowing blur */}
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-cyan-400 rounded-[10px] blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>
              
              {/* Main solid shape */}
              <div className="relative w-full h-full bg-slate-900 border border-white/20 rounded-[10px] shadow-xl flex items-center justify-center overflow-hidden">
                {/* Gradient overlay inside */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-cyan-500/30"></div>
                
                {/* Icons */}
                <ShoppingBag className="w-5 h-5 text-cyan-400 transform group-hover:-translate-y-0.5 transition-transform duration-300 z-10" />
                <Sparkles className="absolute top-1 right-1 w-3 h-3 text-violet-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10" />
              </div>
            </div>

            <div>
              <span className="font-display font-black text-xl tracking-tight text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-cyan-500 transition-all duration-300">
                {settings?.branding_name || 'OGhaitong'}
              </span>
              <span className="block text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase -mt-1 group-hover:text-violet-500 transition-colors">
                Architect Edition
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-1 sm:space-x-4 relative">
            
            {/* Store Button */}
            <button
              onClick={() => setCurrentView({ page: 'store' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 active:scale-95 ${
                currentView.page === 'store'
                  ? 'text-violet-700 bg-violet-50 border border-violet-100 shadow-sm'
                  : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50/50'
              }`}
            >
              Shop
            </button>

            {/* Custom Customer Action Buttons Beside Shop */}
            <div className="flex items-center space-x-1">
              {currentUser ? (
                <>
                  <button
                    id="nav-item-account"
                    onClick={() => setCurrentView({ page: 'dashboard', tab: 'profile' })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 active:scale-95 ${
                      currentView.page === 'dashboard' && currentView.tab === 'profile'
                        ? 'text-violet-700 bg-violet-50 border border-violet-100 shadow-sm'
                        : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50/50'
                    }`}
                  >
                    My Account
                  </button>
                  <button
                    id="nav-item-orders"
                    onClick={() => setCurrentView({ page: 'dashboard', tab: 'orders' })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 active:scale-95 ${
                      currentView.page === 'dashboard' && currentView.tab === 'orders'
                        ? 'text-violet-700 bg-violet-50 border border-violet-100 shadow-sm'
                        : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50/50'
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    id="nav-item-logout"
                    onClick={onLogout}
                    className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 active:scale-95"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="nav-item-login"
                    onClick={() => setCurrentView({ page: 'login' })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 active:scale-95 ${
                      currentView.page === 'login'
                        ? 'text-violet-700 bg-violet-50 border border-violet-100 shadow-sm'
                        : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50/50'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    id="nav-item-signup"
                    onClick={() => setCurrentView({ page: 'signup' })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 active:scale-95 ${
                      currentView.page === 'signup'
                        ? 'text-violet-700 bg-violet-50 border border-violet-100 shadow-sm'
                        : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50/50'
                    }`}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setCurrentView({ page: 'cart' })}
              className="relative p-2 text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all duration-300 active:scale-95 group"
            >
              <ShoppingBag className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-[10px] font-bold text-white shadow-md ring-2 ring-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu Button */}
            <button
              id="hamburger-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Hamburger Dropdown Menu */}
            {isMenuOpen && (
              <div 
                id="hamburger-menu-dropdown"
                className="absolute right-0 top-12 w-64 bg-white/95 backdrop-blur-xl border border-violet-100/60 rounded-2xl shadow-[0_15px_40px_rgba(124,58,237,0.15)] py-3 z-50 animate-fade-in origin-top-right transform transition-all"
              >
                <div className="px-4 py-3 border-b border-slate-100 mb-2 bg-slate-50/50">
                  {currentUser ? (
                    <div>
                      <p className="text-xs font-bold text-slate-800 truncate">{currentUser.full_name || 'Customer'}</p>
                      <p className="text-[10px] font-mono text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500">{(settings?.branding_name || 'OGhaitong')} Guest</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sign in to manage your orders</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1 px-2">
                  {currentUser ? (
                    <>
                      {/* My Account */}
                      <button
                        id="menu-item-account"
                        onClick={() => {
                          setCurrentView({ page: 'dashboard', tab: 'profile' });
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-violet-700 hover:bg-violet-50 transition-all duration-300 flex items-center space-x-2.5 cursor-pointer active:scale-95 group"
                      >
                        <User className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
                        <span>My Account</span>
                      </button>

                      {/* Orders */}
                      <button
                        id="menu-item-orders"
                        onClick={() => {
                          setCurrentView({ page: 'dashboard', tab: 'orders' });
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 transition-all duration-300 flex items-center space-x-2.5 cursor-pointer active:scale-95 group"
                      >
                        <ClipboardList className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                        <span>Orders</span>
                      </button>

                      {/* Separator */}
                      <div className="h-px bg-slate-100 my-2 mx-2" />

                      {/* Logout */}
                      <button
                        id="menu-item-logout"
                        onClick={() => {
                          onLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all duration-300 flex items-center space-x-2.5 cursor-pointer active:scale-95 group"
                      >
                        <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-500 transition-colors" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 p-1 pt-1.5">
                      {/* Login */}
                      <button
                        id="menu-item-login"
                        onClick={() => {
                          setCurrentView({ page: 'login' });
                          setIsMenuOpen(false);
                        }}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                      >
                        <LogIn className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        <span>Login</span>
                      </button>

                      {/* Sign Up */}
                      <button
                        id="menu-item-signup"
                        onClick={() => {
                          setCurrentView({ page: 'signup' });
                          setIsMenuOpen(false);
                        }}
                        className="py-2.5 px-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-center text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer shadow-[0_4px_15px_rgba(124,58,237,0.3)] active:scale-95"
                      >
                        <UserPlus className="w-3.5 h-3.5 shrink-0 text-violet-100" />
                        <span>Sign Up</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
