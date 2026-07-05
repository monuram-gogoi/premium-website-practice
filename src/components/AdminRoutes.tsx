import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { dbService } from '../services/db';

interface RouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: RouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      try {
        if (hasSupabaseConfig && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsAuthenticated(true);
            const userProfile = await dbService.getCurrentUser();
            setIsAdmin(userProfile?.role === 'admin');
          } else {
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } else {
          // LocalStorage fallback check
          const userProfile = await dbService.getCurrentUser();
          if (userProfile) {
            setIsAuthenticated(true);
            setIsAdmin(userProfile.role === 'admin');
          } else {
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();

    let unsubscribe: (() => void) | null = null;
    if (hasSupabaseConfig && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session) {
            setIsAuthenticated(true);
            const userProfile = await dbService.getCurrentUser();
            setIsAdmin(userProfile?.role === 'admin');
          } else {
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
          setIsLoading(false);
        }
      );
      unsubscribe = () => subscription.unsubscribe();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">Verifying Admin Session...</span>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PublicAdminRoute({ children }: RouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        if (hasSupabaseConfig && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsAuthenticated(true);
            const userProfile = await dbService.getCurrentUser();
            setIsAdmin(userProfile?.role === 'admin');
          } else {
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } else {
          // LocalStorage fallback check
          const userProfile = await dbService.getCurrentUser();
          if (userProfile) {
            setIsAuthenticated(true);
            setIsAdmin(userProfile.role === 'admin');
          } else {
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">Syncing Security Credentials...</span>
      </div>
    );
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
