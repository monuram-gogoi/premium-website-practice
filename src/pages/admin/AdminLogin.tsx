import React from 'react';
import Login from '../Login';
import { Profile } from '../../types';

interface AdminLoginProps {
  onLoginSuccess: (profile: Profile) => void;
  setCurrentView: (view: { page: string; productId?: string }) => void;
}

export default function AdminLogin({ onLoginSuccess, setCurrentView }: AdminLoginProps) {
  return (
    <div className="py-12 max-w-md mx-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="text-center space-y-2">
          <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-mono font-bold rounded-md uppercase tracking-wider">
            Restricted Area
          </span>
          <h1 className="font-display font-extrabold text-xl text-slate-900 tracking-tight text-center">
            Admin Authenticate Required
          </h1>
          <p className="text-xs text-slate-400 font-light max-w-xs mx-auto leading-relaxed text-center">
            Please log in with an authorized administrator account to access the control panel.
          </p>
        </div>
        <Login
          onLoginSuccess={onLoginSuccess}
          setCurrentView={setCurrentView}
        />
      </div>
    </div>
  );
}
