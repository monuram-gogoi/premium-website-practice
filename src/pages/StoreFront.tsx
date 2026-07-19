import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, SlidersHorizontal, Plus, ArrowRight, Eye, Star, Clock, Truck, Battery, 
  Volume2, Music, Bluetooth, Headphones, ChevronLeft, ChevronRight, Sparkles, 
  Flame, ShoppingBag, ArrowUp, Send, CheckCircle, Smartphone, Laptop, Gamepad2, 
  Watch, Camera, Heart, HelpCircle, Gift, Users, RotateCcw, ShieldCheck, Mail,
  Mic, Radio, Monitor, MessageSquare
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

  // Chatbot States (Phase 2 Integration)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: 'Welcome to Support. How can I help you today?' }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

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
      imageSrc: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=500&auto=format&fit=crop&q=80',
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
      imageSrc: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500&auto=format&fit=crop&q=80',
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
    }, 6000); 
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

  // Chatbot Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsBotTyping(true);

    try {
      // Replace with your actual live Python backend URL when deployed
      const response = await fetch('https://your-python-bot.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'bot', text: 'Sorry, our support systems are currently offline. Please try again later.' }]);
    } finally {
      setIsBotTyping(false);
    }
  };

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

  // --- DYNAMIC DATA COMPUTATIONS ---
  const categoriesToUse = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map(cat => {
        const count = products.filter(p => p.category === cat.name && p.product_status !== 'draft').length;
        const icon = cat.icon || '📦';
        return { id: cat.id, name: cat.name, icon, count };
      });
    }
    return categoryDataList;
  }, [dbCategories, products]);

  const dealsToUse = useMemo(() => {
    const discounted = products.filter(p => p.compare_at_price && p.compare_at_price > p.price && p.product_status !== 'draft');
    if (discounted.length > 0) {
      return discounted.slice(0, 4).map((p) => ({
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
  const activeHero = heroSlides[currentHeroSlide];

  const renderFlashSale = () => {
    const isFsEnabled = flashSaleConfig?.enabled ?? true;
    if (!isFsEnabled) return null;

    const title = flashSaleConfig?.title || "Flash Sale";
    const subtitle = flashSaleConfig?.subtitle || "Incredible limited-quantity prices expiring shortly.";
    const offerBadge = flashSaleConfig?.offer_badge || "Ends Today";

    return (
      <section className="mt-32 animate-slide-up" style={{ animationDelay: '0.1s' }} id="section-flash-sale">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div className="space-y-3">
            <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-600 text-[10px] font-extrabold text-white rounded-full tracking-widest uppercase shadow-[0_4px_10px_rgba(225,29,72,0.3)] animate-pulse inline-flex items-center space-x-1.5">
              <Clock className="w-3 h-3" />
              <span>{offerBadge}</span>
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-1.5 bg-slate-900 px-4 py-2.5 rounded-full text-white shadow-xl">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mr-2">Ends In</span>
              <span className="w-7 text-center font-mono font-bold text-base">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="text-rose-500 animate-pulse">:</span>
              <span className="w-7 text-center font-mono font-bold text-base">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="text-rose-500 animate-pulse">:</span>
              <span className="w-7 text-center font-mono font-bold text-base text-rose-400">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            </div>

            <div className="flex space-x-2 hidden sm:flex">
              <button
                onClick={() => scrollContainer(flashSaleRef, 'left')}
                className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollContainer(flashSaleRef, 'right')}
                className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div 
          ref={flashSaleRef}
          className="flex overflow-x-auto gap-6 pb-8 scrollbar-none snap-x snap-mandatory px-2"
        >
          {flashSaleProductsToUse.map((prod) => (
            <div key={prod.id} className="min-w-[300px] sm:min-w-[340px] max-w-[340px] snap-start shrink-0 transform transition-all duration-300">
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
      <section className="mt-32 animate-slide-up" style={{ animationDelay: '0.2s' }} id="section-categories">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-sm text-slate-500 font-medium mt-3">Curated tech architectures tailored for specific use cases.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 auto-rows-[180px]">
          {categoriesToUse.slice(0, 5).map((cat, idx) => {
            const isHero = idx === 0;
            const isWide = idx === 1;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategorySelect(cat.name)}
                className={`group relative overflow-hidden rounded-[2rem] flex flex-col justify-between p-6 sm:p-8 cursor-pointer active:scale-[0.98] transition-all duration-500 ${
                  isHero 
                    ? 'col-span-2 row-span-2 bg-gradient-to-br from-violet-600 to-cyan-500 text-white' 
                    : isWide
                      ? 'col-span-2 row-span-1 bg-slate-900 text-white'
                      : 'col-span-1 row-span-1 bg-slate-100/50 hover:bg-slate-100 text-slate-900'
                }`}
              >
                {isHero && (
                  <>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-[60px] pointer-events-none transform -translate-x-1/2 translate-y-1/2" />
                  </>
                )}

                <div className="flex items-start justify-between relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ${isHero || isWide ? 'bg-white/20 backdrop-blur-md' : 'bg-white shadow-sm'}`}>
                    {cat.icon}
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${
                    isHero || isWide ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-500'
                  }`}>
                    {cat.count} Items
                  </span>
                </div>

                <div className="relative z-10">
                  <h4 className={`font-display font-black tracking-tight ${isHero ? 'text-3xl' : 'text-xl'}`}>
                    {cat.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold uppercase tracking-widest">Browse Vault</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderTodaysDeals = () => {
    return (
      <section className="mt-32 animate-slide-up" style={{ animationDelay: '0.1s' }} id="section-todays-deals">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Today's Deals</h2>
          </div>
          <button
            onClick={() => handleCategorySelect('All')}
            className="hidden sm:flex items-center space-x-2 px-6 py-3 rounded-full border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-100 p-8 sm:p-12 lg:col-span-5 min-h-[460px] group cursor-pointer flex flex-col">
            <div className="absolute top-0 right-0 p-8 w-full flex justify-end z-10">
              <span className="px-4 py-2 bg-rose-500 text-[10px] font-black text-white tracking-widest rounded-full uppercase shadow-[0_4px_15px_rgba(225,29,72,0.3)]">
                Feature Deal
              </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center relative z-0 mt-8 mb-4">
              <img 
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80" 
                alt="Headphones" 
                className="w-full max-h-64 object-contain mix-blend-multiply drop-shadow-2xl group-hover:scale-105 transition-transform duration-700" 
              />
            </div>

            <div className="relative z-10 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
              <h3 className="font-display text-2xl font-black text-slate-900 leading-tight">Pro Studio Wireless ANC</h3>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xl font-mono font-black text-violet-600">₹8,999</span>
                <span className="text-sm text-slate-400 line-through">₹14,999</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
            {dealsToUse.map((deal) => (
              <div
                key={deal.id}
                onClick={() => handleCategorySelect(deal.category)}
                className="group relative bg-white border border-slate-100 rounded-[2rem] p-5 flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.98]"
              >
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-slate-900 text-[9px] font-black text-white rounded-full tracking-widest shadow-sm uppercase">
                    {deal.badge}
                  </span>
                </div>

                <div className="aspect-square w-full rounded-2xl bg-slate-50 flex items-center justify-center p-6 mb-4 overflow-hidden relative transition-colors">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                <div className="flex items-end justify-between gap-2 mt-auto">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 truncate group-hover:text-violet-600 transition-colors">
                      {deal.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      <span className="font-mono font-bold text-slate-800">{deal.price}</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
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
      <section className="mt-32 animate-slide-up" style={{ animationDelay: '0.1s' }} id="section-new-arrivals">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">New Arrivals</h2>
            <p className="text-sm text-slate-500 font-medium mt-3">The latest drops in premium technology.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newArrivalsToUse.map((prod) => (
            <div key={prod.id} className="h-full">
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
      <section className="mt-32 animate-slide-up" id="section-best-sellers">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Best Sellers</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestSellersToUse.map((prod) => (
            <div key={prod.id} className="h-full">
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
      <section className="mt-32 bg-slate-950 rounded-[3rem] p-8 sm:p-12 lg:p-16 animate-slide-up text-white" id="section-trending">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="px-3 py-1 bg-amber-500/20 text-[10px] font-bold text-amber-400 border border-amber-500/30 rounded-full tracking-widest uppercase">
              🔥 Trending
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight">Trending Now</h2>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => scrollContainer(trendingRef, 'left')}
              className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center hover:bg-white hover:text-slate-900 hover:border-white transition-all duration-300 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollContainer(trendingRef, 'right')}
              className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center hover:bg-white hover:text-slate-900 hover:border-white transition-all duration-300 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={trendingRef}
          className="flex overflow-x-auto gap-6 pb-6 scrollbar-none snap-x snap-mandatory"
        >
          {trendingToUse.map((prod) => {
            const weeklySales = (prod.name.length * 11) % 40 + 65;
            return (
              <div key={prod.id} className="min-w-[300px] sm:min-w-[340px] max-w-[340px] snap-start shrink-0 relative">
                <div className="absolute top-4 left-4 z-20 flex items-center space-x-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-[9px] text-white font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-none uppercase tracking-wider">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{weeklySales} Bought This Week</span>
                </div>
                <div className="h-full rounded-[2rem] bg-slate-900 p-2 border border-slate-800">
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
      <section className="mt-32 relative rounded-[3rem] overflow-hidden animate-slide-up bg-gradient-to-br from-violet-600 to-cyan-500" id="section-promo-banner">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path fill="white" d="M0,100 C30,70 70,30 100,0 L100,100 Z" />
          </svg>
        </div>

        <div className="relative p-12 sm:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12 z-10">
          
          <div className="flex-1 max-w-xl space-y-6">
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-xs font-bold text-white tracking-widest rounded-full uppercase border border-white/30 inline-block shadow-lg">
              Limited Time Offer
            </span>
            
            <div className="space-y-2">
              <h2 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-[0.95]">
                {bannerTitle}
              </h2>
              <p className="font-display text-xl sm:text-2xl font-bold text-cyan-100">
                {bannerSubtitle}
              </p>
            </div>

            <p className="text-sm text-white/80 font-medium leading-relaxed max-w-md">
              {bannerDesc}
            </p>

            <div className="pt-4">
              <button
                onClick={() => handleCategorySelect('All')}
                className="bg-white text-violet-900 active:scale-95 transition-all duration-300 font-black text-sm py-4 px-10 rounded-full flex items-center space-x-3 shadow-xl hover:shadow-2xl cursor-pointer"
              >
                <span>{bannerButtonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end relative">
            <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative animate-float-medium">
              <img 
                src={bannerImgSrc} 
                alt="Promo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain filter drop-shadow-2xl" 
              />
            </div>
          </div>

        </div>
      </section>
    );
  };

  const renderPopularBrands = () => {
    return (
      <section className="mt-32 animate-slide-up" id="section-popular-brands">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-black text-slate-900 tracking-tight">Partner Brands</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {brandsToUse.map((b) => (
            <div
              key={b.name}
              onClick={() => handleCategorySelect('All')}
              className="group bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 active:scale-95 cursor-pointer h-32"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-3">
                <img src={b.logo} alt={b.name} referrerPolicy="no-referrer" className="w-full h-full object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
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
      <section className="mt-32 animate-slide-up" id="section-recommended">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">For You</h2>
            <p className="text-sm text-slate-500 font-medium mt-3">Personalized curations based on your taste.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {recommendedToUse.map((prod) => (
            <div key={prod.id} className="h-full">
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
      <section className="mt-32 animate-slide-up" id="section-recently-viewed">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Recently Viewed</h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => scrollContainer(recentlyViewedRef, 'left')}
              className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 active:scale-95 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollContainer(recentlyViewedRef, 'right')}
              className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 active:scale-95 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={recentlyViewedRef}
          className="flex overflow-x-auto gap-6 pb-6 scrollbar-none snap-x snap-mandatory px-2"
        >
          {recentlyViewedToUse.map((prod) => (
            <div key={prod.id} className="min-w-[300px] sm:min-w-[340px] max-w-[340px] snap-start shrink-0 transform transition-all duration-300">
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
      <section className="mt-32 bg-slate-50 rounded-[3rem] p-8 sm:p-16 animate-slide-up" id="section-why-shop">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display text-4xl font-black text-slate-900 tracking-tight">The OGhaitong Promise</h2>
          <p className="text-base text-slate-500 font-medium mt-4">Uncompromising quality and pristine customer satisfaction from checkout to delivery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresList.map((f, i) => (
            <div
              key={i}
              className="text-center group"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                {f.icon}
              </div>
              <h4 className="font-display font-black text-xl text-slate-900 mb-3">
                {f.title}
              </h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
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
      <section className="mt-32 animate-slide-up" id="section-reviews">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Real Feedback</h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => scrollContainer(reviewsRef, 'left')}
              className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollContainer(reviewsRef, 'right')}
              className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={reviewsRef}
          className="flex overflow-x-auto gap-6 pb-8 scrollbar-none snap-x snap-mandatory px-2"
        >
          {reviewsToUse.map((rev) => (
            <div 
              key={rev.id} 
              className="min-w-[320px] sm:min-w-[420px] max-w-[420px] snap-start shrink-0 bg-white border border-slate-100 rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1 text-slate-900">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="flex items-center space-x-1 text-[10px] text-slate-900 bg-slate-100 font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  "{rev.text}"
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-8">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                  <img src={rev.avatar} alt={rev.name} referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale" />
                </div>
                <div>
                  <h5 className="text-sm font-black text-slate-900">{rev.name}</h5>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{rev.date}</p>
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
      <section className="mt-32 mb-16 relative animate-slide-up" id="section-newsletter">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-[3rem] overflow-hidden bg-slate-900 p-10 sm:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight">Stay in the Loop</h2>
              <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
                Get exclusive offers, new arrivals, and tech insights delivered directly to your inbox.
              </p>
            </div>

            <div className="flex-1 w-full max-w-md">
              {subscribed ? (
                <div className="py-4 bg-white/10 border border-white/20 text-white text-sm font-bold px-6 rounded-2xl flex items-center justify-center space-x-2 animate-fade-in backdrop-blur-md">
                  <CheckCircle className="w-5 h-5" />
                  <span>Welcome to the club.</span>
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
                  className="flex flex-col space-y-3"
                >
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-6 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none text-white placeholder-slate-500 transition-all backdrop-blur-md"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-slate-200 text-slate-900 font-black text-sm py-4 rounded-full active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Subscribe Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-slate-500 font-medium text-center mt-2">
                    You can unsubscribe at any time.
                  </p>
                </form>
              )}
            </div>
            
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
    <div className="py-8 animate-fade-in overflow-hidden max-w-[1400px] mx-auto relative">
      
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
      <div className="relative mb-12 rounded-[2.5rem] overflow-hidden bg-slate-950 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] min-h-[550px] border border-white/10 group">
        
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

      {/* GLOBAL CHATBOT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat Window */}
        {isChatOpen && (
          <div className="mb-4 w-80 sm:w-96 bg-slate-950 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-slide-up origin-bottom-right">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-cyan-500 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-white" />
                <span className="font-bold text-white text-sm">Support</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <Plus className="w-5 h-5 transform rotate-45" />
              </button>
            </div>

            {/* Message Area */}
            <div className="h-80 p-4 overflow-y-auto bg-slate-900/50 flex flex-col space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-cyan-500 text-slate-950 self-end rounded-tr-sm' : 'bg-slate-800 text-slate-200 self-start border border-slate-700 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              ))}
              {isBotTyping && (
                <div className="bg-slate-800 text-slate-400 self-start border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-2 text-xs flex space-x-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-white/10 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-slate-900 border border-slate-800 text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-500"
              />
              <button type="submit" disabled={isBotTyping || !chatInput.trim()} className="w-9 h-9 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0">
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_10px_25px_rgba(34,211,238,0.4)] hover:shadow-[0_15px_35px_rgba(139,92,246,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        >
          {isChatOpen ? <Plus className="w-6 h-6 transform rotate-45" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );
}
