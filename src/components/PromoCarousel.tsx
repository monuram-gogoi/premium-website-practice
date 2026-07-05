import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Flame, Percent } from 'lucide-react';

interface PromoSlide {
  id: number;
  badgeText: string;
  badgeIcon: React.ReactNode;
  badgeColor: string;
  title: string;
  subtitle: string;
  tagline: string;
  gradientClass: string;
  image: string;
  ctaText: string;
  category: string;
  highlightColor: string;
}

interface PromoCarouselProps {
  onCategorySelect: (category: string) => void;
}

export default function PromoCarousel({ onCategorySelect }: PromoCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageFailures, setImageFailures] = useState<Record<number, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getSlideImage = (slide: PromoSlide) => {
    if (imageFailures[slide.id]) {
      return slide.image;
    }
    if (slide.id === 1) return '/images/promo_watch.png';
    if (slide.id === 2) return '/images/promo_headphones.png';
    if (slide.id === 3) return '/images/promo_bag.png';
    return slide.image;
  };

  const slides: PromoSlide[] = [
    {
      id: 1,
      badgeText: "UP TO 50% OFF",
      badgeIcon: <Percent className="w-3.5 h-3.5" />,
      badgeColor: "bg-amber-500/15 border border-amber-500/30 text-amber-300",
      title: "Luxury Watches",
      subtitle: "Limited Time Offer",
      tagline: "Surgical-grade chronographs starting at ₹14,999",
      gradientClass: "from-slate-950 via-slate-900 to-amber-950/50",
      image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1000&auto=format&fit=crop&q=80",
      ctaText: "Explore Watches",
      category: "Watches",
      highlightColor: "shadow-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/10",
    },
    {
      id: 2,
      badgeText: "SUMMER SALE",
      badgeIcon: <Flame className="w-3.5 h-3.5" />,
      badgeColor: "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300",
      title: "Up to 40% OFF on Audio Products",
      subtitle: "Premium Headphones",
      tagline: "Acoustically engineered AeroGlide ANC from ₹8,999",
      gradientClass: "from-slate-950 via-slate-900 to-indigo-950/50",
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&auto=format&fit=crop&q=80",
      ctaText: "Explore Audio",
      category: "Audio",
      highlightColor: "shadow-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10",
    },
    {
      id: 3,
      badgeText: "MEGA DEALS",
      badgeIcon: <Sparkles className="w-3.5 h-3.5" />,
      badgeColor: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300",
      title: "Up to 30% OFF on Bags & Accessories",
      subtitle: "Limited Stock",
      tagline: "Weatherproof travel packs starting at ₹4,999",
      gradientClass: "from-slate-950 via-slate-900 to-emerald-950/50",
      image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1000&auto=format&fit=crop&q=80",
      ctaText: "Explore Bags",
      category: "Bags",
      highlightColor: "shadow-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10",
    },
  ];

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const selectSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide(index);
  };

  const handleCtaClick = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCategorySelect(category);
    const catalogElement = document.getElementById('catalog-section');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Setup auto-sliding
  useEffect(() => {
    if (!isHovered) {
      timerRef.current = setInterval(() => {
        handleNext();
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHovered]);

  const activeSlide = slides[currentSlide];

  return (
    <div
      id="promo-banner-carousel"
      className="absolute inset-0 w-full h-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background slide containing beautiful layouts */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={`absolute inset-0 w-full h-full bg-gradient-to-r ${activeSlide.gradientClass} flex items-center justify-between overflow-hidden`}
        >
          {/* Subtle Ambient Radial Lighting Glow */}
          <div className="absolute inset-0 bg-radial-gradient opacity-30"></div>
          <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"></div>
          <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-pink-500/5 blur-3xl"></div>

          {/* Left Side: Dynamic Floating Promotional Content Card */}
          <div className="absolute left-6 xl:left-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-start space-y-4 max-w-sm p-6 bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-20">
            <div className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider flex items-center space-x-1 ${activeSlide.badgeColor}`}>
              {activeSlide.badgeIcon}
              <span>{activeSlide.badgeText}</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-xl font-extrabold text-white tracking-tight">
                {activeSlide.title}
              </h3>
              <p className="text-xs text-indigo-200 font-mono tracking-wider uppercase">
                {activeSlide.subtitle}
              </p>
            </div>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {activeSlide.tagline}
            </p>
            <button
              onClick={(e) => handleCtaClick(activeSlide.category, e)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center space-x-1 cursor-pointer shadow-lg transition-all ${activeSlide.highlightColor}`}
            >
              <span>{activeSlide.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Side: High-Quality Product Image with custom dark lighting ambient glow */}
          <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 w-44 h-44 sm:w-64 sm:h-64 md:w-80 md:h-80 z-10 select-none pointer-events-none opacity-20 md:opacity-90">
            {/* Ambient Lighting Background Circle Behind the Image */}
            <div className="absolute inset-0 rounded-full bg-slate-900/50 scale-105 filter blur-md"></div>
            <img
              src={getSlideImage(activeSlide)}
              onError={() => {
                setImageFailures(prev => ({ ...prev, [activeSlide.id]: true }));
              }}
              alt={activeSlide.title}
              className="w-full h-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] transition-transform duration-[1000ms] group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Mobile/Tablet Inline Header Overlay Banner (Optional background info tag) */}
          <div className="absolute left-6 right-6 top-4 lg:hidden flex justify-between items-center z-20">
            <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider flex items-center space-x-1 ${activeSlide.badgeColor}`}>
              {activeSlide.badgeIcon}
              <span>{activeSlide.badgeText} • {activeSlide.subtitle}</span>
            </div>
            <button
              onClick={(e) => handleCtaClick(activeSlide.category, e)}
              className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 flex items-center space-x-1"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Manual Left Arrow Control */}
      <button
        onClick={handlePrev}
        id="carousel-prev"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/40 hover:bg-indigo-600/60 border border-white/5 text-white/75 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-30 cursor-pointer"
        title="Previous Offer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Manual Right Arrow Control */}
      <button
        onClick={handleNext}
        id="carousel-next"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/40 hover:bg-indigo-600/60 border border-white/5 text-white/75 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-30 cursor-pointer"
        title="Next Offer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Slide Dot Indicators at the bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-30">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            id={`carousel-dot-${index}`}
            onClick={(e) => selectSlide(index, e)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentSlide ? 'w-6 bg-indigo-500' : 'w-1.5 bg-white/30 hover:bg-white/50'
            }`}
            title={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
