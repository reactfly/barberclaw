import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getPublicRuntimeConfig } from './runtimeConfig';

let supabaseClient: SupabaseClient | null = null;
let cachedSupabaseUrl = '';
let cachedSupabasePublishableKey = '';

export const getSupabaseClient = async () => {
  const config = await getPublicRuntimeConfig();
  const supabaseUrl = config.supabaseUrl;
  const supabasePublishableKey = config.supabasePublishableKey;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Supabase nao configurado. Verifique o endpoint /api/public-runtime-config no ambiente.'
    );
  }

  if (
    !supabaseClient ||
    cachedSupabaseUrl !== supabaseUrl ||
    cachedSupabasePublishableKey !== supabasePublishableKey
  ) {
    supabaseClient = createClient(supabaseUrl, supabasePublishableKey);
    cachedSupabaseUrl = supabaseUrl;
    cachedSupabasePublishableKey = supabasePublishableKey;
  }

  return supabaseClient;
};
