import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, User, Phone, Lock, Unlock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { Profile } from '../types';
import { dbService } from '../services/db';

interface LoginProps {
  onLoginSuccess: (profile: Profile) => void;
  setCurrentView: (view: { page: string; productId?: string }) => void;
  initialSignUp?: boolean;
}

export default function Login({
  onLoginSuccess,
  setCurrentView,
  initialSignUp = false
}: LoginProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as any)?.from || '/';

  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Form fields
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Show/Hide password states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password form fields
  const [forgotEmail, setForgotEmail] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Synchronize state with URL route shifts (e.g. going from /login to /signup via router)
  useEffect(() => {
    setIsSignUp(initialSignUp);
    setError('');
    setSuccess('');
    setFieldErrors({});
    // Reset password toggle states when switching views
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [initialSignUp]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    setError('');

    if (isSignUp) {
      if (!fullName.trim()) {
        errors.fullName = 'Full Name is required';
      }
      if (!email.trim()) {
        errors.email = 'Email Address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (phone.trim() && !/^[0-9+\s-]{10,15}$/.test(phone)) {
        errors.phone = 'Please enter a valid mobile number (10-15 digits)';
      }
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!emailOrPhone.trim()) {
        errors.emailOrPhone = 'Email or Mobile Number is required';
      } else {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
        const isPhone = /^[0-9+\s-]{10,15}$/.test(emailOrPhone);
        if (!isEmail && !isPhone) {
          errors.emailOrPhone = 'Enter a valid email address or mobile number';
        }
      }
      if (!password) {
        errors.password = 'Password is required';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await dbService.resetPassword(forgotEmail);
      setSuccess('If this email is registered, a password recovery link has been sent.');
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery link.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const profile = await dbService.signUp(email, password, fullName, 'customer', phone);
        setSuccess('Account created successfully! Welcome to OGhaitong.');
        setTimeout(() => {
          onLoginSuccess(profile);
          navigate('/', { replace: true });
        }, 1200);
      } else {
        const profile = await dbService.signIn(emailOrPhone, password, 'customer');
        setSuccess('Logged in successfully. Welcome back!');
        
        // Handle optional remember me state
        if (rememberMe) {
          localStorage.setItem('ec_remember_me_user', emailOrPhone);
        } else {
          localStorage.removeItem('ec_remember_me_user');
        }

        setTimeout(() => {
          onLoginSuccess(profile);
          navigate(fromPath, { replace: true });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill remember me if saved
  useEffect(() => {
    if (!isSignUp) {
      const savedUser = localStorage.getItem('ec_remember_me_user');
      if (savedUser) {
        setEmailOrPhone(savedUser);
        setRememberMe(true);
      }
    }
  }, [isSignUp]);

  if (showForgotPassword) {
    return (
      <div className="py-20 max-w-md mx-auto animate-fade-in px-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-slate-400 font-light max-w-xs mx-auto leading-relaxed">
              Enter your email address and we will assist you with securing a new passcode for your account.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full outline-none text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all text-slate-900 font-light"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start space-x-2 bg-rose-50 border border-rose-100 p-3.5 rounded-2xl text-xs text-rose-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-normal">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start space-x-2 bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-xs text-emerald-600">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-normal">{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-slate-950/10 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 font-light pt-2">
            Remembered your credentials?{' '}
            <button
              onClick={() => { setShowForgotPassword(false); setError(''); setSuccess(''); }}
              className="text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Back to Sign In
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto animate-fade-in px-4">
      {/* Brand Aesthetic Header */}
      <div className="flex flex-col items-center mb-8 space-y-2">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-6 h-6 text-slate-950" />
          <span className="font-display font-bold text-xl tracking-widest text-slate-950">OGhaitong</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-600/80">Premium E-Commerce</p>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
        {/* Color Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-950 via-indigo-650 to-slate-950" />

        <div className="text-center space-y-2">
          <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
            {isSignUp ? 'Create your Account' : 'Sign in to OGhaitong'}
          </h1>
          <p className="text-xs text-slate-400 font-light leading-relaxed max-w-xs mx-auto">
            {isSignUp 
              ? 'Join our premium shopping platform to track requests, organize deliveries, and unlock early access.'
              : 'Access your curated dashboard, dispatch details, and bespoke order settings.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* FULL NAME - Sign Up Only */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-full outline-none text-sm transition-all text-slate-900 font-light ${
                    fieldErrors.fullName 
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 focus:bg-rose-50/10' 
                      : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 pl-3">
                  <AlertCircle className="w-3.5 h-3.5 inline" /> {fieldErrors.fullName}
                </p>
              )}
            </div>
          )}

          {/* EMAIL OR MOBILE NUMBER - Login Only */}
          {!isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email or Mobile Number</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="email@example.com or mobile number"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-full outline-none text-sm transition-all text-slate-900 font-light ${
                    fieldErrors.emailOrPhone 
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 focus:bg-rose-50/10' 
                      : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.emailOrPhone && (
                <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 pl-3">
                  <AlertCircle className="w-3.5 h-3.5 inline" /> {fieldErrors.emailOrPhone}
                </p>
              )}
            </div>
          )}

          {/* EMAIL ADDRESS - Sign Up Only */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-full outline-none text-sm transition-all text-slate-900 font-light ${
                    fieldErrors.email 
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 focus:bg-rose-50/10' 
                      : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 pl-3">
                  <AlertCircle className="w-3.5 h-3.5 inline" /> {fieldErrors.email}
                </p>
              )}
            </div>
          )}

          {/* MOBILE NUMBER (OPTIONAL) - Sign Up Only */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Number <span className="text-slate-300 font-light lowercase text-[9px]">(Optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-full outline-none text-sm transition-all text-slate-900 font-light ${
                    fieldErrors.phone 
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 focus:bg-rose-50/10' 
                      : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 pl-3">
                  <AlertCircle className="w-3.5 h-3.5 inline" /> {fieldErrors.phone}
                </p>
              )}
            </div>
          )}

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setError(''); }}
                  className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-11 pr-12 py-3 bg-slate-50 border rounded-full outline-none text-sm transition-all text-slate-900 font-light ${
                  fieldErrors.password 
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 focus:bg-rose-50/10' 
                    : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 pl-3">
                <AlertCircle className="w-3.5 h-3.5 inline" /> {fieldErrors.password}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD - Sign Up Only */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-11 pr-12 py-3 bg-slate-50 border rounded-full outline-none text-sm transition-all text-slate-900 font-light ${
                    fieldErrors.confirmPassword 
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 focus:bg-rose-50/10' 
                      : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 pl-3">
                  <AlertCircle className="w-3.5 h-3.5 inline" /> {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* REMEMBER ME - Login Only */}
          {!isSignUp && (
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="remember_me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded-lg focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
              <label htmlFor="remember_me" className="text-xs text-slate-500 font-light select-none cursor-pointer">
                Remember me on this device
              </label>
            </div>
          )}

          {/* ERROR & SUCCESS DISPLAY */}
          {error && (
            <div className="flex items-start space-x-2 bg-rose-50 border border-rose-100 p-3.5 rounded-2xl text-xs text-rose-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-normal">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start space-x-2 bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-xs text-emerald-600 animate-pulse">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-normal">{success}</span>
            </div>
          )}

          {/* MAIN SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-slate-950/10 cursor-pointer disabled:opacity-50 select-none hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* OR DIVIDER - Login Only */}
        {!isSignUp && (
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative px-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-white">or</span>
          </div>
        )}

        {/* BOTTOM OPTION SWITCHING */}
        <div className="text-center pt-2 border-t border-slate-50">
          <p className="text-xs text-slate-400 font-light">
            {isSignUp ? 'Already have an account?' : 'New to OGhaitong?'}
            <button
              type="button"
              onClick={() => {
                navigate(isSignUp ? '/login' : '/signup', { state: location.state });
                setError('');
                setSuccess('');
                setFieldErrors({});
              }}
              className="ml-2 text-indigo-600 font-semibold hover:underline cursor-pointer focus:outline-none"
            >
              {isSignUp ? 'Sign In' : 'Create New Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
