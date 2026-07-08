import React, { useState } from 'react';
import { Mail, KeyRound, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Profile } from '../../types';
import { dbService } from '../../services/db';
import { supabase, hasSupabaseConfig } from '../../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: (profile: Profile) => void;
  setCurrentView: (view: { page: string; productId?: string }) => void;
}

export default function AdminLogin({ onLoginSuccess, setCurrentView }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Please enter your administrator email.');
      }
      if (!password) {
        throw new Error('Please enter your password.');
      }

      // Secure authenticaton using Supabase Auth
      let profile: Profile;
      if (hasSupabaseConfig && supabase) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (authError) throw authError;
        if (!data.user) throw new Error('Failed to retrieve user session.');

        // Fetch corresponding profile
        const { data: prof, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profError || !prof) {
          // If no profile exists yet, do not assume they are admin unless first user, 
          // but to be safe and avoid locking out on first signup via admin login:
          profile = {
            id: data.user.id,
            email: data.user.email || email,
            role: 'customer', // default to customer unless verified
            full_name: data.user.user_metadata?.full_name || 'User',
            created_at: new Date().toISOString()
          };
        } else {
          profile = prof;
        }

        // Strict role verification: only 'admin' role allowed
        if (profile.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Access Denied. Administrator account required.');
        }
      } else {
        // Fallback for secure offline staging/development if keys are not defined
        const localProf = await dbService.signIn(email, password, 'admin');
        if (localProf && localProf.role !== 'admin') {
          localStorage.removeItem('ec_current_user');
          throw new Error('Access Denied. Administrator account required.');
        }
        profile = localProf;
      }

      setSuccess('Admin session authorized! Loading console...');
      onLoginSuccess(profile);
      setCurrentView({ page: 'admin' });
    } catch (err: any) {
      setError(err.message || 'Authentication rejected. Unauthorized access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 max-w-md mx-auto animate-fade-in px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xl space-y-8">
        
        {/* Header section */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-mono font-bold rounded-md uppercase tracking-wider">
              Control Panel Gate
            </span>
            <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight mt-1">
              Admin Authenticate
            </h1>
            <p className="text-xs text-slate-400 font-light max-w-xs mx-auto leading-relaxed mt-1">
              Access is restricted to authorized platform administrators only.
            </p>
          </div>
        </div>

        {/* Security Alert Banner */}
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 flex items-start space-x-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 leading-normal font-medium">
            All access attempts are cryptographically logged on OGhaitong servers. Unauthorized entry is strictly audited.
          </p>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin-email"
                type="email"
                required
                disabled={loading}
                placeholder="administrator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-indigo-500 focus:bg-white transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin-password"
                type="password"
                required
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl">
              {error}
            </p>
          )}

          {success && (
            <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <button
            id="admin-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
          >
            <span>{loading ? 'Authorizing Secure Session...' : 'Authenticate Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
