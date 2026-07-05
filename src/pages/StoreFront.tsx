import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus, ArrowRight, Eye, Star, Clock, Truck, Battery, Volume2, Music, Bluetooth, Headphones } from 'lucide-react';
import { Product, CartItem } from '../types';
import PromoCarousel from '../components/PromoCarousel';

interface StoreFrontProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  setCurrentView: (view: { page: string; productId?: string }) => void;
  cart: CartItem[];
}

export default function StoreFront({
  products,
  onAddToCart,
  setCurrentView,
  cart
}: StoreFrontProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [heroHeadphonesSrc, setHeroHeadphonesSrc] = useState('/images/ChatGPT Image Jul 6, 2026, 01_16_41 AM.png');
  const [imageError, setImageError] = useState(false);

  // Categories extraction
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['All', ...Array.from(list)];
  }, [products]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  // Helper to check quantity in cart
  const getCartQuantity = (productId: string) => {
    const item = cart.find(c => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="py-8 animate-fade-in">
      
      {/* Hero Banner EXACTLY like the image */}
      <div className="relative mb-12 rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-slate-900 border border-slate-200/60 p-6 sm:p-12 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-[0_20px_50px_rgba(15,23,42,0.04)] min-h-[560px]">
        
        {/* Floating matte and glossy 3D spheres styled with pure CSS radial gradients */}
        {/* Sphere 1 (Top Left behind text) */}
        <div 
          className="absolute left-[35%] top-[10%] w-24 h-24 rounded-full pointer-events-none select-none z-0 opacity-80"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #f1f5f9 45%, #cbd5e1 100%)',
            boxShadow: 'inset -8px -8px 24px rgba(0,0,0,0.04), 10px 20px 40px rgba(15,23,42,0.08)'
          }}
        />
        
        {/* Sphere 2 (Bottom Right near bottom highlights) */}
        <div 
          className="absolute right-[12%] bottom-[15%] w-32 h-32 rounded-full pointer-events-none select-none z-0 opacity-90"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #f1f5f9 45%, #cbd5e1 100%)',
            boxShadow: 'inset -12px -12px 32px rgba(0,0,0,0.04), 15px 30px 50px rgba(15,23,42,0.08)'
          }}
        />

        {/* Sphere 3 (Tiny matte sphere near bottom-center) */}
        <div 
          className="absolute left-[42%] bottom-[25%] w-8 h-8 rounded-full pointer-events-none select-none z-0 opacity-70"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #f1f5f9 45%, #cbd5e1 100%)',
            boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.03), 4px 8px 16px rgba(15,23,42,0.05)'
          }}
        />

        {/* Glossy Translucent Bubble 1 (Right middle) */}
        <div 
          className="absolute right-[8%] top-[45%] w-12 h-12 rounded-full pointer-events-none select-none z-0 border border-white/60"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(219,234,254,0.2) 40%, rgba(147,197,253,0.05) 80%, rgba(147,197,253,0.3) 100%)',
            boxShadow: '0 8px 32px rgba(147,197,253,0.15), inset 2px 2px 4px rgba(255,255,255,0.8)'
          }}
        />

        {/* Left Column: Premium Interactive Content & CTA Card */}
        <div className="relative z-10 flex-1 max-w-xl space-y-6">
          {/* Active Status Badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-50/80 backdrop-blur-sm border border-blue-100 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-blue-600 uppercase tracking-widest font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
            <span>Limited Time Offer</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Experience<br />Pure Sound.
            </h1>
            <p className="text-base sm:text-lg font-bold text-slate-500 tracking-wide">
              Premium Wireless Headphones
            </p>
            <p className="text-sm sm:text-base text-slate-400 font-light max-w-sm leading-relaxed">
              Industry-leading noise cancellation, immersive audio, and all-day comfort.
            </p>
          </div>

          {/* Luxury Promotional Mini-Card */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.02)] flex flex-col space-y-4 max-w-[340px]">
            <div className="flex items-center justify-between">
              {/* Left Side: 50% Promo */}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Up To</span>
                <span className="text-4xl font-black text-blue-600 tracking-tighter my-0.5">50%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Off</span>
              </div>

              {/* Vertical divider */}
              <div className="w-[1px] h-14 bg-slate-100 mx-1"></div>

              {/* Right Side: Features List */}
              <div className="flex-1 pl-4 space-y-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50/50 flex items-center justify-center text-blue-600 border border-blue-50">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Limited Time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50/50 flex items-center justify-center text-blue-600 border border-blue-50">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Free Shipping</span>
                </div>
              </div>
            </div>

            {/* Shop Now Action Button */}
            <button
              onClick={() => {
                setSelectedCategory('Audio');
                const catalogElement = document.getElementById('catalog-section');
                if (catalogElement) {
                  catalogElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_24px_rgba(37,99,235,0.35)] cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Floating High-Quality Headphones */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] select-none">
            {/* Soft Ambient shadow under headphones to match exactly the premium 3D look */}
            <div className="absolute -bottom-8 left-[10%] right-[10%] h-8 bg-slate-950/5 blur-2xl rounded-full"></div>
            {imageError ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 rounded-3xl border border-slate-200/50 shadow-inner relative group p-8">
                <div className="relative z-10 flex flex-col items-center justify-center text-indigo-600">
                  <div className="p-8 rounded-full bg-white shadow-xl border border-indigo-50 text-indigo-600 mb-4 transition-transform duration-500 group-hover:scale-110">
                    <Headphones className="w-20 h-20 sm:w-28 sm:h-28 stroke-[1.25]" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase font-mono bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-100">Pure Sound Engine</span>
                  <p className="text-[11px] text-slate-400 mt-2 font-light">Pro Series Wireless</p>
                </div>
              </div>
            ) : (
              <img
                src={heroHeadphonesSrc}
                onError={() => {
                  setImageError(true);
                }}
                alt="Experience Pure Sound Premium Headphones"
                className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(15,23,42,0.1)] hover:scale-105 transition-transform duration-[800ms]"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>

      </div>

      {/* Bottom Highlights Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {/* Card 1: Battery */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 p-4 rounded-2xl flex items-center space-x-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:scale-[1.02] transition-transform">
          <div className="w-11 h-11 rounded-xl bg-blue-50/50 flex items-center justify-center text-blue-600 border border-blue-50">
            <Battery className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">40 Hours</p>
            <p className="text-xs text-slate-400 font-medium">Battery</p>
          </div>
        </div>

        {/* Card 2: ANC */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 p-4 rounded-2xl flex items-center space-x-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:scale-[1.02] transition-transform">
          <div className="w-11 h-11 rounded-xl bg-blue-50/50 flex items-center justify-center text-blue-600 border border-blue-50">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">Active Noise</p>
            <p className="text-xs text-slate-400 font-medium">Cancellation</p>
          </div>
        </div>

        {/* Card 3: Hi-Res */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 p-4 rounded-2xl flex items-center space-x-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:scale-[1.02] transition-transform">
          <div className="w-11 h-11 rounded-xl bg-blue-50/50 flex items-center justify-center text-blue-600 border border-blue-50">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">Hi-Res</p>
            <p className="text-xs text-slate-400 font-medium">Audio</p>
          </div>
        </div>

        {/* Card 4: Bluetooth */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 p-4 rounded-2xl flex items-center space-x-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:scale-[1.02] transition-transform">
          <div className="w-11 h-11 rounded-xl bg-blue-50/50 flex items-center justify-center text-blue-600 border border-blue-50">
            <Bluetooth className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">Bluetooth 5.4</p>
            <p className="text-xs text-slate-400 font-medium">Connectivity</p>
          </div>
        </div>
      </div>

      {/* Catalog Filters Bar */}
      <div id="catalog-section" className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">Featured Products</h2>
            <p className="text-xs text-slate-500 mt-1">Showing {filteredProducts.length} Premium Essentials</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search premium products..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-slate-200 rounded-lg">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-medium bg-transparent outline-none text-slate-700 cursor-pointer"
              >
                <option value="featured">Featured Essentials</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex overflow-x-auto py-4 scrollbar-none gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 font-medium">No premium products match your parameters.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
            className="mt-3 text-indigo-600 text-sm font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => {
            const inCartQty = getCartQuantity(product.id);
            const isOutOfStock = product.stock <= 0;
            const discountPercentage = product.compare_at_price
              ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Product Image Stage */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setCurrentView({ page: 'detail', productId: product.id })}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Category Pill */}
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 bg-white/95 border border-slate-200 text-[8px] sm:text-[10px] font-bold text-slate-700 rounded-md shadow-xs uppercase tracking-wider font-mono">
                    {product.category}
                  </span>

                  {/* Discount Badge */}
                  {discountPercentage > 0 && (
                    <span className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 py-0.5 bg-rose-600 text-[8px] sm:text-[10px] font-bold text-white rounded-md shadow-xs tracking-wider">
                      -{discountPercentage}%
                    </span>
                  )}

                  {/* Out of stock cover */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-2 py-1 sm:px-4 sm:py-1.5 bg-white text-slate-900 font-bold text-[9px] sm:text-xs uppercase tracking-widest rounded-lg shadow-md">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Quick look action sheet (Desktop only) */}
                  <div className="hidden sm:flex absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity items-end justify-center pb-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentView({ page: 'detail', productId: product.id });
                      }}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-800 font-semibold text-xs rounded-lg shadow-md flex items-center space-x-1.5 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all transform translate-y-2 group-hover:translate-y-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Configure Options</span>
                    </button>
                  </div>
                </div>

                {/* Card Info Box */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col">
                  {/* Rating / Review placeholder */}
                  <div className="flex items-center space-x-1 mb-1 sm:mb-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 font-mono">5.0</span>
                  </div>

                  <h3 
                    onClick={() => setCurrentView({ page: 'detail', productId: product.id })}
                    className="font-display font-bold text-xs sm:text-base text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                  >
                    {product.name}
                  </h3>
                  
                  <p className="text-slate-500 text-[10px] sm:text-xs font-light mt-1 mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-auto pt-2 sm:pt-4 border-t border-slate-100 flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 sm:gap-2">
                    <div className="flex items-baseline space-x-1.5 xs:block">
                      {product.compare_at_price && (
                        <span className="block text-[9px] sm:text-[11px] text-slate-400 line-through">
                          ₹{product.compare_at_price.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-xs sm:text-base font-extrabold text-slate-900 font-mono">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {isOutOfStock ? (
                      <button
                        disabled
                        className="w-full xs:w-auto px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-100 text-slate-400 text-[10px] sm:text-xs font-semibold rounded-lg cursor-not-allowed text-center"
                      >
                        Out of Stock
                      </button>
                    ) : (
                      <button
                        onClick={() => onAddToCart(product)}
                        className={`w-full xs:w-auto px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                          inCartQty > 0
                            ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 border border-indigo-200'
                            : 'bg-slate-900 text-white hover:bg-indigo-600'
                        }`}
                      >
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{inCartQty > 0 ? `In Cart (${inCartQty})` : 'Add'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
