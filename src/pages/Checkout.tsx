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
  const [address, setAddress] = useState({
    full_name: currentUser?.full_name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    zip: currentUser?.zip || '',
    country: currentUser?.country || 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simulation Sandbox Modals
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState<any>(null);

  useEffect(() => {
    // Pre-populate address if currentUser changes
    if (currentUser) {
      setAddress({
        full_name: currentUser.full_name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zip: currentUser.zip || '',
        country: currentUser.country || 'India'
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

    if (!currentUser) {
      // Must login to checkout per standard eCommerce design
      alert('Please Login/Signup to record orders and track dispatch histories.');
      setCurrentView({ page: 'login' });
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'cod') {
        // Cash on delivery logic
        const order = await dbService.createOrder({
          user_id: currentUser.id,
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
            name: 'Sovereign',
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
                    user_id: currentUser.id,
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
              email: currentUser.email,
              contact: address.phone
            },
            theme: {
              color: '#4f46e5'
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

    if (success && currentUser) {
      try {
        const mockPaymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;
        
        const order = await dbService.createOrder({
          user_id: currentUser.id,
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
    <div className="py-8 animate-fade-in relative">
      
      {/* Simulation Sandbox Modal */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600">
              <CreditCard className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-mono font-bold rounded-md border border-amber-200">
                SANDBOX SIMULATION MODE
              </span>
              <h3 className="font-display font-extrabold text-xl text-slate-900 tracking-tight mt-3">
                Razorpay Secure Gateway
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Testing order payment ID: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600">{mockPaymentData?.id}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-light">Client billing email:</span>
                <span className="font-semibold text-slate-800">{currentUser?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-light">Calculated order amount:</span>
                <span className="font-bold text-slate-800 font-mono">₹{calcSummary.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleMockPaymentResult(true)}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center justify-center space-x-1 shadow-lg shadow-emerald-100 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify Payment</span>
              </button>
              <button
                onClick={() => handleMockPaymentResult(false)}
                className="py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl flex items-center justify-center space-x-1 shadow-lg shadow-rose-100 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Simulate Fail</span>
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400">
              This modal operates because Razorpay env variables are set to fallback sandbox state. To connect live, populate <code className="font-mono bg-slate-100 p-0.5 rounded text-indigo-600">RAZORPAY_KEY_ID</code>.
            </p>
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => setCurrentView({ page: 'cart' })}
        className="mb-8 flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shopping Bag</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Address and Gateway forms */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-display font-extrabold text-xl text-slate-900 tracking-tight pb-4 border-b border-slate-100 flex items-center space-x-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <span>Shipping Dispatch Address</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Full Recipient Name *</label>
              <input
                type="text"
                name="full_name"
                required
                value={address.full_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Contact Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={address.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Delivery Address (Street, Apt) *</label>
            <input
              type="text"
              name="address"
              required
              value={address.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">City *</label>
              <input
                type="text"
                name="city"
                required
                value={address.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">State</label>
              <input
                type="text"
                name="state"
                value={address.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">ZIP / PIN Code *</label>
              <input
                type="text"
                name="zip"
                required
                value={address.zip}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Country</label>
              <input
                type="text"
                name="country"
                value={address.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-display font-extrabold text-base text-slate-900 tracking-tight mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Select Payment Architecture</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-indigo-600 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">Razorpay Gateway</span>
                    <span className="text-[10px] text-slate-400">Cards, Netbanking, UPI</span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </label>

              <label
                className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-indigo-600 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">Cash on Delivery</span>
                    <span className="text-[10px] text-slate-400">Pay inside domestic sectors</span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5" />
                </div>
              </label>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              isProcessing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Transaction...' : `Complete Payment of ₹${calcSummary.total.toLocaleString('en-IN')}`}</span>
          </button>
        </form>

        {/* Right Column: Checkout Item review list */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight pb-4 border-b border-slate-100">
            Review Order Items
          </h2>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-100 shrink-0"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block line-clamp-1">{item.product.name}</span>
                    <span className="text-slate-400 font-light font-mono">Qty: {item.quantity} × ₹{item.product.price}</span>
                  </div>
                </div>
                <span className="font-bold text-slate-800 font-mono">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono">₹{calcSummary.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST Applied</span>
              <span className="font-mono">₹{calcSummary.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Shipping cost</span>
              <span className="font-mono">{calcSummary.shipping === 0 ? 'FREE' : `₹${calcSummary.shipping.toLocaleString('en-IN')}`}</span>
            </div>
            {calcSummary.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Applied</span>
                <span className="font-mono">-₹{calcSummary.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-100 pt-3">
              <span>Final Payable</span>
              <span className="font-mono text-indigo-600">₹{calcSummary.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
