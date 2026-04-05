import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabaseClient: SupabaseClient | null = null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env.'
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl!, supabasePublishableKey!);
  }

  return supabaseClient;
};
