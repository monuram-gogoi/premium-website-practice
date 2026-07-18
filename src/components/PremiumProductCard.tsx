import React, { useState } from 'react';
import { Heart, Star, Eye, Plus, Check } from 'lucide-react';
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

  const discountPercentage = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const getBrand = (prod: Product) => {
    if (prod.name.toLowerCase().includes('apple') || prod.name.toLowerCase().includes('iphone') || prod.name.toLowerCase().includes('macbook') || prod.name.toLowerCase().includes('ipad')) return 'Apple';
    if (prod.name.toLowerCase().includes('sony')) return 'Sony';
    if (prod.name.toLowerCase().includes('jbl')) return 'JBL';
    if (prod.name.toLowerCase().includes('samsung') || prod.name.toLowerCase().includes('galaxy')) return 'Samsung';
    if (prod.name.toLowerCase().includes('logitech')) return 'Logitech';
    if (prod.name.toLowerCase().includes('dell')) return 'Dell';
    if (prod.name.toLowerCase().includes('lenovo')) return 'Lenovo';
    if (prod.name.toLowerCase().includes('boat')) return 'boAt';
    return 'OGhaitong Signature';
  };

  const rating = parseFloat(((product.name.length % 5) * 0.2 + 4.2).toFixed(1));
  const reviewsCount = (product.name.length * 13) % 240 + 15;

  return (
    <div className="group relative bg-white rounded-2xl border border-violet-100/60 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_15px_35px_rgba(124,58,237,0.08)] overflow-hidden h-full font-sans">
      
      {/* Upper Section */}
      <div className="relative">
        
        {/* Badges Overlay */}
        <div className="absolute top-0 left-0 z-20 flex flex-col">
          {discountPercentage > 0 && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-[9px] font-bold text-white uppercase tracking-widest rounded-br-lg shadow-sm">
              {discountPercentage}% Off
            </span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="px-3 py-1.5 bg-amber-100 text-[9px] font-bold text-amber-700 uppercase tracking-widest rounded-br-lg border-b border-r border-amber-200">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-3 py-1.5 bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest rounded-br-lg border-b border-r border-slate-200">
              Sold Out
            </span>
          )}
        </div>

        {/* Action Icons (Wishlist) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm border ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-500'
                : 'bg-white/90 backdrop-blur-sm border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
            } cursor-pointer`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 transition-transform ${isWishlisted ? 'fill-current scale-110' : 'scale-100'}`} />
          </button>
        </div>

        {/* Product Image Stage */}
        <div 
          onClick={() => onQuickView(product.id)}
          className="relative aspect-square w-full overflow-hidden bg-slate-50/50 group-hover:bg-violet-50/30 transition-colors duration-500 flex items-center justify-center p-6 cursor-pointer mb-5"
        >
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Quick View Button overlay */}
          <div className="absolute inset-0 bg-violet-900/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product.id);
              }}
              className="px-5 py-2.5 bg-white/95 backdrop-blur-md border border-white text-slate-800 text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex items-center space-x-2 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 hover:bg-violet-600 hover:text-white hover:border-violet-600 cursor-pointer active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Product Metadata */}
        <div className="px-5 space-y-2">
          <p className="text-[9px] font-bold text-violet-500 uppercase tracking-[0.2em] leading-none">
            {getBrand(product)}
          </p>
          <h4
            onClick={() => onQuickView(product.id)}
            className="font-display font-bold text-sm text-slate-900 group-hover:text-violet-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {product.name}
          </h4>

          {/* Minimalist Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex text-amber-400">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 font-mono">
              {rating} <span className="text-slate-400 font-sans font-medium">({reviewsCount})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing and Action row */}
      <div className="mt-5 flex items-stretch border-t border-violet-100/60 h-12">
        
        {/* Price Block */}
        <div className="flex-1 px-5 flex flex-col justify-center border-r border-violet-100/60 bg-slate-50/30 group-hover:bg-violet-50/20 transition-colors duration-300">
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 font-mono">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compare_at_price && (
              <span className="text-[10px] text-slate-400 line-through font-medium">
                ₹{product.compare_at_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        {product.stock === 0 ? (
          <div className="w-16 flex items-center justify-center bg-slate-100 text-slate-400 cursor-not-allowed">
            <span className="text-[9px] font-bold uppercase tracking-widest">Out</span>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            className={`w-16 flex items-center justify-center transition-all duration-300 ${
              inCartQty > 0
                ? 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                : 'bg-slate-900 text-white hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500'
            } cursor-pointer group/add active:bg-violet-200`}
            title={inCartQty > 0 ? `In Cart (${inCartQty})` : 'Add to Cart'}
          >
            {inCartQty > 0 ? (
              <Check className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Plus className="w-5 h-5 stroke-[2.5] group-hover/add:scale-110 transition-transform" />
            )}
          </button>
        )}
      </div>
      
    </div>
  );
}
