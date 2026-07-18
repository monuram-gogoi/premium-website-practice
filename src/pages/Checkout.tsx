import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, ShieldCheck, ShoppingBag, Truck, Lock, CheckCircle, XCircle } from 'lucide-react';
import { Profile, CartItem } from '../types';
import { dbService } from '../services/db';

interface CheckoutProps {
  cart: CartItem[];
  currentUser: Profile | null;
  calcSummary: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    couponCode: string;
  };
  setCurrentView: (view: { page: string; productId?: string }) => void;
  onClearCart: () => void;
  onSetLastOrder: (order: any) => void;
}

export default function Checkout({
  cart,
  currentUser,
  calcSummary,
  setCurrentView,
  onClearCart,
  onSetLastOrder
}: CheckoutProps) {
  const fallbackCustomer: Profile = {
    id: 'user-customer',
    email: 'guest@example.com',
    role: 'customer',
    full_name: 'Guest Customer',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    created_at: new Date().toISOString()
  };

  const activeUser = currentUser || fallbackCustomer;

  const [address, setAddress] = useState({
    full_name: activeUser.full_name || '',
    phone: activeUser.phone || '',
    address: activeUser.address || '',
    city: activeUser.city || '',
    state: activeUser.state || '',
    zip: activeUser.zip || '',
    country: activeUser.country || 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simulation Sandbox Modals
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState<any>(null);

  useEffect(() => {
    // Pre-populate address if activeUser changes
    if (activeUser) {
      setAddress({
        full_name: activeUser.full_name || '',
        phone: activeUser.phone || '',
        address: activeUser.address || '',
        city: activeUser.city || '',
        state: activeUser.state || '',
        zip: activeUser.zip || '',
        country: activeUser.country || 'India'
      });
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!address.full_name || !address.phone || !address.address || !address.city || !address.zip) {
      setErrorMessage('Please fill in all mandatory shipping fields.');
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'cod') {
        // Cash on delivery logic
        const order = await dbService.createOrder({
          user_id: activeUser.id,
          status: 'pending',
          total_amount: calcSummary.total,
          subtotal: calcSummary.subtotal,
          tax_amount: calcSummary.tax,
          shipping_amount: calcSummary.shipping,
          discount_amount: calcSummary.discount,
          coupon_code: calcSummary.couponCode,
          shipping_address: address,
          payment_method: 'cod'
        }, cart);

        onSetLastOrder(order);
        onClearCart();
        setCurrentView({ page: 'order-success' });
        setIsProcessing(false);
      } else {
        // Razorpay order creation
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: calcSummary.total,
            orderId: `local_${Date.now()}`
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Server failed to initiate order.');
        }

        const razorpayOrder = await res.json();

        if (razorpayOrder.is_simulated) {
          // Trigger custom sandbox simulation modal
          setMockPaymentData(razorpayOrder);
          setShowMockModal(true);
        } else {
          // Open real Razorpay gateway
          const options = {
            key: razorpayOrder.key_id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: 'OGhaitong',
            description: 'Order Secure Gateway Checkout',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
            order_id: razorpayOrder.id,
            handler: async function (response: any) {
              try {
                setIsProcessing(true);
                // Verify signature on backend
                const verifyRes = await fetch('/api/payments/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(response)
                });

                if (verifyRes.ok) {
                  // Save order in db
                  const order = await dbService.createOrder({
                    user_id: activeUser.id,
                    status: 'paid',
                    total_amount: calcSummary.total,
                    subtotal: calcSummary.subtotal,
                    tax_amount: calcSummary.tax,
                    shipping_amount: calcSummary.shipping,
                    discount_amount: calcSummary.discount,
                    coupon_code: calcSummary.couponCode,
                    shipping_address: address,
                    payment_method: 'razorpay',
                    payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id
                  }, cart);

                  onSetLastOrder(order);
                  onClearCart();
                  setCurrentView({ page: 'order-success' });
                } else {
                  throw new Error('Payment verification signature rejected.');
                }
              } catch (err: any) {
                console.error(err);
                setCurrentView({ page: 'order-failure' });
              } finally {
                setIsProcessing(false);
              }
            },
            prefill: {
              name: address.full_name,
              email: activeUser.email,
              contact: address.phone
            },
            theme: {
              color: '#7c3aed' // updated to violet
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (resp: any) {
            console.error('Razorpay transaction failed', resp.error);
            setCurrentView({ page: 'order-failure' });
          });
          rzp.open();
          setIsProcessing(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Razorpay Gateway failed. Try Sandbox or COD.');
      setIsProcessing(false);
    }
  };

  // Mock Success / Failure Handler for Sandbox mode
  const handleMockPaymentResult = async (success: boolean) => {
    setShowMockModal(false);
    setIsProcessing(true);

    if (success && activeUser) {
      try {
        const mockPaymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;
        
        const order = await dbService.createOrder({
          user_id: activeUser.id,
          status: 'paid',
          total_amount: calcSummary.total,
          subtotal: calcSummary.subtotal,
          tax_amount: calcSummary.tax,
          shipping_amount: calcSummary.shipping,
          discount_amount: calcSummary.discount,
          coupon_code: calcSummary.couponCode,
          shipping_address: address,
          payment_method: 'razorpay',
          payment_id: mockPaymentId,
          razorpay_order_id: mockPaymentData.id
        }, cart);

        onSetLastOrder(order);
        onClearCart();
        setCurrentView({ page: 'order-success' });
      } catch (err: any) {
        console.error('Mock payment record creation failed', err);
        setErrorMessage('Failed to register mock transaction in Database.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(false);
      setCurrentView({ page: 'order-failure' });
    }
  };

  return (
    <div className="py-8 animate-slide-up relative font-sans">
      
      {/* Simulation Sandbox Modal */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-md w-full border border-violet-100 shadow-[0_20px_50px_rgba(0,0,0,0.2)] text-center space-y-6 transform scale-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-cyan-50 flex items-center justify-center mx-auto text-violet-600 shadow-inner">
              <CreditCard className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-[10px] font-mono font-bold rounded-md border border-amber-200 shadow-sm inline-block">
                SANDBOX SIMULATION MODE
              </span>
              <h3 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight mt-4">
                Razorpay Secure Gateway
              </h3>
              <p className="text-slate-500 text-xs mt-2">
                Testing order payment ID: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded-md text-violet-600 font-bold border border-slate-200">{mockPaymentData?.id}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-2xl space-y-2.5 text-xs border border-slate-100 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Client billing email:</span>
                <span className="font-bold text-slate-800">{activeUser?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Calculated amount:</span>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500 font-mono text-base">₹{calcSummary.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleMockPaymentResult(true)}
                className="py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <CheckCircle className="w-4.5 h-4.5" />
                <span>Verify Payment</span>
              </button>
              <button
                onClick={() => handleMockPaymentResult(false)}
                className="py-3.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-sm font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-[0_8px_20px_rgba(225,29,72,0.3)] transition-all cursor-pointer"
              >
                <XCircle className="w-4.5 h-4.5" />
                <span>Simulate Fail</span>
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed px-4">
              This modal operates because Razorpay env variables are set to fallback sandbox state. To connect live, populate <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-violet-600 border border-slate-200">RAZORPAY_KEY_ID</code>.
            </p>
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => setCurrentView({ page: 'cart' })}
        className="mb-8 flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-violet-600 transition-all duration-300 cursor-pointer group active:scale-95 w-fit"
      >
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-violet-200 group-hover:bg-violet-50 shadow-sm transition-all">
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        </div>
        <span>Return to Shopping Bag</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Address and Gateway forms */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-8 bg-white/80 backdrop-blur-md border border-violet-100/60 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(124,58,237,0.05)] space-y-6">
          <h2 className="font-display font-extrabold text-xl text-slate-900 tracking-tight pb-4 border-b border-violet-100/50 flex items-center space-x-2.5">
            <Truck className="w-5 h-5 text-violet-600" />
            <span>Shipping Dispatch Address</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-violet-600 uppercase tracking-widest block">Full Recipient Name *</label>
              <input
                type="text"
                name="full_name"
                required
                value={address.full_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm font-medium transition-all shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-violet-600 uppercase tracking-widest block">Contact Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={address.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm font-mono font-medium transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-violet-600 uppercase tracking-widest block">Delivery Address (Street, Apt) *</label>
            <input
              type="text"
              name="address"
              required
              value={address.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm font-medium transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-violet-600 uppercase tracking-widest block">City *</label>
              <input
                type="text"
                name="city"
                required
                value={address.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm font-medium transition-all shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-violet-600 uppercase tracking-widest block">State</label>
              <input
                type="text"
                name="state"
                value={address.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm font-medium transition-all shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-violet-600 uppercase tracking-widest block">ZIP / PIN Code *</label>
              <input
                type="text"
                name="zip"
                required
                value={address.zip}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm font-mono font-medium transition-all shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-violet-600 uppercase tracking-widest block">Country</label>
              <input
                type="text"
                name="country"
                value={address.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm font-medium transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-violet-100/50 mt-4">
            <h3 className="font-display font-extrabold text-lg text-slate-900 tracking-tight mb-5 flex items-center space-x-2.5">
              <CreditCard className="w-5 h-5 text-violet-600" />
              <span>Select Payment Architecture</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                  paymentMethod === 'razorpay'
                    ? 'border-violet-400 bg-violet-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-violet-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="w-4 h-4 text-violet-600 border-slate-300 focus:ring-violet-500 transition-colors"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">Razorpay Gateway</span>
                    <span className="text-[10px] text-slate-500 font-medium">Cards, Netbanking, UPI</span>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'razorpay' ? 'bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                  paymentMethod === 'cod'
                    ? 'border-violet-400 bg-violet-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-violet-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-violet-600 border-slate-300 focus:ring-violet-500 transition-colors"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">Cash on Delivery</span>
                    <span className="text-[10px] text-slate-500 font-medium">Pay inside domestic sectors</span>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                  <Truck className="w-4 h-4" />
                </div>
              </label>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 animate-fade-in">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <p className="text-xs font-bold text-rose-600">{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-4.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-sm font-bold rounded-xl shadow-[0_10px_25px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_35px_rgba(34,211,238,0.4)] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer active:scale-95 ${
              isProcessing ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <Lock className="w-4.5 h-4.5" />
            <span>{isProcessing ? 'Processing Transaction...' : `Complete Payment of ₹${calcSummary.total.toLocaleString('en-IN')}`}</span>
          </button>
        </form>

        {/* Right Column: Checkout Item review list */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-md border border-violet-100/60 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(124,58,237,0.05)] space-y-6 sticky top-24">
          <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight pb-4 border-b border-violet-100/50">
            Review Order Items
          </h2>

          <div className="divide-y divide-violet-50 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {cart.map((item) => (
              <div key={item.product.id} className="py-3.5 flex items-center justify-between gap-3 text-xs group">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-violet-100/50 shrink-0 overflow-hidden group-hover:bg-violet-50/50 transition-colors p-1">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block line-clamp-1">{item.product.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium font-mono mt-0.5 block">Qty: {item.quantity} × ₹{item.product.price}</span>
                  </div>
                </div>
                <span className="font-bold text-slate-800 font-mono">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-violet-100/50 pt-5 space-y-3.5 text-xs">
            <div className="flex justify-between items-center text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-slate-700">₹{calcSummary.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 font-medium">
              <span>GST Applied</span>
              <span className="font-mono font-semibold text-slate-700">₹{calcSummary.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 font-medium">
              <span>Shipping cost</span>
              <span className="font-mono font-semibold text-slate-700">{calcSummary.shipping === 0 ? 'FREE' : `₹${calcSummary.shipping.toLocaleString('en-IN')}`}</span>
            </div>
            {calcSummary.discount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 font-bold bg-emerald-50/50 -mx-2 px-2 py-1 rounded-md">
                <span>Coupon Applied</span>
                <span className="font-mono">-₹{calcSummary.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-slate-900 font-extrabold text-base sm:text-lg border-t border-violet-100/50 pt-4 mt-2">
              <span>Final Payable</span>
              <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500 drop-shadow-sm">
                ₹{calcSummary.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
