import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted) {
            if (session) {
              setHasSession(true);
              setIsLoading(false);
            } else {
              setHasSession(false);
              setIsLoading(false);
              navigate('/admin/login', { replace: true });
            }
          }
        } else {
          // Strictly treat as unauthorized if no Supabase instance/config exists
          if (mounted) {
            setHasSession(false);
            setIsLoading(false);
            navigate('/admin/login', { replace: true });
          }
        }
      } catch (err) {
        console.error('Session verification error:', err);
        if (mounted) {
          setHasSession(false);
          setIsLoading(false);
          navigate('/admin/login', { replace: true });
        }
      }
    }

    checkSession();

    let unsubscribe: (() => void) | null = null;
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (mounted) {
            if (session) {
              setHasSession(true);
            } else {
              setHasSession(false);
              navigate('/admin/login', { replace: true });
            }
          }
        }
      );
      unsubscribe = () => subscription.unsubscribe();
    }

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">Verifying Admin Session...</span>
      </div>
    );
  }

  return hasSession ? <>{children}</> : null;
}
