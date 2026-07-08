import { useState } from 'react';
import { ShoppingBag, Menu, X, User, ClipboardList, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Profile, CartItem } from '../types';

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

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentView({ page: 'store' })}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-4 h-4 border-2 border-white"></div>
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                OGhaitong
              </span>
              <span className="block text-[9px] font-mono tracking-widest text-slate-400 uppercase -mt-1">
                Architect Edition
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-1 sm:space-x-4 relative">
            
            {/* Store Button */}
            <button
              onClick={() => setCurrentView({ page: 'store' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView.page === 'store'
                  ? 'text-indigo-600 bg-indigo-50/50'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
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
                    className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      currentView.page === 'dashboard' && currentView.tab === 'profile'
                        ? 'text-indigo-600 bg-indigo-50/50'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    My Account
                  </button>
                  <button
                    id="nav-item-orders"
                    onClick={() => setCurrentView({ page: 'dashboard', tab: 'orders' })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      currentView.page === 'dashboard' && currentView.tab === 'orders'
                        ? 'text-indigo-600 bg-indigo-50/50'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    id="nav-item-logout"
                    onClick={onLogout}
                    className="px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="nav-item-login"
                    onClick={() => setCurrentView({ page: 'login' })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      currentView.page === 'login'
                        ? 'text-indigo-600 bg-indigo-50/50'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    id="nav-item-signup"
                    onClick={() => setCurrentView({ page: 'signup' })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      currentView.page === 'signup'
                        ? 'text-indigo-600 bg-indigo-50/50'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
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
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu Button */}
            <button
              id="hamburger-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Hamburger Dropdown Menu */}
            {isMenuOpen && (
              <div 
                id="hamburger-menu-dropdown"
                className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-3 z-50 animate-fade-in"
              >
                <div className="px-4 py-2 border-b border-slate-100 mb-2">
                  {currentUser ? (
                    <div>
                      <p className="text-xs font-semibold text-slate-800 truncate">{currentUser.full_name || 'Customer'}</p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-indigo-600">OGhaitong Guest</p>
                      <p className="text-[10px] text-slate-400 font-light">Sign in to manage your orders</p>
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
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors flex items-center space-x-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Account</span>
                      </button>

                      {/* Orders */}
                      <button
                        id="menu-item-orders"
                        onClick={() => {
                          setCurrentView({ page: 'dashboard', tab: 'orders' });
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors flex items-center space-x-2 cursor-pointer"
                      >
                        <ClipboardList className="w-4 h-4 text-slate-400" />
                        <span>Orders</span>
                      </button>

                      {/* Separator */}
                      <div className="h-px bg-slate-100 my-1" />

                      {/* Logout */}
                      <button
                        id="menu-item-logout"
                        onClick={() => {
                          onLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 p-1">
                      {/* Login */}
                      <button
                        id="menu-item-login"
                        onClick={() => {
                          setCurrentView({ page: 'login' });
                          setIsMenuOpen(false);
                        }}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
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
                        className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-center text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 shrink-0 text-indigo-200" />
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
