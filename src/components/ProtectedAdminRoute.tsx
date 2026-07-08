import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function checkAdminSession() {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!mounted) return;

          if (session) {
            // Fetch corresponding profile to verify admin role
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (!mounted) return;

            if (profile && profile.role === 'admin') {
              setIsAdmin(true);
              setIsLoading(false);
            } else {
              // User has session but is NOT an admin. Redirect to admin login
              setIsAdmin(false);
              setIsLoading(false);
              navigate('/admin/login', { replace: true });
            }
          } else {
            setIsAdmin(false);
            setIsLoading(false);
            navigate('/admin/login', { replace: true });
          }
        } else {
          // Fallback for offline staging
          if (mounted) {
            const storedUserString = localStorage.getItem('ec_current_user');
            if (storedUserString) {
              const user = JSON.parse(storedUserString);
              if (user && user.role === 'admin') {
                setIsAdmin(true);
                setIsLoading(false);
                return;
              }
            }
            setIsAdmin(false);
            setIsLoading(false);
            navigate('/admin/login', { replace: true });
          }
        }
      } catch (err) {
        console.error('Session verification error:', err);
        if (mounted) {
          setIsAdmin(false);
          setIsLoading(false);
          navigate('/admin/login', { replace: true });
        }
      }
    }

    checkAdminSession();

    let unsubscribe: (() => void) | null = null;
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;
          if (session) {
            // Re-verify role on auth change
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (!mounted) return;
            if (profile && profile.role === 'admin') {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
              navigate('/admin/login', { replace: true });
            }
          } else {
            setIsAdmin(false);
            navigate('/admin/login', { replace: true });
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

  return isAdmin ? <>{children}</> : null;
}
