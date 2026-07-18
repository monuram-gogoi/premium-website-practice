import React, { useState, useEffect } from 'react';
import { Send, Sparkles, ShieldCheck, Mail, MapPin, Phone, HelpCircle } from 'lucide-react';
import { dbService } from '../services/db';

interface FooterProps {
  setCurrentView: (view: { page: string; tab?: string }) => void;
}

export default function Footer({ setCurrentView }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await dbService.getWebsiteSettings();
        setSettings(s);
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-800/80 overflow-hidden font-sans">
      {/* Premium Visual Accent Glows (Violet & Cyan) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-slate-800/60">
          
          {/* Column 1: About OGhaitong */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(124,58,237,0.3)] group-hover:shadow-[0_4px_25px_rgba(34,211,238,0.4)] transition-all duration-500">
                <Sparkles className="w-4.5 h-4.5 text-white transform group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-display font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 group-hover:to-cyan-200 transition-colors">
                {settings?.branding_name || 'OGhaitong'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-sm">
              {settings?.site_description || 'We engineer ultimate consumer technology and designer audio headgear. Crafted to ensure flawless execution, pristine sound, and modern visual aesthetics inspired by futuristic hardware.'}
            </p>
            <div className="flex items-center space-x-2.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4.5 h-4.5 text-violet-400" />
              <span>{settings?.footer_text || 'Registered Trademark © 2026 OGhaitong. Certified Authentic.'}</span>
            </div>
          </div>

          {/* Column 2: Shop & Categories */}
          <div className="space-y-4">
            <h4 className="font-display text-xs font-bold text-white tracking-widest uppercase drop-shadow-sm">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-slate-400">
              <li>
                <button 
                  onClick={() => setCurrentView({ page: 'store' })} 
                  className="hover:text-cyan-400 hover:translate-x-1 active:scale-95 transition-all duration-300 text-left cursor-pointer inline-flex items-center"
                >
                  Smartphones
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView({ page: 'store' })} 
                  className="hover:text-cyan-400 hover:translate-x-1 active:scale-95 transition-all duration-300 text-left cursor-pointer inline-flex items-center"
                >
                  Premium Audio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView({ page: 'store' })} 
                  className="hover:text-cyan-400 hover:translate-x-1 active:scale-95 transition-all duration-300 text-left cursor-pointer inline-flex items-center"
                >
                  High-End Laptops
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView({ page: 'store' })} 
                  className="hover:text-cyan-400 hover:translate-x-1 active:scale-95 transition-all duration-300 text-left cursor-pointer inline-flex items-center"
                >
                  Gaming Console Rig
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="space-y-4">
            <h4 className="font-display text-xs font-bold text-white tracking-widest uppercase drop-shadow-sm">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-slate-400">
              <li>
                <button 
                  onClick={() => setCurrentView({ page: 'dashboard', tab: 'orders' })} 
                  className="hover:text-violet-400 hover:translate-x-1 active:scale-95 transition-all duration-300 text-left cursor-pointer inline-flex items-center"
                >
                  Track Shipments
                </button>
              </li>
              <li>
                <span className="hover:text-violet-400 hover:translate-x-1 transition-all duration-300 text-left cursor-pointer inline-block">
                  Cancellation Desk
                </span>
              </li>
              <li>
                <span className="hover:text-violet-400 hover:translate-x-1 transition-all duration-300 text-left cursor-pointer inline-block">
                  Easy Return Policy
                </span>
              </li>
              <li>
                <span className="hover:text-violet-400 hover:translate-x-1 transition-all duration-300 text-left cursor-pointer inline-block">
                  Secure Razorpay Help
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className="space-y-4">
            <h4 className="font-display text-xs font-bold text-white tracking-widest uppercase drop-shadow-sm">
              Connect Desk
            </h4>
            <div className="space-y-3.5 text-sm font-medium text-slate-400">
              <div className="flex items-start space-x-2.5 group cursor-pointer hover:text-cyan-400 transition-colors duration-300">
                <MapPin className="w-4.5 h-4.5 text-cyan-500 shrink-0 mt-0.5 group-hover:animate-bounce" />
                <span>Level 12, Cyber Hub, Gurugram, India</span>
              </div>
              <div className="flex items-center space-x-2.5 group cursor-pointer hover:text-cyan-400 transition-colors duration-300">
                <Mail className="w-4.5 h-4.5 text-cyan-500 shrink-0" />
                <span>support@oghaitong.com</span>
              </div>
              <div className="flex items-center space-x-2.5 group cursor-pointer hover:text-cyan-400 transition-colors duration-300">
                <Phone className="w-4.5 h-4.5 text-cyan-500 shrink-0" />
                <span>+91 1800 240 880</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Row */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex flex-wrap items-center gap-6">
            <span>&copy; 2026 {settings?.branding_name || 'OGhaitong'}. All Rights Reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-cyan-400 cursor-pointer transition-colors duration-300">Privacy Charter</span>
              <span className="hover:text-cyan-400 cursor-pointer transition-colors duration-300">Terms of Carriage</span>
              <span className="hover:text-cyan-400 cursor-pointer transition-colors duration-300">GST Compliance</span>
            </div>
          </div>

          {/* Integrated Payment Badges */}
          <div className="flex items-center space-x-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Secure Payments via</span>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] text-slate-300 font-bold rounded-lg shadow-inner">UPI</span>
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] text-slate-300 font-bold rounded-lg shadow-inner">RAZORPAY</span>
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] text-slate-300 font-bold rounded-lg shadow-inner">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
