import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, SlidersHorizontal, Plus, ArrowRight, Eye, Star, Clock, Truck, Battery, 
  Volume2, Music, Bluetooth, Headphones, ChevronLeft, ChevronRight, Sparkles, 
  Flame, ShoppingBag, ArrowUp, Send, CheckCircle, Smartphone, Laptop, Gamepad2, 
  Watch, Camera, Heart, HelpCircle, Gift, Users, RotateCcw, ShieldCheck, Mail 
} from 'lucide-react';
import { Product, CartItem, Category, Brand, PromoBanner, Review } from '../types';
import { dbService } from '../services/db';
import { 
  mockAllProducts, flashSaleProducts, todaysDeals, popularBrands, 
  featuresList, customerReviews, categoryDataList 
} from '../data/mockStoreData';
import PremiumProductCard from '../components/PremiumProductCard';

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

  // Database Driven States
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbBrands, setDbBrands] = useState<Brand[]>([]);
  const [dbBanners, setDbBanners] = useState<PromoBanner[]>([]);
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [dbSettings, setDbSettings] = useState<any>(null);
  const [flashSaleConfig, setFlashSaleConfig] = useState<any>(null);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 19, seconds: 48 });

  // Newsletter subscription
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Carousel Refs
  const flashSaleRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const recentlyViewedRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic database configurations
  useEffect(() => {
    async function fetchStoreConfig() {
      try {
        const [cats, brands, banners, reviews, settings, fsConfig, trending, best, news, recs] = await Promise.all([
          dbService.getCategories(),
          dbService.getBrands(),
          dbService.getBanners(),
          dbService.getReviews(),
          dbService.getWebsiteSettings(),
          dbService.getFlashSaleConfig(),
          dbService.getTrendingProducts(),
          dbService.getBestSellers(),
          dbService.getNewArrivals(8),
          dbService.getRecommendedProducts()
        ]);

        setDbCategories(cats.filter(c => c.enabled));
        setDbBrands(brands.filter(b => b.enabled).sort((a, b) => a.display_order - b.display_order));
        setDbBanners(banners.filter(b => b.enabled));
        setDbReviews(reviews.filter(r => r.status === 'approved'));
        setDbSettings(settings);
        setFlashSaleConfig(fsConfig);
        setTrendingProducts(trending);
        setBestSellers(best);
        setNewArrivals(news);
        setRecommendedProducts(recs);

        // Load recently viewed
        const recStored = localStorage.getItem('ec_recently_viewed');
        if (recStored) {
          const ids: string[] = JSON.parse(recStored);
          const matched = ids.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
          setRecentlyViewedProducts(matched.filter(p => p.product_status !== 'draft'));
        } else {
          // fallback to some products
          setRecentlyViewedProducts(products.filter(p => p.product_status !== 'draft').slice(1, 6));
        }
      } catch (err) {
        console.error('Error fetching storefront database configurations:', err);
      }
    }
    fetchStoreConfig();
  }, [products]);

  // Live countdown effect based on Database date
  useEffect(() => {
    if (!flashSaleConfig || !flashSaleConfig.end_date) {
      // static backup timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
          if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
          return { hours: 23, minutes: 59, seconds: 59 };
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    const calculateTime = () => {
      const now = Date.now();
      const end = new Date(flashSaleConfig.end_date).getTime();
      const diff = end - now;
      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, expired: true };
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return { hours, minutes, seconds, expired: false };
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      const time = calculateTime();
      setTimeLeft({ hours: time.hours, minutes: time.minutes, seconds: time.seconds });
      if (time.expired) {
        clearInterval(timer);
        // Turn off flash sale locally
        setFlashSaleConfig((prev: any) => prev ? { ...prev, enabled: false } : null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSaleConfig?.end_date]);

  // Smooth scroll helper
  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    const catalogSection = document.getElementById('catalog-section');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  // --- DYNAMIC DATA COMPUTATIONS ---
  const categoriesToUse = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map(cat => {
        const count = products.filter(p => p.category === cat.name && p.product_status !== 'draft').length;
        const icon = cat.icon || '📦';
        return {
          id: cat.id,
          name: cat.name,
          icon,
          count
        };
      });
    }
    return categoryDataList;
  }, [dbCategories, products]);

  const dealsToUse = useMemo(() => {
    const discounted = products.filter(p => p.compare_at_price && p.compare_at_price > p.price && p.product_status !== 'draft');
    if (discounted.length > 0) {
      return discounted.slice(0, 4).map((p, i) => ({
        id: p.id,
        title: p.name,
        badge: 'SAVE ' + Math.round(((p.compare_at_price! - p.price) / p.compare_at_price!) * 100) + '%',
        image: p.image_url,
        price: '₹' + p.price.toLocaleString(),
        category: p.category
      }));
    }
    return todaysDeals;
  }, [products]);

  const flashSaleProductsToUse = useMemo(() => {
    const list = products.filter(p => p.flash_sale && p.product_status !== 'draft');
    if (list.length > 0) return list;
    return products.filter(p => p.product_status !== 'draft').slice(0, 5);
  }, [products]);

  const newArrivalsToUse = useMemo(() => {
    return newArrivals.length > 0 ? newArrivals : products.filter(p => p.product_status !== 'draft').slice(0, 8);
  }, [newArrivals, products]);

  const bestSellersToUse = useMemo(() => {
    return bestSellers.length > 0 ? bestSellers : products.filter(p => p.product_status !== 'draft').slice(2, 6);
  }, [bestSellers, products]);

  const trendingToUse = useMemo(() => {
    return trendingProducts.length > 0 ? trendingProducts : products.filter(p => p.product_status !== 'draft').slice(3, 8);
  }, [trendingProducts, products]);

  const recommendedToUse = useMemo(() => {
    return recommendedProducts.length > 0 ? recommendedProducts : products.filter(p => p.product_status !== 'draft').slice(4, 8);
  }, [recommendedProducts, products]);

  const recentlyViewedToUse = useMemo(() => {
    return recentlyViewedProducts.length > 0 ? recentlyViewedProducts : products.filter(p => p.product_status !== 'draft').slice(1, 5);
  }, [recentlyViewedProducts, products]);

  const brandsToUse = useMemo(() => {
    return dbBrands.length > 0 ? dbBrands : popularBrands;
  }, [dbBrands]);

  const reviewsToUse = useMemo(() => {
    return dbReviews.length > 0 ? dbReviews : customerReviews;
  }, [dbReviews]);

  const activeBanner = useMemo(() => dbBanners.find(b => b.enabled), [dbBanners]);

  // Helper renderers for dynamic, ordering, and toggles
  const renderFlashSale = () => {
    const isFsEnabled = flashSaleConfig?.enabled ?? true;
    if (!isFsEnabled) return null;

    const title = flashSaleConfig?.title || "Flash Sale";
    const subtitle = flashSaleConfig?.subtitle || "Incredible limited-quantity prices expiring shortly.";
    const offerBadge = flashSaleConfig?.offer_badge || "Ends Today";

    return (
      <section className="mt-24 border-t border-slate-100 pt-16 animate-slide-up" style={{ animationDelay: '0.1s' }} id="section-flash-sale">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-rose-500 to-pink-600 text-[10px] font-bold text-white rounded-full tracking-wider uppercase shadow-lg shadow-rose-500/30 animate-pulse">
                {offerBadge}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                <Clock className="w-5 h-5 text-rose-500" />
                <span>{title}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-white border border-slate-200/60 py-2 px-3.5 rounded-2xl font-mono text-sm font-bold text-slate-800 shadow-[0_4px_15px_rgba(0,0,0,0.03)]">
              <span className="text-slate-400 font-sans text-[10px] font-bold uppercase tracking-wider mr-2">Ends In</span>
              <span className="w-6 text-center text-violet-600">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="text-rose-500 animate-pulse">:</span>
              <span className="w-6 text-center text-violet-600">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="text-rose-500 animate-pulse">:</span>
              <span className="w-6 text-center text-rose-600">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => scrollContainer(flashSaleRef, 'left')}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-violet-600 hover:border-violet-200 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollContainer(flashSaleRef, 'right')}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-violet-600 hover:border-violet-200 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div 
          ref={flashSaleRef}
          className="flex overflow-x-auto gap-6 pb-6 scrollbar-none snap-x snap-mandatory px-1"
        >
          {flashSaleProductsToUse.map((prod) => (
            <div key={prod.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start shrink-0 transform transition-all duration-300 hover:-translate-y-2">
              <PremiumProductCard
                product={prod}
                onAddToCart={onAddToCart}
                onQuickView={(id) => setCurrentView({ page: 'detail', productId: id })}
                inCartQty={getCartQuantity(prod.id)}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCategories = () => {
    return (
      <section className="mt-24 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-violet-50/40 rounded-[2.5rem] border border-slate-200/50 p-8 sm:p-12 relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }} id="section-categories">
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full pointer-events-none bg-cyan-500/10 blur-[80px]" />
        
        <div className="space-y-1 mb-10 text-center max-w-md mx-auto">
          <span className="text-[10px] uppercase tracking-widest font-bold text-violet-600">Curated Architecture</span>
          <h2 className="font-display text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Shop by Category</h2>
          <p className="text-sm text-slate-500 font-medium">Explore premium grade components structured by domain.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categoriesToUse.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategorySelect(cat.name)}
              className="group relative bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-5 flex flex-col justify-between hover:bg-white hover:border-violet-200 hover:shadow-[0_20px_40px_rgba(124,58,237,0.08)] hover:-translate-y-2 active:scale-95 transition-all duration-500 cursor-pointer min-h-[160px]"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <span className="text-[10px] font-mono font-bold text-violet-500 bg-violet-50/80 px-2 py-0.5 rounded-md border border-violet-100">
                  {cat.count} items
                </span>
              </div>

              <div>
                <h4 className="font-display font-extrabold text-sm sm:text-base text-slate-800 group-hover:text-violet-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1 mt-1 group-hover:text-cyan-600 transition-colors">
                  <span>Browse Vault</span>
                  <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderTodaysDeals = () => {
    return (
      <section className="mt-24 animate-slide-up" style={{ animationDelay: '0.1s' }} id="section-todays-deals">
        <div className="space-y-1 mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Today's Deals</h2>
          <p className="text-xs text-slate-500 font-medium">Uncompromising high-performance hardware at bespoke rates.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-violet-950 p-8 sm:p-10 flex flex-col justify-between text-white border border-slate-800 shadow-[0_15px_40px_rgba(124,58,237,0.15)] lg:col-span-1 min-h-[380px] group">
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-violet-500/20 transition-colors duration-700" />
            
            <div className="space-y-4 relative z-10">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-[10px] font-bold text-white tracking-widest rounded-full uppercase border border-white/10 inline-block">
                Exclusive Campaign
              </span>
              <h3 className="font-display text-3xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-violet-200">
                Summer Gadgets Fest
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xs">
                Unlock top-tier audio equipment, certified hardware accessories, and smart wear with full product warranty coverage.
              </p>
            </div>

            <div className="relative z-10">
              <div className="text-sm font-mono font-bold text-cyan-400 mb-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">Starts at just ₹1,999</div>
              <button
                onClick={() => handleCategorySelect('All')}
                className="bg-white text-slate-900 hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 hover:text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center space-x-2 transition-all duration-300 cursor-pointer shadow-lg active:scale-95"
              >
                <span>Explore Deals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:gap-6">
            {dealsToUse.map((deal) => (
              <div
                key={deal.id}
                onClick={() => handleCategorySelect(deal.category)}
                className="group relative bg-white border border-slate-100 rounded-[2rem] p-5 flex flex-col justify-between hover:shadow-[0_15px_30px_rgba(15,23,42,0.06)] hover:border-violet-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.98]"
              >
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-2.5 py-0.5 bg-rose-50 text-[10px] font-bold text-rose-600 rounded-full tracking-wider border border-rose-100 shadow-sm">
                    {deal.badge}
                  </span>
                </div>

                <div className="aspect-square w-full rounded-2xl bg-slate-50/50 flex items-center justify-center p-3 mb-4 overflow-hidden relative group-hover:bg-violet-50/30 transition-colors">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                <div className="flex items-end justify-between gap-2 mt-auto">
                  <div>
                    <h4 className="font-display font-extrabold text-xs sm:text-sm text-slate-800 truncate group-hover:text-violet-600 transition-colors">
                      {deal.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Starting <span className="font-mono font-bold text-slate-700">{deal.price}</span>
                    </p>
                  </div>

                  <span className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-cyan-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-all shadow-sm">
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderNewArrivals = () => {
    return (
      <section className="mt-24 bg-gradient-to-br from-slate-50 to-cyan-50/20 rounded-[2.5rem] border border-slate-100 p-8 sm:p-12 animate-slide-up" style={{ animationDelay: '0.1s' }} id="section-new-arrivals">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-[10px] font-bold text-white rounded-full tracking-wider uppercase shadow-md shadow-violet-500/20">
                New
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">New Arrivals</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">Freshly added premium catalog items, in stock and ready to ship.</p>
          </div>
          <button
            onClick={() => handleCategorySelect('All')}
            className="text-xs font-bold text-violet-600 hover:text-cyan-600 flex items-center space-x-1.5 self-start sm:self-center cursor-pointer transition-colors active:scale-95"
          >
            <span>View All Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newArrivalsToUse.map((prod) => (
            <div key={prod.id} className="h-full transform transition-all duration-300 hover:-translate-y-2">
              <PremiumProductCard
                product={prod}
                onAddToCart={onAddToCart}
                onQuickView={(id) => setCurrentView({ page: 'detail', productId: id })}
                inCartQty={getCartQuantity(prod.id)}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderBestSellers = () => {
    return (
      <section className="mt-24 animate-slide-up" id="section-best-sellers">
        <div className="space-y-1 mb-8">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-slate-900 text-[10px] font-bold text-white rounded-full tracking-wider uppercase shadow-md">
              Top Seller
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Best Sellers</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">The most demanded products according to global client volume.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestSellersToUse.map((prod) => (
            <div key={prod.id} className="h-full transform transition-all duration-300 hover:-translate-y-2">
              <PremiumProductCard
                product={prod}
                onAddToCart={onAddToCart}
                onQuickView={(id) => setCurrentView({ page: 'detail', productId: id })}
                inCartQty={getCartQuantity(prod.id)}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderTrendingNow = () => {
    return (
      <section className="mt-24 bg-slate-50/80 border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 animate-slide-up" id="section-trending">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white rounded-full tracking-wider uppercase shadow-lg shadow-orange-500/20">
                🔥 Hot
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Trending Now</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">Top momentum electronics with exceptional review profiles.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => scrollContainer(trendingRef, 'left')}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-violet-600 hover:border-violet-200 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollContainer(trendingRef, 'right')}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-violet-600 hover:border-violet-200 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={trendingRef}
          className="flex overflow-x-auto gap-6 pb-6 scrollbar-none snap-x snap-mandatory px-1"
        >
          {trendingToUse.map((prod) => {
            const weeklySales = (prod.name.length * 11) % 40 + 65;
            return (
              <div key={prod.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start shrink-0 relative group">
                <div className="absolute top-20 left-6 z-10 flex items-center space-x-1.5 bg-amber-500/90 backdrop-blur-xs text-[9px] text-white font-bold px-2 py-0.5 rounded-full shadow-sm pointer-events-none uppercase">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>{weeklySales} Sold This Week</span>
                </div>
                <div className="h-full transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] rounded-2xl">
                  <PremiumProductCard
                    product={prod}
                    onAddToCart={onAddToCart}
                    onQuickView={(id) => setCurrentView({ page: 'detail', productId: id })}
                    inCartQty={getCartQuantity(prod.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderPromoBanner = () => {
    const bannerTitle = activeBanner?.title || "Summer Mega Sale";
    const bannerSubtitle = activeBanner?.subtitle || "Up to 60% OFF on Premium Electronics";
    const bannerDesc = activeBanner?.description || "Acquire next-level tech, premium noise-cancelling headgear, smart wearables, and professional camera gear. Free global dispatch applied automatically.";
    const bannerButtonText = activeBanner?.button_text || "Shop Now";
    const bannerImgSrc = activeBanner?.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80";

    return (
      <section className="mt-24 relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-700 to-cyan-900 bg-[length:200%_200%] animate-gradient-shift p-12 sm:p-20 text-white border border-violet-900/50 shadow-[0_20px_50px_rgba(124,58,237,0.3)] animate-slide-up" id="section-promo-banner">
        <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="absolute left-[8%] top-[20%] hidden xl:block w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-2xl animate-float-slow pointer-events-none select-none">
          <img 
            src={bannerImgSrc} 
            alt="Audio Float" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]" 
          />
        </div>

        <div className="absolute right-[8%] bottom-[20%] hidden xl:block w-36 h-36 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-2xl animate-float-medium pointer-events-none select-none">
          <img 
            src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150&auto=format&fit=crop&q=80" 
            alt="Camera Float" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]" 
          />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <span className="px-4 py-1.5 bg-white/15 backdrop-blur-md text-xs font-bold text-white tracking-widest rounded-full uppercase border border-white/20 inline-block shadow-lg">
            Limited Time Offer
          </span>
          
          <div className="space-y-3">
            <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-none text-white drop-shadow-md">
              {bannerTitle}
            </h2>
            <p className="font-display text-lg sm:text-2xl font-bold text-cyan-200">
              {bannerSubtitle}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-fuchsia-100 font-medium leading-relaxed max-w-md mx-auto">
            {bannerDesc}
          </p>

          <div className="pt-4">
            <button
              onClick={() => handleCategorySelect('All')}
              className="bg-white hover:bg-slate-50 text-violet-900 active:scale-95 transition-all duration-300 font-bold text-sm py-4 px-10 rounded-2xl flex items-center space-x-2.5 mx-auto shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] cursor-pointer animate-glow-pulse"
            >
              <span>{bannerButtonText}</span>
              <ArrowRight className="w-4 h-4 text-violet-900" />
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderPopularBrands = () => {
    return (
      <section className="mt-24 animate-slide-up" id="section-popular-brands">
        <div className="space-y-1 mb-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Popular Brands</h2>
          <p className="text-xs text-slate-500 font-medium">Direct collaboration with global leading high-end hardware manufacturers.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {brandsToUse.map((b) => (
            <div
              key={b.name}
              onClick={() => handleCategorySelect('All')}
              className="group bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_15px_30px_rgba(124,58,237,0.08)] hover:border-violet-200 hover:-translate-y-2 active:scale-95 cursor-pointer h-24"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-50 flex items-center justify-center p-1 mb-2 group-hover:scale-110 transition-transform duration-500">
                <img src={b.logo} alt={b.name} referrerPolicy="no-referrer" className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 group-hover:text-violet-600 transition-colors">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderRecommended = () => {
    return (
      <section className="mt-24 bg-gradient-to-br from-slate-50 to-fuchsia-50/20 rounded-[2.5rem] border border-slate-100 p-8 sm:p-12 animate-slide-up" id="section-recommended">
        <div className="space-y-1 mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Recommended For You</h2>
          <p className="text-sm text-slate-500 font-medium">Personalized picks you'll love.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {recommendedToUse.map((prod) => (
            <div key={prod.id} className="h-full transform transition-all duration-300 hover:-translate-y-2">
              <PremiumProductCard
                product={prod}
                onAddToCart={onAddToCart}
                onQuickView={(id) => setCurrentView({ page: 'detail', productId: id })}
                inCartQty={getCartQuantity(prod.id)}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderRecentlyViewed = () => {
    return (
      <section className="mt-24 animate-slide-up" id="section-recently-viewed">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Recently Viewed</h2>
            <p className="text-xs text-slate-500 font-medium">Jump back into your recently inspected tech hardware.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => scrollContainer(recentlyViewedRef, 'left')}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-violet-600 hover:border-violet-200 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollContainer(recentlyViewedRef, 'right')}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-violet-600 hover:border-violet-200 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={recentlyViewedRef}
          className="flex overflow-x-auto gap-6 pb-6 scrollbar-none snap-x snap-mandatory px-1"
        >
          {recentlyViewedToUse.map((prod) => (
            <div key={prod.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start shrink-0 transform transition-all duration-300 hover:-translate-y-2">
              <PremiumProductCard
                product={prod}
                onAddToCart={onAddToCart}
                onQuickView={(id) => setCurrentView({ page: 'detail', productId: id })}
                inCartQty={getCartQuantity(prod.id)}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderWhyShop = () => {
    return (
      <section className="mt-24 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-violet-50/30 rounded-[2.5rem] border border-slate-200/50 p-8 sm:p-12 animate-slide-up" id="section-why-shop">
        <div className="space-y-1 mb-10 text-center max-w-sm mx-auto">
          <span className="text-[10px] uppercase tracking-widest font-bold text-violet-600">Pure Craftsmanship</span>
          <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Why Shop with OGhaitong</h2>
          <p className="text-sm text-slate-500 font-medium">Our core promises ensuring pristine customer satisfaction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((f, i) => (
            <div
              key={i}
              className="group bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 hover:bg-white hover:border-violet-100 hover:shadow-[0_20px_40px_rgba(124,58,237,0.06)] hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-50/80 border border-violet-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-violet-100 transition-all duration-300">
                {f.icon}
              </div>
              <h4 className="font-display font-extrabold text-base text-slate-900 group-hover:text-violet-600 transition-colors mb-2">
                {f.title}
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCustomerReviews = () => {
    return (
      <section className="mt-24 animate-slide-up" id="section-reviews">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-600">Client Opinions</span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Customer Reviews</h2>
            <p className="text-xs text-slate-500 font-medium">Verified purchase feedback from our international technology patrons.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => scrollContainer(reviewsRef, 'left')}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-200 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollContainer(reviewsRef, 'right')}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-200 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={reviewsRef}
          className="flex overflow-x-auto gap-6 pb-6 scrollbar-none snap-x snap-mandatory px-1"
        >
          {reviewsToUse.map((rev) => (
            <div 
              key={rev.id} 
              className="min-w-[280px] sm:min-w-[380px] max-w-[380px] snap-start shrink-0 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between hover:shadow-[0_15px_30px_rgba(34,211,238,0.08)] hover:-translate-y-2 hover:border-cyan-100 transition-all duration-500"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="flex items-center space-x-1 text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      <CheckCircle className="w-3 h-3 text-emerald-600 fill-current" />
                      <span>Verified Purchase</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                  "{rev.text}"
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-50">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                  <img src={rev.avatar} alt={rev.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">{rev.name}</h5>
                  <p className="text-[9px] text-slate-400 font-medium">{rev.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderNewsletter = () => {
    return (
      <section className="mt-24 mb-16 relative animate-slide-up" id="section-newsletter">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950/40 to-cyan-950/20 p-8 sm:p-14 text-white border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center space-y-6">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-400 font-mono">Stay Synchronized</span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">Stay Updated with OGhaitong</h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-lg mx-auto leading-relaxed">
                Get exclusive offers, new arrivals, and limited-time discounts delivered directly to your inbox.
              </p>
            </div>

            {subscribed ? (
              <div className="relative z-10 py-4 max-w-md mx-auto bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold px-6 rounded-2xl flex items-center justify-center space-x-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Secure Connection Established. Welcome to OGhaitong updates!</span>
              </div>
            ) : (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (newsletterEmail.trim()) {
                    try {
                      await dbService.addSubscriber(newsletterEmail);
                      setSubscribed(true);
                      setNewsletterEmail('');
                    } catch (err: any) {
                      alert(err.message || 'Subscription failed');
                    }
                  }
                }}
                className="relative z-10 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5 pt-2"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-2xl py-3.5 pl-12 pr-4 text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-slate-100 placeholder-slate-400 transition-all backdrop-blur-md shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs py-3.5 px-6 rounded-2xl active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <p className="relative z-10 text-[10px] text-slate-500 font-medium">
              We value your privacy. Unsubscribe securely with one-click links in footer dispatches.
            </p>
          </div>
        </div>
      </section>
    );
  };

  const sectionMap: Record<string, () => React.ReactNode> = {
    flash_sale: renderFlashSale,
    categories: renderCategories,
    todays_deals: renderTodaysDeals,
    new_arrivals: renderNewArrivals,
    best_sellers: renderBestSellers,
    trending_now: renderTrendingNow,
    promo_banner: renderPromoBanner,
    popular_brands: renderPopularBrands,
    recommended: renderRecommended,
    recently_viewed: renderRecentlyViewed,
    why_shop: renderWhyShop,
    customer_reviews: renderCustomerReviews,
    newsletter: renderNewsletter
  };

  return (
    <div className="py-8 animate-fade-in overflow-hidden">
      
      {/* Global CSS injected for enhanced animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-22px) rotate(-3deg); }
        }
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 15px rgba(124,58,237,0.4); }
          50% { box-shadow: 0 0 30px rgba(34,211,238,0.6); }
        }
        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 5s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-gradient-shift {
          animation: gradient-shift 8s ease infinite;
        }
        .animate-glow-pulse {
          animation: glow-pulse 2.5s infinite;
        }
      `}} />

      {/* NEW PROFESSIONAL HERO BANNER (DARK THEME) */}
      <div className="relative mb-12 rounded-[2.5rem] overflow-hidden bg-slate-950 bg-gradient-to-br from-slate-950 via-violet-950/50 to-cyan-950/20 bg-[length:200%_200%] animate-gradient-shift text-white p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.4)] min-h-[500px] border border-slate-800/80">
        
        {/* Soft glowing neon orbs for the dark background */}
        <div className="absolute top-[10%] left-[30%] w-64 h-64 rounded-full bg-violet-600/20 blur-[80px] opacity-80 animate-float-slow" />
        <div className="absolute bottom-[10%] left-[40%] w-48 h-48 rounded-full bg-cyan-600/10 blur-[60px] opacity-70 animate-float-medium" />
        <div className="absolute top-[20%] right-[10%] w-80 h-80 rounded-full bg-fuchsia-600/10 blur-[100px] opacity-60 animate-float-slow" style={{ animationDelay: '1s' }} />

        {/* Left Column: Clean Typography and Dark CTA Card */}
        <div className="relative z-10 flex-1 max-w-xl space-y-6">
          {/* Subtle Pill Badge */}
          <div className="inline-flex items-center bg-violet-500/20 text-violet-300 border border-violet-500/30 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping mr-2.5"></span>
            Limited Time Offer
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-[5.5rem] font-black text-white tracking-tight leading-[1.05] drop-shadow-lg">
              Experience<br />Pure Sound.
            </h1>
            <p className="font-display text-lg lg:text-xl font-bold text-cyan-400">
              Premium Wireless Headphones
            </p>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
              Industry-leading noise cancellation, immersive audio, and all-day comfort.
            </p>
          </div>

          {/* Dark Glass CTA Mini-Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] max-w-[360px] transform transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center justify-between mb-5">
              {/* Left Side: 50% Promo */}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Up To</span>
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 tracking-tighter my-0.5 drop-shadow-sm">50%</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Off</span>
              </div>

              {/* Vertical divider */}
              <div className="w-[1px] h-12 bg-slate-700/50 mx-2"></div>

              {/* Right Side: Features List */}
              <div className="flex-1 pl-3 space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 border border-violet-500/30">
                    <Clock className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Limited Time</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Truck className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Free Shipping</span>
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
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 active:scale-95 text-white py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all duration-300 shadow-[0_8px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_12px_25px_rgba(34,211,238,0.4)] cursor-pointer"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Dark Frosted Glass Display Area */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          <div className="relative w-full max-w-md aspect-square bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center p-8 select-none overflow-hidden">
            
            {imageError ? (
              // Fallback dark UI matching the layout
              <>
                <div className="w-40 h-40 bg-slate-800/80 border border-slate-700/50 rounded-full shadow-[0_0_40px_rgba(124,58,237,0.15)] flex items-center justify-center mb-8 relative z-10 hover:scale-105 transition-transform duration-500">
                  <Headphones className="w-20 h-20 text-violet-400 stroke-[1.5]" />
                </div>
                <span className="text-[10px] font-bold text-violet-400 tracking-widest uppercase font-mono mb-2">Pure Sound Engine</span>
                <p className="text-[11px] text-slate-400 font-medium">Pro Series Wireless</p>
              </>
            ) : (
              // If an image is successfully loaded, place it elegantly within the dark frosted card
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-violet-600/10 to-transparent pointer-events-none rounded-[2.5rem]" />
                <img
                  src={heroHeadphonesSrc}
                  onError={() => {
                    setImageError(true);
                  }}
                  alt="Experience Pure Sound Premium Headphones"
                  className="w-4/5 h-4/5 object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-[800ms] relative z-10"
                  referrerPolicy="no-referrer"
                />
              </>
            )}

            {/* Front floating neon sphere overlapping the glass edge */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500/30 to-cyan-400/30 backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.2)] border border-white/10 animate-float-medium z-20" />
          </div>
        </div>

      </div>

      {/* Clean Bottom Highlights Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Card 1: Battery */}
        <div className="bg-white border border-slate-100/80 p-5 rounded-3xl flex items-center space-x-4 shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.04)] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-violet-50/80 flex items-center justify-center text-violet-600">
            <Battery className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display font-bold text-slate-900 text-sm leading-tight">40 Hours</p>
            <p className="text-[11px] text-slate-500 font-medium">Battery</p>
          </div>
        </div>

        {/* Card 2: ANC */}
        <div className="bg-white border border-slate-100/80 p-5 rounded-3xl flex items-center space-x-4 shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.04)] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-cyan-50/80 flex items-center justify-center text-cyan-600">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display font-bold text-slate-900 text-sm leading-tight">Active Noise</p>
            <p className="text-[11px] text-slate-500 font-medium">Cancellation</p>
          </div>
        </div>

        {/* Card 3: Hi-Res */}
        <div className="bg-white border border-slate-100/80 p-5 rounded-3xl flex items-center space-x-4 shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.04)] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-50/80 flex items-center justify-center text-fuchsia-600">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display font-bold text-slate-900 text-sm leading-tight">Hi-Res</p>
            <p className="text-[11px] text-slate-500 font-medium">Audio</p>
          </div>
        </div>

        {/* Card 4: Bluetooth */}
        <div className="bg-white border border-slate-100/80 p-5 rounded-3xl flex items-center space-x-4 shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.04)] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50/80 flex items-center justify-center text-indigo-600">
            <Bluetooth className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display font-bold text-slate-900 text-sm leading-tight">Bluetooth 5.4</p>
            <p className="text-[11px] text-slate-500 font-medium">Connectivity</p>
          </div>
        </div>
      </div>

      {/* Catalog Filters Bar */}
      <div id="catalog-section" className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">Featured Products</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Showing {filteredProducts.length} Premium Essentials</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search premium products..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 bg-white px-3 py-2.5 border border-slate-200 rounded-lg shadow-sm focus-within:border-violet-500 transition-colors">
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
        <div className="flex overflow-x-auto py-4 scrollbar-none gap-2 px-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_4px_15px_rgba(124,58,237,0.3)]'
                  : 'bg-white text-slate-600 hover:text-violet-600 border border-slate-200 hover:border-violet-200 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm animate-slide-up">
          <p className="text-slate-500 font-medium">No premium products match your parameters.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
            className="mt-3 text-violet-600 text-sm font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {filteredProducts.map((product) => {
            const inCartQty = getCartQuantity(product.id);
            const isOutOfStock = product.stock <= 0;
            const discountPercentage = product.compare_at_price
              ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-[0_15px_30px_rgba(124,58,237,0.08)] hover:-translate-y-2 transition-all duration-500 flex flex-col group"
              >
                {/* Product Image Stage */}
                <div className="relative aspect-[4/3] bg-slate-50/50 overflow-hidden cursor-pointer group-hover:bg-violet-50/30 transition-colors" onClick={() => setCurrentView({ page: 'detail', productId: product.id })}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Category Pill */}
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 bg-white/95 backdrop-blur-md border border-slate-200 text-[8px] sm:text-[10px] font-bold text-slate-700 rounded-md shadow-sm uppercase tracking-wider font-mono">
                    {product.category}
                  </span>

                  {/* Discount Badge */}
                  {discountPercentage > 0 && (
                    <span className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 py-0.5 bg-gradient-to-r from-rose-500 to-pink-600 text-[8px] sm:text-[10px] font-bold text-white rounded-md shadow-md tracking-wider">
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
                  <div className="hidden sm:flex absolute inset-0 bg-violet-900/10 opacity-0 group-hover:opacity-100 transition-opacity items-end justify-center pb-4 backdrop-blur-[2px]">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentView({ page: 'detail', productId: product.id });
                      }}
                      className="px-3.5 py-1.5 bg-white/95 backdrop-blur-md border border-white text-slate-800 font-semibold text-xs rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex items-center space-x-1.5 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
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
                    className="font-display font-bold text-xs sm:text-base text-slate-900 group-hover:text-violet-600 transition-colors cursor-pointer line-clamp-1"
                  >
                    {product.name}
                  </h3>
                  
                  <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1 mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-auto pt-2 sm:pt-4 border-t border-slate-100 flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 sm:gap-2">
                    <div className="flex items-baseline space-x-1.5 xs:block">
                      {product.compare_at_price && (
                        <span className="block text-[9px] sm:text-[11px] text-slate-400 line-through font-medium">
                          ₹{product.compare_at_price.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-xs sm:text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 font-mono">
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
                        className={`w-full xs:w-auto px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all duration-300 active:scale-95 flex items-center justify-center space-x-1 ${
                          inCartQty > 0
                            ? 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 shadow-sm'
                            : 'bg-slate-900 text-white hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 shadow-md hover:shadow-[0_8px_20px_rgba(124,58,237,0.3)]'
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

      {/* Dynamic Ordered Sections from Website Settings */}
      {dbSettings?.section_order ? (
        dbSettings.section_order.map((secName: string) => {
          const isVisible = dbSettings.section_visibility?.[secName] !== false;
          if (!isVisible) return null;
          const renderer = sectionMap[secName];
          return renderer ? <React.Fragment key={secName}>{renderer()}</React.Fragment> : null;
        })
      ) : (
        // fallback default sequence
        <>
          {renderFlashSale()}
          {renderCategories()}
          {renderTodaysDeals()}
          {renderNewArrivals()}
          {renderBestSellers()}
          {renderTrendingNow()}
          {renderPromoBanner()}
          {renderPopularBrands()}
          {renderRecommended()}
          {renderRecentlyViewed()}
          {renderWhyShop()}
          {renderCustomerReviews()}
          {renderNewsletter()}
        </>
      )}

    </div>
  );
}
