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
    <div className="group relative bg-white border border-neutral-200 flex flex-col justify-between transition-all duration-300 hover:border-neutral-900 h-full font-sans">
      
      {/* Upper Section */}
      <div className="relative">
        
        {/* Badges Overlay */}
        <div className="absolute top-0 left-0 z-20 flex flex-col">
          {discountPercentage > 0 && (
            <span className="px-3 py-1.5 bg-black text-[9px] font-bold text-white uppercase tracking-widest">
              {discountPercentage}% Off
            </span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="px-3 py-1.5 bg-neutral-200 text-[9px] font-bold text-neutral-900 uppercase tracking-widest border-b border-r border-neutral-200">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-3 py-1.5 bg-neutral-100 text-[9px] font-bold text-neutral-500 uppercase tracking-widest border-b border-r border-neutral-200">
              Sold Out
            </span>
          )}
        </div>

        {/* Action Icons (Wishlist) */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className={`w-8 h-8 flex items-center justify-center transition-colors border ${
              isWishlisted
                ? 'bg-black border-black text-white'
                : 'bg-white border-neutral-200 text-neutral-400 hover:text-black hover:border-black'
            } cursor-pointer`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Product Image Stage */}
        <div 
          onClick={() => onQuickView(product.id)}
          className="relative aspect-square w-full overflow-hidden bg-neutral-50 flex items-center justify-center p-6 cursor-pointer mb-5"
        >
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 mix-blend-multiply"
          />

          {/* Quick View Button overlay */}
          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[1px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product.id);
              }}
              className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Product Metadata */}
        <div className="px-5 space-y-2">
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em] leading-none">
            {getBrand(product)}
          </p>
          <h4
            onClick={() => onQuickView(product.id)}
            className="font-display font-bold text-sm text-neutral-900 group-hover:text-neutral-500 transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {product.name}
          </h4>

          {/* Minimalist Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex text-black">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[10px] font-bold text-neutral-900 font-mono">
              {rating} <span className="text-neutral-400 font-sans font-normal">({reviewsCount})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing and Action row */}
      <div className="mt-5 flex items-stretch border-t border-neutral-200 h-12">
        
        {/* Price Block */}
        <div className="flex-1 px-5 flex flex-col justify-center border-r border-neutral-200 bg-neutral-50">
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-black text-neutral-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compare_at_price && (
              <span className="text-[10px] text-neutral-400 line-through">
                ₹{product.compare_at_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        {product.stock === 0 ? (
          <div className="w-16 flex items-center justify-center bg-neutral-100 text-neutral-400 cursor-not-allowed">
            <span className="text-[9px] font-bold uppercase tracking-widest">Out</span>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            className={`w-16 flex items-center justify-center transition-colors ${
              inCartQty > 0
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            } cursor-pointer group/add`}
            title={inCartQty > 0 ? `In Cart (${inCartQty})` : 'Add to Cart'}
          >
            {inCartQty > 0 ? (
              <Check className="w-5 h-5 stroke-[2]" />
            ) : (
              <Plus className="w-5 h-5 stroke-[2] group-hover/add:scale-110 transition-transform" />
            )}
          </button>
        )}
      </div>
      
    </div>
  );
}
