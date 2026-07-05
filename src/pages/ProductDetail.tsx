import { useState } from 'react';
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck, RotateCcw, AlertTriangle, Sparkles, Star } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductDetailProps {
  productId: string;
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  setCurrentView: (view: { page: string; productId?: string }) => void;
  cart: CartItem[];
}

export default function ProductDetail({
  productId,
  products,
  onAddToCart,
  setCurrentView,
  cart
}: ProductDetailProps) {
  const [qty, setQty] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'details' | 'specifications' | 'delivery'>('details');

  const product = products.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Product Not Found</h3>
        <p className="text-slate-500 text-sm mt-1">The specified item could not be retrieved from the database.</p>
        <button
          onClick={() => setCurrentView({ page: 'store' })}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const inCartQty = cart.find(c => c.product.id === product.id)?.quantity || 0;
  const isOutOfStock = product.stock <= 0;
  const isStockLow = product.stock > 0 && product.stock <= 5;
  const discountPercentage = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleAdd = () => {
    if (qty > product.stock) {
      alert(`Only ${product.stock} items are available in stock.`);
      return;
    }
    onAddToCart(product, qty);
  };

  return (
    <div className="py-8 animate-fade-in">
      
      {/* Back Link */}
      <button
        onClick={() => setCurrentView({ page: 'store' })}
        className="mb-8 flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Storefront</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-xl p-6 sm:p-10 border border-slate-200 shadow-sm">
        
        {/* Left Column: Image Viewer */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="relative aspect-4/3 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            <img
              src={product.image_url}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {discountPercentage > 0 && (
              <span className="absolute top-4 right-4 px-3 py-1 bg-rose-600 text-xs font-bold text-white rounded-md shadow-md">
                Save {discountPercentage}%
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                <span className="px-5 py-2 bg-white text-slate-900 font-bold text-xs uppercase tracking-widest rounded-lg shadow-md">
                  Sold Out
                </span>
              </div>
            )}
          </div>
          
          {/* Aesthetic Warranty cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="block text-[10px] font-bold text-slate-700">1 Year Warranty</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <Truck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="block text-[10px] font-bold text-slate-700">Secure Dispatch</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <RotateCcw className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="block text-[10px] font-bold text-slate-700">7-Day Easy Return</span>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <span className="px-2.5 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-md uppercase tracking-wider font-mono">
              {product.category}
            </span>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              {product.name}
            </h1>

            {/* Dynamic Ratings Block */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-600">5.0</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-indigo-600 font-medium hover:underline cursor-pointer">18 Verified Reviews</span>
            </div>

            {/* Pricing Panel */}
            <div className="mt-6 flex items-baseline space-x-3 bg-slate-50/50 p-4 rounded-lg border border-slate-200">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compare_at_price && (
                <span className="text-sm text-slate-400 line-through font-mono">
                  M.R.P: ₹{product.compare_at_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Product description */}
            <p className="text-slate-600 text-sm font-light mt-6 leading-relaxed">
              {product.description}
            </p>

            {/* Inventory Indicators */}
            <div className="mt-6">
              {isOutOfStock ? (
                <div className="flex items-center space-x-2 text-rose-600 text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Out of Stock</span>
                </div>
              ) : isStockLow ? (
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-md border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span>Extremely Limited Stock: Only {product.stock} units remaining!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-emerald-600 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>In Stock (Ready to dispatch)</span>
                </div>
              )}
            </div>

            {/* Multi-Tab Description & Specifications & Delivery */}
            <div className="mt-8 border-b border-slate-200">
              <div className="flex space-x-6 text-sm">
                <button
                  onClick={() => setSelectedTab('details')}
                  className={`pb-3 font-semibold transition-colors relative ${
                    selectedTab === 'details' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Details
                  {selectedTab === 'details' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full"></span>}
                </button>
                <button
                  onClick={() => setSelectedTab('specifications')}
                  className={`pb-3 font-semibold transition-colors relative ${
                    selectedTab === 'specifications' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Specifications
                  {selectedTab === 'specifications' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full"></span>}
                </button>
                <button
                  onClick={() => setSelectedTab('delivery')}
                  className={`pb-3 font-semibold transition-colors relative ${
                    selectedTab === 'delivery' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Delivery & Taxes
                  {selectedTab === 'delivery' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full"></span>}
                </button>
              </div>
            </div>

            <div className="py-4 text-xs text-slate-600 font-light leading-relaxed">
              {selectedTab === 'details' && (
                <p>This premium {product.category.toLowerCase()} item is manufactured with architectural care using premium composite metals and hypoallergenic surfaces. Hand-tested and sealed to meet international criteria.</p>
              )}
              {selectedTab === 'specifications' && (
                <ul className="space-y-1 font-mono">
                  <li>• Material: Premium Aerospace Polymers / Stainless Steel</li>
                  <li>• Compatibility: Multi-platform Compliant</li>
                  <li>• Efficiency Index: Class-A Certified</li>
                  <li>• Origin Country: India</li>
                </ul>
              )}
              {selectedTab === 'delivery' && (
                <p>Calculated dynamic GST is applied automatically based on active financial regulations. Shipments are processed via express logistic corridors with real-time tracking IDs dispatched to user email IDs.</p>
              )}
            </div>

          </div>

          {/* Checkout / Add Actions Row */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
            {!isOutOfStock && (
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1 w-full sm:w-auto justify-between">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 py-1 font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-slate-800 font-mono">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="px-3 py-1 font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  +
                </button>
              </div>
            )}

            <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed text-center text-sm"
                >
                  Currently Out of Stock
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2 text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {qty} to Cart {inCartQty > 0 ? `(${inCartQty} in cart)` : ''}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
