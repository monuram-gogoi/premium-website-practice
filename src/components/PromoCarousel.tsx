import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface PromoSlide {
  id: number;
  eyebrow: string;
  title: string;
  tagline: string;
  image: string;
  ctaText: string;
  category: string;
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
      // Fallback assets
      if (slide.id === 1) return '/images/promo_watch.png';
      if (slide.id === 2) return '/images/promo_headphones.png';
      if (slide.id === 3) return '/images/promo_bag.png';
    }
    return slide.image;
  };

  // Simplified data structure - no more color props needed
  const slides: PromoSlide[] = [
    {
      id: 1,
      eyebrow: "Limited Time Offer • Up to 50% Off",
      title: "Precision Engineering",
      tagline: "Surgical-grade chronographs starting at ₹14,999.",
      image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1000&auto=format&fit=crop&q=80",
      ctaText: "Shop Watches",
      category: "Watches",
    },
    {
      id: 2,
      eyebrow: "Summer Sale • Up to 40% Off",
      title: "Studio Quality Audio",
      tagline: "Acoustically engineered AeroGlide ANC from ₹8,999.",
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&auto=format&fit=crop&q=80",
      ctaText: "Shop Audio",
      category: "Audio",
    },
    {
      id: 3,
      eyebrow: "Mega Deals • Up to 30% Off",
      title: "Built for the Journey",
      tagline: "Weatherproof travel packs starting at ₹4,999.",
      image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1000&auto=format&fit=crop&q=80",
      ctaText: "Shop Bags",
      category: "Bags",
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

  useEffect(() => {
    if (!isHovered) {
      timerRef.current = setInterval(() => {
        handleNext();
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered]);

  const activeSlide = slides[currentSlide];

  return (
    <div
      id="promo-banner-carousel"
      className="relative w-full h-[600px] lg:h-[700px] bg-gradient-to-br from-slate-50 via-violet-50/40 to-cyan-50/30 overflow-hidden group font-sans border-b border-violet-100/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient Cyber Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Smooth editorial fade
          className="absolute inset-0 w-full h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 lg:px-24"
        >
          
          {/* Left Text Content */}
          <div className="z-20 max-w-xl text-center lg:text-left mt-12 lg:mt-0">
            <div className="mb-6 inline-block">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-violet-600 uppercase bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-violet-100 shadow-sm inline-flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span>{activeSlide.eyebrow}</span>
              </span>
            </div>
            
            <h2 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-950 via-slate-800 to-cyan-900 tracking-tighter uppercase leading-[0.9] mb-6 drop-shadow-sm">
              {activeSlide.title}
            </h2>
            
            <p className="text-sm sm:text-base text-slate-600 font-medium mb-8 max-w-sm mx-auto lg:mx-0 leading-relaxed">
              {activeSlide.tagline}
            </p>
            
            <button
              onClick={(e) => handleCtaClick(activeSlide.category, e)}
              className="group/btn inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 cursor-pointer active:scale-95 shadow-[0_10px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_40px_rgba(34,211,238,0.4)]"
            >
              <span>{activeSlide.ctaText}</span>
              <ArrowRight className="w-4 h-4 ml-3 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
            </button>
          </div>

          {/* Right Image */}
          <div className="absolute lg:relative inset-0 lg:inset-auto z-10 w-full h-full lg:w-1/2 flex items-center justify-center opacity-30 lg:opacity-100 pointer-events-none">
            <img
              src={getSlideImage(activeSlide)}
              onError={() => setImageFailures(prev => ({ ...prev, [activeSlide.id]: true }))}
              alt={activeSlide.title}
              className="w-[150%] lg:w-full h-full object-cover lg:object-contain mix-blend-multiply drop-shadow-[0_20px_40px_rgba(124,58,237,0.15)] transform transition-transform duration-[2s] group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

        </motion.div>
      </AnimatePresence>

      {/* Minimalist Controls */}
      <div className="absolute bottom-8 left-6 lg:left-24 z-30 flex items-center space-x-6">
        
        {/* Navigation Arrows */}
        <div className="flex space-x-3 hidden sm:flex">
          <button
            onClick={handlePrev}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-md border border-violet-100 text-violet-500 hover:text-cyan-600 hover:border-cyan-300 hover:bg-cyan-50 shadow-sm hover:shadow-[0_4px_15px_rgba(34,211,238,0.2)] transition-all duration-300 cursor-pointer active:scale-95"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-md border border-violet-100 text-violet-500 hover:text-cyan-600 hover:border-cyan-300 hover:bg-cyan-50 shadow-sm hover:shadow-[0_4px_15px_rgba(34,211,238,0.2)] transition-all duration-300 cursor-pointer active:scale-95"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Minimalist Progress Indicators */}
        <div className="flex items-center space-x-3">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={(e) => selectSlide(index, e)}
              className="py-2 cursor-pointer group/dot active:scale-95 transition-transform"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className={`h-[3px] rounded-full transition-all duration-500 ease-out ${
                index === currentSlide 
                  ? 'w-14 bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_10px_rgba(124,58,237,0.4)]' 
                  : 'w-6 bg-violet-200 group-hover/dot:bg-violet-400 group-hover/dot:w-10'
              }`} />
            </button>
          ))}
        </div>
        
      </div>
    </div>
  );
}
