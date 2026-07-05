import { ShoppingBag } from 'lucide-react';
import { Profile, CartItem } from '../types';

interface HeaderProps {
  currentView: { page: string; productId?: string };
  setCurrentView: (view: { page: string; productId?: string }) => void;
  cart: CartItem[];
  currentUser: Profile | null;
  onLogout: () => void;
  onRoleToggle: () => void;
}

export default function Header({
  currentView,
  setCurrentView,
  cart,
  currentUser,
  onLogout,
  onRoleToggle
}: HeaderProps) {
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
                SOVEREIGN
              </span>
              <span className="block text-[9px] font-mono tracking-widest text-slate-400 uppercase -mt-1">
                Architect Edition
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-4">
            
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

          </div>
        </div>
      </div>
    </header>
  );
}
