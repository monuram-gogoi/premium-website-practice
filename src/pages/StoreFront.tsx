import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, SlidersHorizontal, Plus, ArrowRight, Eye, Star, Clock, Truck, Battery, 
  Volume2, Music, Bluetooth, Headphones, ChevronLeft, ChevronRight, Sparkles, 
  Flame, ShoppingBag, ArrowUp, Send, CheckCircle, Smartphone, Laptop, Gamepad2, 
  Watch, Camera, Heart, HelpCircle, Gift, Users, RotateCcw, ShieldCheck, Mail,
  Mic, Radio, Monitor
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

  // Hero Slider State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

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

  // Hero Slider Data Configuration
  const heroSlides = useMemo(() => [
    {
      id: 'audio-pro',
      badge: 'Pro Edition Drop',
      titleMain: 'Aura',
      titleHighlight: 'Unleashed.',
      desc: 'Elevate your setup with studio-grade clarity. Engineered for total immersion, crystal-clear comms, and a competitive edge.',
      category: 'Audio',
      priceLabel: '50% OFF',
      imageSrc: heroHeadphonesSrc,
      fallbackIcon: <Headphones className="w-24 h-24 text-white/50 mb-4" />,
      features: [
        { icon: <Volume2 className="w-4 h-4 text-violet-400" />, title: 'Active ANC', sub: 'Zero Distractions', color: 'bg-violet-500/20' },
        { icon: <Battery className="w-4 h-4 text-cyan-400" />, title: '40H Life', sub: 'Tournament Ready', color: 'bg-cyan-500/20' },
        { icon: <Bluetooth className="w-4 h-4 text-fuchsia-400" />, title: 'Zero Latency', sub: 'BT 5.4 Connect', color: 'bg-fuchsia-500/20' }
      ],
      gradientText: 'from-cyan-300 via-violet-300 to-fuchsia-300'
    },
    {
      id: 'mobile-esports',
      badge: 'Mobile Pro Gear',
      titleMain: 'Dominate',
      titleHighlight: 'The Arena.',
      desc: 'Tournament-grade mobile accessories. Ultra-responsive triggers and advanced thermal cooling for extended competitive scrims.',
      category: 'Gaming',
      priceLabel: 'NEW DROP',
      imageSrc: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=500&auto=format&fit=crop&q=80', // Gamepad/Mobile placeholder
      fallbackIcon: <Smartphone className="w-24 h-24 text-white/50 mb-4" />,
      features: [
        { icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />, title: '1ms Input', sub: 'Hyper-Fast', color: 'bg-emerald-500/20' },
        { icon: <Flame className="w-4 h-4 text-orange-400" />, title: 'Cryo-Cool', sub: 'Active Thermal', color: 'bg-orange-500/20' },
        { icon: <Battery className="w-4 h-4 text-blue-400" />, title: 'Pass-Through', sub: 'Charge & Play', color: 'bg-blue-500/20' }
      ],
      gradientText: 'from-emerald-300 via-blue-300 to-teal-300'
    },
    {
      id: 'stream-broadcast',
      badge: 'Studio Setup',
      titleMain: 'Broadcast',
      titleHighlight: 'Perfection.',
      desc: 'Professional capture cards, dynamic mics, and stream controllers for seamless live broadcast integration and audience engagement.',
      category: 'Electronics',
      priceLabel: 'SAVE 20%',
      imageSrc: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500&auto=format&fit=crop&q=80', // Mic/Studio placeholder
      fallbackIcon: <Mic className="w-24 h-24 text-white/50 mb-4" />,
      features: [
        { icon: <Monitor className="w-4 h-4 text-rose-400" />, title: '4K Capture', sub: '60FPS Passthrough', color: 'bg-rose-500/20' },
        { icon: <Radio className="w-4 h-4 text-pink-400" />, title: 'Cardioid', sub: 'Studio Voice', color: 'bg-pink-500/20' },
        { icon: <SlidersHorizontal className="w-4 h-4 text-amber-400" />, title: 'Live Mix', sub: 'Quick Controls', color: 'bg-amber-500/20' }
      ],
      gradientText: 'from-rose-300 via-pink-300 to-amber-300'
    }
  ], [heroHeadphonesSrc]);

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

        const recStored = localStorage.getItem('ec_recently_viewed');
        if (recStored) {
          const ids: string[] = JSON.parse(recStored);
          const matched = ids.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
          setRecentlyViewedProducts(matched.filter(p => p.product_status !== 'draft'));
        } else {
          setRecentlyViewedProducts(products.filter(p => p.product_status !== 'draft').slice(1, 6));
        }
      } catch (err) {
        console.error('Error fetching storefront database configurations:', err);
      }
    }
    fetchStoreConfig();
  }, [products]);

  // Auto-advance Hero Slider
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  // Live countdown effect based on Database date
  useEffect(() => {
    if (!flashSaleConfig || !flashSaleConfig.end_date) {
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
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
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
        setFlashSaleConfig((prev: any) => prev ? { ...prev, enabled: false } : null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSaleConfig?.end_date]);

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
    if (catalogSection) catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['All', ...Array.from(list)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
      );
    }
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    return result;
  }, [products, search, selectedCategory, sortBy]);

  const getCartQuantity = (productId: string) => {
    const item = cart.find(c => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Computations for sections omitted for brevity (same as previous)
  const categoriesToUse = useMemo(() => dbCategories.length > 0 ? dbCategories.map(cat => ({ id: cat.id, name: cat.name, icon: cat.icon || '📦', count: products.filter(p => p.category === cat.name && p.product_status !== 'draft').length })) : categoryDataList, [dbCategories, products]);
  const dealsToUse = useMemo(() => {
    const discounted = products.filter(p => p.compare_at_price && p.compare_at_price > p.price && p.product_status !== 'draft');
    return discounted.length > 0 ? discounted.slice(0, 4).map(p => ({ id: p.id, title: p.name, badge: 'SAVE ' + Math.round(((p.compare_at_price! - p.price) / p.compare_at_price!) * 100) + '%', image: p.image_url, price: '₹' + p.price.toLocaleString(), category: p.category })) : todaysDeals;
  }, [products]);
  const flashSaleProductsToUse = useMemo(() => products.filter(p => p.flash_sale && p.product_status !== 'draft').length > 0 ? products.filter(p => p.flash_sale && p.product_status !== 'draft') : products.filter(p => p.product_status !== 'draft').slice(0, 5), [products]);
  const newArrivalsToUse = useMemo(() => newArrivals.length > 0 ? newArrivals : products.filter(p => p.product_status !== 'draft').slice(0, 8), [newArrivals, products]);
  const bestSellersToUse = useMemo(() => bestSellers.length > 0 ? bestSellers : products.filter(p => p.product_status !== 'draft').slice(2, 6), [bestSellers, products]);
  const trendingToUse = useMemo(() => trendingProducts.length > 0 ? trendingProducts : products.filter(p => p.product_status !== 'draft').slice(3, 8), [trendingProducts, products]);
  const recommendedToUse = useMemo(() => recommendedProducts.length > 0 ? recommendedProducts : products.filter(p => p.product_status !== 'draft').slice(4, 8), [recommendedProducts, products]);
  const recentlyViewedToUse = useMemo(() => recentlyViewedProducts.length > 0 ? recentlyViewedProducts : products.filter(p => p.product_status !== 'draft').slice(1, 5), [recentlyViewedProducts, products]);
  const brandsToUse = useMemo(() => dbBrands.length > 0 ? dbBrands : popularBrands, [dbBrands]);
  const reviewsToUse = useMemo(() => dbReviews.length > 0 ? dbReviews : customerReviews, [dbReviews]);
  const activeBanner = useMemo(() => dbBanners.find(b => b.enabled), [dbBanners]);

  const activeHero = heroSlides[currentHeroSlide];

  // (Section Renderers omitted for brevity - they remain identical to your previous code)
  // ... [renderFlashSale, renderCategories, renderTodaysDeals, renderNewArrivals, renderBestSellers, renderTrendingNow, renderPromoBanner, renderPopularBrands, renderRecommended, renderRecentlyViewed, renderWhyShop, renderCustomerReviews, renderNewsletter] ...

  return (
    <div className="py-8 animate-fade-in overflow-hidden max-w-[1400px] mx-auto">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-slow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(2deg); } }
        @keyframes float-medium { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-22px) rotate(-3deg); } }
        @keyframes slide-up-fade { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-slide-in { animation: slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-gradient-shift { animation: gradient-shift 8s ease infinite; }
      `}} />

      {/* DYNAMIC PRO HERO CAROUSEL */}
      <div className="relative mb-12 rounded-[2.5rem] overflow-hidden bg-slate-950 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)] min-h-[550px] border border-white/10 group">
        
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-slate-900 to-cyan-900/80 z-0 transition-colors duration-1000" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] bg-gradient-to-br from-fuchsia-600/30 via-violet-600/20 to-transparent blur-[120px] animate-pulse z-0" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[120%] bg-gradient-to-tl from-cyan-400/30 via-blue-600/20 to-transparent blur-[120px] animate-float-slow z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay z-0"></div>

        {/* Carousel Navigation Arrows */}
        <button 
          onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/20 hover:bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/20 hover:bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentHeroSlide === idx ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Left Content - Typography & CTA (Keyed for re-animation) */}
        <div key={`content-${activeHero.id}`} className="relative z-10 flex-1 w-full p-8 sm:p-12 lg:p-16 space-y-8 animate-slide-in">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full shadow-xl cursor-default">
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-widest uppercase">{activeHero.badge}</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] drop-shadow-lg">
              {activeHero.titleMain} <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${activeHero.gradientText} animate-gradient-shift bg-[length:200%_200%]`}>
                {activeHero.titleHighlight}
              </span>
            </h1>
            <p className="text-lg text-slate-300 font-medium max-w-md leading-relaxed">
              {activeHero.desc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
            <button
              onClick={() => {
                setSelectedCategory(activeHero.category);
                document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-full text-sm font-black flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-[0_10px_25px_rgba(255,255,255,0.2)]"
            >
              <span>Explore {activeHero.category}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-4 bg-slate-900/50 backdrop-blur-md rounded-full px-5 py-3 border border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Status</span>
                <span className="text-xl font-black text-rose-400 tracking-tighter drop-shadow-sm">{activeHero.priceLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Showcase - Floating Glass & Elements (Keyed for re-animation) */}
        <div key={`visuals-${activeHero.id}`} className="relative z-10 flex-1 flex justify-center items-center p-8 lg:p-16 w-full min-h-[400px] animate-fade-in">
           <div className="relative w-full max-w-md aspect-square">
             {/* Center Glass Display Sphere */}
             <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-white/10 to-transparent backdrop-blur-2xl border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden z-10 animate-float-medium">
               {imageError ? (
                  <div className="flex flex-col items-center">
                    {activeHero.fallbackIcon}
                    <span className="text-white/50 font-mono text-sm tracking-widest uppercase">{activeHero.category} PRO</span>
                  </div>
               ) : (
                  <img
                    src={activeHero.imageSrc}
                    onError={() => setImageError(true)}
                    alt={activeHero.titleMain}
                    className="w-3/4 h-3/4 object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] hover:scale-110 transition-transform duration-[800ms]"
                    referrerPolicy="no-referrer"
                  />
               )}
             </div>

             {/* Orbiting / Floating Badges from Data */}
             {activeHero.features[0] && (
               <div className="absolute top-[10%] right-[-5%] bg-slate-800/80 backdrop-blur-md border border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl animate-float-slow z-20 flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-full ${activeHero.features[0].color} flex items-center justify-center`}>
                    {activeHero.features[0].icon}
                 </div>
                 <div>
                   <p className="text-xs font-black leading-none">{activeHero.features[0].title}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{activeHero.features[0].sub}</p>
                 </div>
               </div>
             )}

             {activeHero.features[1] && (
               <div className="absolute bottom-[10%] left-[-5%] bg-slate-800/80 backdrop-blur-md border border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl animate-float-medium z-20 flex items-center gap-3" style={{ animationDelay: '1s' }}>
                 <div className={`w-8 h-8 rounded-full ${activeHero.features[1].color} flex items-center justify-center`}>
                    {activeHero.features[1].icon}
                 </div>
                 <div>
                   <p className="text-xs font-black leading-none">{activeHero.features[1].title}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{activeHero.features[1].sub}</p>
                 </div>
               </div>
             )}
             
             {activeHero.features[2] && (
               <div className="absolute top-[60%] right-[-10%] bg-slate-800/80 backdrop-blur-md border border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl animate-float-slow z-20 flex items-center gap-3" style={{ animationDelay: '2s' }}>
                 <div className={`w-8 h-8 rounded-full ${activeHero.features[2].color} flex items-center justify-center`}>
                    {activeHero.features[2].icon}
                 </div>
                 <div>
                   <p className="text-xs font-black leading-none">{activeHero.features[2].title}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{activeHero.features[2].sub}</p>
                 </div>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Catalog Filters Bar */}
      <div id="catalog-section" className="mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">The Vault</h2>
            <p className="text-sm text-slate-500 font-medium mt-2">Showing {filteredProducts.length} Premium Essentials</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-full border border-slate-200 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-transparent outline-none transition-all text-slate-900 font-medium placeholder:font-normal"
              />
            </div>

            <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden sm:block"></div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 px-3 py-2 transition-colors">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-bold bg-transparent outline-none text-slate-900 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex overflow-x-auto py-2 scrollbar-none gap-2 px-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm animate-slide-up">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900">No matches found</h3>
          <p className="text-slate-500 font-medium mt-2">Adjust your filters to discover more items.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
            className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {filteredProducts.map((product) => {
            const inCartQty = getCartQuantity(product.id);
            return (
              <div key={product.id} className="h-full transform transition-all duration-300 hover:-translate-y-2">
                <PremiumProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onQuickView={(id) => setCurrentView({ page: 'detail', productId: id })}
                  inCartQty={inCartQty}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
