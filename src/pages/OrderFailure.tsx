import { AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react';

interface OrderFailureProps {
  setCurrentView: (view: { page: string; productId?: string }) => void;
}

export default function OrderFailure({
  setCurrentView
}: OrderFailureProps) {
  return (
    <div className="py-12 max-w-md mx-auto text-center animate-fade-in">
      
      {/* Alert Warning icon */}
      <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-rose-100 ring-4 ring-rose-500/10">
        <AlertTriangle className="w-10 h-10 animate-shake" />
      </div>

      <span className="px-3 py-1 bg-rose-50 text-rose-700 text-[10px] font-mono font-bold rounded-md border border-rose-200">
        TRANSACTION REJECTED
      </span>

      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-4">
        Payment Gateway Failed
      </h1>
      
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">
        We were unable to complete this transaction. This can occur due to insufficient funds, timeout, or authentication checks.
      </p>

      {/* Troubleshooting tips */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left text-xs space-y-3 mt-8">
        <span className="font-bold text-slate-700 uppercase tracking-wider block">Recommended Resolution Steps</span>
        <ul className="space-y-1.5 text-slate-500 list-disc list-inside">
          <li>Verify your 3D Secure / OTP authentication passcode.</li>
          <li>Ensure your card or UPI limits are set high enough for this transaction.</li>
          <li>Try checkout again using the <strong>Cash on Delivery (COD)</strong> option.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <button
          onClick={() => setCurrentView({ page: 'cart' })}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Checkout</span>
        </button>
        <button
          onClick={() => setCurrentView({ page: 'store' })}
          className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
        >
          Browse Products
        </button>
      </div>

    </div>
  );
}
