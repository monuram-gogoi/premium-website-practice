import React, { useState } from 'react';
import { Mail, User, ShieldAlert, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { Profile } from '../types';
import { dbService } from '../services/db';

interface LoginProps {
  onLoginSuccess: (profile: Profile) => void;
  setCurrentView: (view: { page: string; productId?: string }) => void;
}

export default function Login({
  onLoginSuccess,
  setCurrentView
}: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'customer'>('admin'); // default admin for easy testing!

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        if (!password) throw new Error('Please enter a password.');
        const profile = await dbService.signUp(email, password, fullName, selectedRole);
        setSuccess('Signup successful! Dropping you into your active session.');
        setTimeout(() => {
          onLoginSuccess(profile);
          setCurrentView({ page: 'store' });
        }, 1200);
      } else {
        if (!password) throw new Error('Please enter your password.');
        const profile = await dbService.signIn(email, password, selectedRole);
        setSuccess('Login successful! Dropping you into your active session.');
        setTimeout(() => {
          onLoginSuccess(profile);
          setCurrentView({ page: 'store' });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'admin' | 'customer') => {
    setError('');
    setLoading(true);
    const demoEmail = role === 'admin' ? 'admin@example.com' : 'customer@example.com';
    try {
      const profile = await dbService.signIn(demoEmail, 'TemporaryPassword123!', role);
      setSuccess(`Authenticated seamlessly as ${role.toUpperCase()}!`);
      setTimeout(() => {
        onLoginSuccess(profile);
        setCurrentView({ page: role === 'admin' ? 'admin' : 'store' });
      }, 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-md mx-auto animate-fade-in">
      
      {/* Auth Container Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold rounded-md uppercase tracking-wider">
            Sovereign Gateway Access
          </span>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
            {isSignUp ? 'Create Platform Profile' : 'Authenticate Session'}
          </h1>
          <p className="text-xs text-slate-400 font-light max-w-xs mx-auto leading-relaxed">
            Configure catalogs and test payment rules instantly with zero configuration requirements.
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-center">Fast-Track Interactive Testing</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-sm cursor-pointer transition-all flex items-center justify-center space-x-1"
            >
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span>Admin Profile (Full Access)</span>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('customer')}
              className="py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center space-x-1"
            >
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Customer Checkout</span>
            </button>
          </div>
        </div>

        {/* Separator line */}
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="h-px bg-slate-200 flex-1"></span>
          <span className="text-[10px] font-mono tracking-widest uppercase">Or credentials login</span>
          <span className="h-px bg-slate-200 flex-1"></span>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Registration Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Initial Access Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  selectedRole === 'admin'
                    ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  selectedRole === 'customer'
                    ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                Customer
              </button>
            </div>
          </div>

          {error && <p className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg">{error}</p>}
          {success && <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-sm cursor-pointer"
          >
            <span>{isSignUp ? 'Create Account' : 'Authenticate Credentials'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle signin/signup option */}
        <p className="text-center text-[11px] text-slate-400 font-light pt-2">
          {isSignUp ? 'Already registered on database?' : 'No active coordinate profile?'}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
            className="ml-1 text-indigo-600 font-semibold hover:underline"
          >
            {isSignUp ? 'Login Session' : 'Register Profile'}
          </button>
        </p>
      </div>

    </div>
  );
}
