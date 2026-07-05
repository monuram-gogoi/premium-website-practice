import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface PublicAdminRouteProps {
  children: React.ReactNode;
}

export default function PublicAdminRoute({ children }: PublicAdminRouteProps) {
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
              navigate('/admin', { replace: true });
            } else {
              setHasSession(false);
              setIsLoading(false);
            }
          }
        } else {
          if (mounted) {
            setHasSession(false);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Session verification error:', err);
        if (mounted) {
          setHasSession(false);
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

  return !hasSession ? <>{children}</> : null;
}
