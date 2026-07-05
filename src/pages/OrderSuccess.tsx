import { Check, ShoppingBag, ArrowRight, Clipboard } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessProps {
  lastOrder: Order | null;
  setCurrentView: (view: { page: string; productId?: string }) => void;
}

export default function OrderSuccess({
  lastOrder,
  setCurrentView
}: OrderSuccessProps) {
  const handleCopyOrderId = () => {
    if (lastOrder) {
      navigator.clipboard.writeText(lastOrder.id);
      alert('Order ID copied to clipboard!');
    }
  };

  return (
    <div className="py-12 max-w-2xl mx-auto text-center animate-fade-in">
      
      {/* Circle Check Icon */}
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-100 ring-4 ring-emerald-500/10">
        <Check className="w-10 h-10 animate-scale-up" />
      </div>

      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold rounded-md border border-emerald-200">
        PAYMENT COMPLETED SECURELY
      </span>

      <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
        Thank You For Your Order!
      </h1>
      
      <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
        Your payment has been verified, and the shipment is being processed by our express warehousing corridors.
      </p>

      {lastOrder && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-8 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">SECURE TRANSACTION ID</span>
              <span className="text-xs font-bold text-slate-700 font-mono block truncate">{lastOrder.payment_id || 'COD_PROCESSING_PENDING'}</span>
            </div>
            <div className="flex items-center space-x-1.5 self-start">
              <span className="text-[10px] text-slate-400 font-mono block">ORDER NO.</span>
              <span className="text-xs font-extrabold text-indigo-600 font-mono">{lastOrder.id}</span>
              <button
                onClick={handleCopyOrderId}
                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                title="Copy order number"
              >
                <Clipboard className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Delivery Destination</span>
            <div className="text-xs text-slate-600 space-y-0.5">
              <span className="font-bold text-slate-800 block">{lastOrder.shipping_address.full_name}</span>
              <span className="block">{lastOrder.shipping_address.address}</span>
              <span className="block">{lastOrder.shipping_address.city}, {lastOrder.shipping_address.state} - {lastOrder.shipping_address.zip}</span>
              <span className="block font-mono">Phone: {lastOrder.shipping_address.phone}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
            <span className="text-slate-500">Invoice Amount Paid:</span>
            <span className="font-extrabold text-sm text-slate-900 font-mono">₹{lastOrder.total_amount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <button
          onClick={() => setCurrentView({ page: 'store' })}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Back to Storefront
        </button>
        <button
          onClick={() => setCurrentView({ page: 'dashboard' })}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-100"
        >
          <span>Track Order History</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
