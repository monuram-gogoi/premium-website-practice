import { createClient } from '@supabase/supabase-js';
//supabase key added here 
const supabaseUrl ='https://byspunjgnpmrwbcmleuq.supabase.co';
const supabaseAnonKey ='sb_publishable_JimxbJogPUdLKsnViyr4OA_dFJemvYH';

// Create a safe, optional Supabase client instance.
// If the key is not defined, we fall back to a local storage mock system so that
// the app is fully previewable and testable out-of-the-box.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);
