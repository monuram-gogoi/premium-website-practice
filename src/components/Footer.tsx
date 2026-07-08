import React, { useState } from 'react';
import { Send, Sparkles, ShieldCheck, Mail, MapPin, Phone, HelpCircle } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: { page: string; tab?: string }) => void;
}

export default function Footer({ setCurrentView }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative bg-[#0b0f19] text-slate-400 pt-20 pb-10 border-t border-slate-800/80 overflow-hidden font-sans">
      {/* Visual Accent Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-slate-800/60">
          
          {/* Column 1: About OGhaitong */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.25)]">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-wider text-white">
                OGhaitong
              </span>
            </div>
            <p className="text-sm font-light text-slate-400 leading-relaxed max-w-sm">
              We engineer ultimate consumer technology and designer audio headgear. Crafted to ensure flawless execution, pristine sound, and modern visual aesthetics inspired by futuristic hardware.
            </p>
            <div className="flex items-center space-x-2.5 text-xs text-slate-500">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />
              <span>Registered Trademark &copy; 2026. Certified Authentic.</span>
            </div>
          </div>

          {/* Column 2: Shop & Categories */}
          <div className="space-y-4">
            <h4 className="font-display text-xs font-bold text-white tracking-widest uppercase">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-sm font-light text-slate-400">
              <li>
                <button 
                  onClick={() => setCurrentView({ page: 'store' })} 
                  className="hover:text-blue-500 transition-colors text-left cursor-pointer"
                >
                  Smartphones
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView({ page: 'store' })} 
                  className="hover:text-blue-500 transition-colors text-left cursor-pointer"
                >
                  Premium Audio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView({ page: 'store' })} 
                  className="hover:text-blue-500 transition-colors text-left cursor-pointer"
                >
                  High-End Laptops
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView({ page: 'store' })} 
                  className="hover:text-blue-500 transition-colors text-left cursor-pointer"
                >
                  Gaming Console Rig
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="space-y-4">
            <h4 className="font-display text-xs font-bold text-white tracking-widest uppercase">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm font-light text-slate-400">
              <li>
                <button 
                  onClick={() => setCurrentView({ page: 'dashboard', tab: 'orders' })} 
                  className="hover:text-blue-500 transition-colors text-left cursor-pointer"
                >
                  Track Shipments
                </button>
              </li>
              <li>
                <span className="hover:text-blue-500 transition-colors text-left cursor-pointer">
                  Cancellation Desk
                </span>
              </li>
              <li>
                <span className="hover:text-blue-500 transition-colors text-left cursor-pointer">
                  Easy Return Policy
                </span>
              </li>
              <li>
                <span className="hover:text-blue-500 transition-colors text-left cursor-pointer">
                  Secure Razorpay Help
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className="space-y-4">
            <h4 className="font-display text-xs font-bold text-white tracking-widest uppercase">
              Connect Desk
            </h4>
            <div className="space-y-3.5 text-sm font-light text-slate-400">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                <span>Level 12, Cyber Hub, Gurugram, India</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                <span>support@oghaitong.com</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                <span>+91 1800 240 880</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Row */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-6">
            <span>&copy; 2026 OGhaitong. All Rights Reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy Charter</span>
              <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms of Carriage</span>
              <span className="hover:text-slate-400 cursor-pointer transition-colors">GST Compliance</span>
            </div>
          </div>

          {/* Integrated Payment Badges */}
          <div className="flex items-center space-x-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Secure Payments via</span>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold rounded">UPI</span>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold rounded">RAZORPAY</span>
              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold rounded">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
