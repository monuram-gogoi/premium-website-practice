import React, { useState } from 'react';
import { Heart, Star, Eye, GitCompare, Plus, Check } from 'lucide-react';
import { Product } from '../types';

interface PremiumProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (productId: string) => void;
  inCartQty?: number;
}

export default function PremiumProductCard({
  product,
  onAddToCart,
  onQuickView,
  inCartQty = 0
}: PremiumProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const discountPercentage = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  // Generate deterministic premium brand name
  const getBrand = (prod: Product) => {
    if (prod.name.toLowerCase().includes('apple') || prod.name.toLowerCase().includes('iphone') || prod.name.toLowerCase().includes('macbook') || prod.name.toLowerCase().includes('ipad')) return 'Apple';
    if (prod.name.toLowerCase().includes('sony')) return 'Sony';
    if (prod.name.toLowerCase().includes('jbl')) return 'JBL';
    if (prod.name.toLowerCase().includes('samsung') || prod.name.toLowerCase().includes('galaxy')) return 'Samsung';
    if (prod.name.toLowerCase().includes('logitech')) return 'Logitech';
    if (prod.name.toLowerCase().includes('dell')) return 'Dell';
    if (prod.name.toLowerCase().includes('lenovo')) return 'Lenovo';
    if (prod.name.toLowerCase().includes('boat')) return 'boAt';
    
    // Otherwise, associate with the main category or premium
    return 'OGhaitong Signature';
  };

  // Generate deterministic rating & reviews
  const rating = parseFloat(((product.name.length % 5) * 0.2 + 4.2).toFixed(1));
  const reviewsCount = (product.name.length * 13) % 240 + 15;

  return (
    <div className="group relative bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-[24px] p-4 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_20px_50px_rgba(15,23,42,0.06)] hover:-translate-y-1.5 h-full">
      {/* Upper Section */}
      <div className="relative">
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5">
          {discountPercentage > 0 && (
            <span className="px-2.5 py-1 bg-rose-600 text-[10px] font-bold text-white rounded-full tracking-wider shadow-sm animate-pulse">
              {discountPercentage}% OFF
            </span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="px-2.5 py-1 bg-amber-500 text-[10px] font-bold text-white rounded-full tracking-wider shadow-sm">
              Only {product.stock} Left
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2.5 py-1 bg-slate-500 text-[10px] font-bold text-white rounded-full tracking-wider shadow-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Action icons row (Wishlist & Compare) */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border ${
              isWishlisted
                ? 'bg-rose-50 border-rose-100 text-rose-500'
                : 'bg-white/80 backdrop-blur-xs border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
            } cursor-pointer`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsComparing(!isComparing);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border ${
              isComparing
                ? 'bg-indigo-50 border-indigo-100 text-indigo-600 font-bold'
                : 'bg-white/80 backdrop-blur-xs border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
            } cursor-pointer`}
            title={isComparing ? 'Comparing Product' : 'Compare Product'}
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>

        {/* Product Image Stage with smooth zoom hover */}
        <div 
          onClick={() => onQuickView(product.id)}
          className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-4 cursor-pointer mb-4 group-hover:bg-slate-100/50 transition-colors"
        >
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Quick View Interactive overlay (Desktop only) */}
          <div className="absolute inset-0 bg-slate-950/5 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product.id);
              }}
              className="px-4 py-2 bg-white hover:bg-slate-950 hover:text-white text-slate-800 text-xs font-semibold rounded-full shadow-lg border border-slate-200/50 flex items-center space-x-1.5 transition-all transform translate-y-3 group-hover:translate-y-0 duration-300 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Product Metadata */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            {getBrand(product)}
          </p>
          <h4
            onClick={() => onQuickView(product.id)}
            className="font-display font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h4>

          {/* Rating */}
          <div className="flex items-center space-x-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating) ? 'fill-current' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              {rating} ({reviewsCount})
            </span>
          </div>
        </div>
      </div>

      {/* Pricing and Action row */}
      <div className="pt-3 mt-3 border-t border-slate-100/60 flex items-center justify-between">
        <div className="flex flex-col">
          {product.compare_at_price && (
            <span className="text-[10px] sm:text-xs text-slate-400 line-through">
              ₹{product.compare_at_price.toLocaleString('en-IN')}
            </span>
          )}
          <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>

        {product.stock === 0 ? (
          <button
            disabled
            className="p-2.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed"
          >
            Sold Out
          </button>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              inCartQty > 0
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-md shadow-slate-900/10'
            } hover:scale-105 active:scale-95 cursor-pointer`}
            title={inCartQty > 0 ? `In Cart (${inCartQty})` : 'Add to Cart'}
          >
            {inCartQty > 0 ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
          </button>
        )}
      </div>
    </div>
  );
}
