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
      <div className="py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Your Cart is Empty</h3>
        <p className="text-slate-500 text-sm mt-1">Add items to configure shipping, taxes, and coupons.</p>
        <button
          onClick={() => setCurrentView({ page: 'store' })}
          className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all inline-flex items-center space-x-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Products</span>
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in">
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
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
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:justify-between gap-5 shadow-sm hover:border-slate-300 transition-all duration-200"
              >
                {/* Product details block */}
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 
                      onClick={() => setCurrentView({ page: 'detail', productId: item.product.id })}
                      className="font-display font-bold text-sm sm:text-base text-slate-900 hover:text-indigo-600 cursor-pointer"
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider font-mono font-bold">
                      {item.product.category}
                    </p>
                    
                    {/* Low stock notice in cart */}
                    {isStockLow && (
                      <span className="block mt-1 text-[10px] font-bold text-rose-600">
                        Only {item.product.stock} left in stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing & quantity controls block */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-50">
                  
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-1">
                    <button
                      onClick={() => onUpdateCartQty(item.product.id, item.quantity - 1)}
                      className="px-2 py-0.5 font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-800 font-mono">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)}
                      className="px-2 py-0.5 font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-sm text-slate-400 block sm:hidden">Total price:</span>
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 font-mono">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromCart(item.product.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
            className="flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mt-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Right Column: Order Calculation Summary Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight pb-4 border-b border-slate-100">
            Order Calculation
          </h2>

          {/* WooCommerce Shipping Selection */}
          {shippingRules.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Shipping Mode</label>
              <div className="grid grid-cols-1 gap-2">
                {shippingRules.map(rule => {
                  const isFree = subtotal >= rule.free_delivery_threshold;
                  return (
                    <label
                      key={rule.id}
                      className={`flex items-start justify-between p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedShippingId === rule.id
                          ? 'border-indigo-600 bg-indigo-50/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <input
                          type="radio"
                          name="shipping_rule"
                          checked={selectedShippingId === rule.id}
                          onChange={() => setSelectedShippingId(rule.id)}
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 block">{rule.name}</span>
                          <span className="text-[10px] text-slate-400">Min. threshold for Free: ₹{rule.free_delivery_threshold.toLocaleString('en-IN')}</span>
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
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Tax Structure (GST)</label>
              <select
                value={selectedTaxId}
                onChange={(e) => setSelectedTaxId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                {taxes.map(tax => (
                  <option key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</option>
                ))}
              </select>
            </div>
          )}

          {/* Coupon Code Panel */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Apply Promotional Coupon</label>
            {!appliedCoupon ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="e.g. WELCOME10"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-850 rounded-lg border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Percent className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-xs uppercase block">{appliedCoupon.code}</span>
                    <span className="text-[10px] text-emerald-600 font-light">Promo Discount Active</span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-emerald-600 hover:text-rose-600 underline"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Verification Feedbacks */}
            {couponError && <p className="text-[10px] font-bold text-rose-600 mt-1">{couponError}</p>}
            {couponSuccess && <p className="text-[10px] font-bold text-emerald-600 mt-1">{couponSuccess}</p>}
          </div>

          {/* Calculations Detail List */}
          <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-light">
              <span>Subtotal</span>
              <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 font-light">
              <span className="flex items-center space-x-1">
                <span>Calculated Tax</span>
                <span className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-bold rounded-sm font-mono">{activeTax?.rate || 18}%</span>
              </span>
              <span className="font-mono">₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 font-light">
              <span>Shipping Fee</span>
              <span className="font-mono">{shippingAmount === 0 ? 'FREE' : `₹${shippingAmount.toLocaleString('en-IN')}`}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <span>Coupon Discount</span>
                <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-900 font-extrabold text-sm sm:text-base border-t border-slate-100 pt-3">
              <span>Final Payable</span>
              <span className="font-mono text-indigo-600">₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
