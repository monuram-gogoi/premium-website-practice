import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface PublicAdminRouteProps {
  children: React.ReactNode;
}

export default function PublicAdminRoute({ children }: PublicAdminRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAdminSession, setHasAdminSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!mounted) return;

          if (session) {
            // Check if user is actually an admin
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (!mounted) return;

            if (profile && profile.role === 'admin') {
              setHasAdminSession(true);
              setIsLoading(false);
              navigate('/admin', { replace: true });
            } else {
              setHasAdminSession(false);
              setIsLoading(false);
            }
          } else {
            setHasAdminSession(false);
            setIsLoading(false);
          }
        } else {
          if (mounted) {
            const storedUserString = localStorage.getItem('ec_current_user');
            if (storedUserString) {
              const user = JSON.parse(storedUserString);
              if (user && user.role === 'admin') {
                setHasAdminSession(true);
                setIsLoading(false);
                navigate('/admin', { replace: true });
                return;
              }
            }
            setHasAdminSession(false);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Session verification error:', err);
        if (mounted) {
          setHasAdminSession(false);
          setIsLoading(false);
        }
      }
    }

    checkSession();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">Syncing Security Credentials...</span>
      </div>
    );
  }

  return !hasAdminSession ? <>{children}</> : null;
}
