import { useState, useEffect } from 'react';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Percent, Info, Truck } from 'lucide-react';
import { CartItem, Coupon, ShippingRule, Tax } from '../types';
import { dbService } from '../services/db';

interface CartProps {
  cart: CartItem[];
  onUpdateCartQty: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  setCurrentView: (view: { page: string; productId?: string }) => void;
  onProceedToCheckout: (calcSummary: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    couponCode: string;
  }) => void;
}

export default function Cart({
  cart,
  onUpdateCartQty,
  onRemoveFromCart,
  setCurrentView,
  onProceedToCheckout
}: CartProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [selectedShippingId, setSelectedShippingId] = useState('');
  const [selectedTaxId, setSelectedTaxId] = useState('');

  useEffect(() => {
    async function loadConfig() {
      try {
        const c = await dbService.getCoupons();
        const s = await dbService.getShippingRules();
        const t = await dbService.getTaxes();

        setCoupons(c);
        setShippingRules(s);
        setTaxes(t);

        // Select default rule
        if (s.length > 0) setSelectedShippingId(s[0].id);
        if (t.length > 0) setSelectedTaxId(t[0].id);
      } catch (err) {
        console.error('Error loading cart configuration:', err);
      }
    }
    loadConfig();
  }, []);

  // calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // Active Shipping calculation
  const activeShipping = shippingRules.find(r => r.id === selectedShippingId);
  const shippingAmount = activeShipping
    ? (subtotal >= activeShipping.free_delivery_threshold ? 0 : activeShipping.rate)
    : 0;

  // Active Tax rate calculation
  const activeTax = taxes.find(t => t.id === selectedTaxId);
  const taxRate = activeTax ? activeTax.rate : 18; // 18% standard GST default fallback
  const taxAmount = Math.round(subtotal * (taxRate / 100));

  // Active Coupon Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = Math.round(subtotal * (appliedCoupon.discount_value / 100));
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
    // Cannot exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const finalTotal = Math.max(0, subtotal + taxAmount + shippingAmount - discountAmount);

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');

    if (!couponInput.trim()) return;

    const coupon = coupons.find(c => c.code.toUpperCase() === couponInput.toUpperCase());

    if (!coupon) {
      setCouponError('Invalid coupon code.');
      setAppliedCoupon(null);
      return;
    }

    // Min purchase constraint
    if (subtotal < coupon.min_purchase) {
      setCouponError(`Minimum purchase of ₹${coupon.min_purchase.toLocaleString('en-IN')} required.`);
      setAppliedCoupon(null);
      return;
    }

    // Expiry constraint
    if (new Date(coupon.expiry_date) < new Date()) {
      setCouponError('This coupon code has expired.');
      setAppliedCoupon(null);
      return;
    }

    // Limit constraint
    if (coupon.usage_count >= coupon.usage_limit) {
      setCouponError('This coupon usage limit has been reached.');
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponSuccess(`Coupon code applied! You saved ₹${coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value.toLocaleString('en-IN')}`}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleProceed = () => {
    onProceedToCheckout({
      subtotal,
      tax: taxAmount,
      shipping: shippingAmount,
      discount: discountAmount,
      total: finalTotal,
      couponCode: appliedCoupon ? appliedCoupon.code : ''
    });
  };

  if (cart.length === 0) {
    return (
      <div className="py-16 text-center animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <ShoppingBag className="w-10 h-10 text-violet-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight font-display">Your Cart is Empty</h3>
        <p className="text-slate-500 text-sm mt-2 font-medium">Add items to configure shipping, taxes, and coupons.</p>
        <button
          onClick={() => setCurrentView({ page: 'store' })}
          className="mt-8 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-sm font-bold rounded-xl shadow-[0_10px_25px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_35px_rgba(34,211,238,0.4)] transition-all duration-300 active:scale-95 inline-flex items-center space-x-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Products</span>
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h1 className="font-display text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight mb-8">
        Your Shopping Bag
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const isStockLow = item.product.stock <= 5;
            return (
              <div
                key={item.product.id}
                className="bg-white/80 backdrop-blur-md border border-violet-100/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:justify-between gap-5 shadow-[0_4px_20px_rgba(124,58,237,0.03)] hover:shadow-[0_10px_25px_rgba(124,58,237,0.08)] hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 group"
              >
                {/* Product details block */}
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-violet-100/50 group-hover:bg-violet-50/50 transition-colors">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <h3 
                      onClick={() => setCurrentView({ page: 'detail', productId: item.product.id })}
                      className="font-display font-bold text-sm sm:text-base text-slate-900 hover:text-violet-600 transition-colors cursor-pointer"
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-[10px] text-violet-500/80 mt-1 uppercase tracking-wider font-mono font-bold bg-violet-50 inline-block px-2 py-0.5 rounded-md border border-violet-100/50">
                      {item.product.category}
                    </p>
                    
                    {/* Low stock notice in cart */}
                    {isStockLow && (
                      <span className="block mt-1.5 text-[10px] font-bold text-rose-500">
                        Only {item.product.stock} left in stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing & quantity controls block */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-violet-50/50">
                  
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-violet-100 rounded-xl bg-white shadow-sm p-1">
                    <button
                      onClick={() => onUpdateCartQty(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg font-bold text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors active:scale-95"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800 font-mono">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg font-bold text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block sm:hidden font-medium">Total price:</span>
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 font-mono">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromCart(item.product.id)}
                    className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all cursor-pointer active:scale-95 shadow-sm hover:shadow-md"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            );
          })}

          {/* Continue Shopping button */}
          <button
            onClick={() => setCurrentView({ page: 'store' })}
            className="flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-violet-600 transition-all duration-300 mt-8 cursor-pointer group active:scale-95 w-fit"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-violet-200 group-hover:bg-violet-50 shadow-sm transition-all">
              <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            </div>
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Right Column: Order Calculation Summary Panel */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-md border border-violet-100/60 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(124,58,237,0.05)] space-y-6 sticky top-24">
          <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight pb-4 border-b border-violet-100/50">
            Order Calculation
          </h2>

          {/* WooCommerce Shipping Selection */}
          {shippingRules.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-violet-500 uppercase tracking-widest block">Shipping Mode</label>
              <div className="grid grid-cols-1 gap-2.5">
                {shippingRules.map(rule => {
                  const isFree = subtotal >= rule.free_delivery_threshold;
                  return (
                    <label
                      key={rule.id}
                      className={`flex items-start justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                        selectedShippingId === rule.id
                          ? 'border-violet-400 bg-violet-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-violet-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="shipping_rule"
                          checked={selectedShippingId === rule.id}
                          onChange={() => setSelectedShippingId(rule.id)}
                          className="mt-0.5 w-3.5 h-3.5 text-violet-600 border-slate-300 focus:ring-violet-500 transition-colors"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{rule.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">Min. threshold for Free: ₹{rule.free_delivery_threshold.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-700">
                        {isFree ? 'FREE' : `₹${rule.rate.toLocaleString('en-IN')}`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* WooCommerce Taxes (GST) */}
          {taxes.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-violet-500 uppercase tracking-widest block">Tax Structure (GST)</label>
              <select
                value={selectedTaxId}
                onChange={(e) => setSelectedTaxId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-sm cursor-pointer"
              >
                {taxes.map(tax => (
                  <option key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</option>
                ))}
              </select>
            </div>
          )}

          {/* Coupon Code Panel */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-violet-500 uppercase tracking-widest block">Apply Promotional Coupon</label>
            {!appliedCoupon ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="e.g. WELCOME10"
                  className="flex-1 px-4 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner uppercase placeholder:normal-case placeholder:font-medium"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all duration-300 cursor-pointer active:scale-95"
                >
                  Apply
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Percent className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <div>
                    <span className="font-bold text-xs uppercase block tracking-wider">{appliedCoupon.code}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Promo Discount Active</span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-emerald-600 hover:text-rose-500 transition-colors active:scale-95 cursor-pointer underline decoration-emerald-300 hover:decoration-rose-300 underline-offset-2"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Verification Feedbacks */}
            {couponError && <p className="text-[10px] font-bold text-rose-500 mt-2 px-1">{couponError}</p>}
            {couponSuccess && <p className="text-[10px] font-bold text-emerald-500 mt-2 px-1">{couponSuccess}</p>}
          </div>

          {/* Calculations Detail List */}
          <div className="border-t border-violet-100/50 pt-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-slate-700">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span className="flex items-center space-x-2">
                <span>Calculated Tax</span>
                <span className="px-1.5 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 text-[9px] font-bold rounded-md font-mono">{activeTax?.rate || 18}%</span>
              </span>
              <span className="font-mono font-semibold text-slate-700">₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Shipping Fee</span>
              <span className="font-mono font-semibold text-slate-700">{shippingAmount === 0 ? 'FREE' : `₹${shippingAmount.toLocaleString('en-IN')}`}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-bold bg-emerald-50/50 -mx-2 px-2 py-1 rounded-md">
                <span>Coupon Discount</span>
                <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-slate-900 font-extrabold text-base sm:text-lg border-t border-violet-100/50 pt-4 mt-2">
              <span>Final Payable</span>
              <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500 drop-shadow-sm">
                ₹{finalTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-[0_10px_25px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_35px_rgba(34,211,238,0.4)] transition-all duration-300 flex items-center justify-center space-x-2 text-sm cursor-pointer active:scale-95 mt-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
