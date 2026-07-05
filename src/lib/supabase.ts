import { createClient } from '@supabase/supabase-js';

const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';

// Create a safe, optional Supabase client instance.
// If the key is not defined, we fall back to a local storage mock system so that
// the app is fully previewable and testable out-of-the-box.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);
