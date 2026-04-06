import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

export type AppRole = 'customer' | 'owner' | 'admin' | 'staff';

export interface ProfileRecord {
  id: string;
  email: string | null;
  full_name: string;
  role: AppRole;
  phone: string | null;
  avatar_url: string | null;
  primary_barbershop_id: string | null;
  onboarding_completed: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BarbershopRecord {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram_handle: string | null;
  document_number: string | null;
  postal_code: string | null;
  address_line: string;
  neighborhood: string | null;
  city: string;
  state: string;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_premium: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SessionContext {
  user: User;
  profile: ProfileRecord;
  primaryBarbershop: BarbershopRecord | null;
}

const PROFILE_SELECT = `
  id,
  email,
  full_name,
  role,
  phone,
  avatar_url,
  primary_barbershop_id,
  onboarding_completed,
  is_active,
  created_at,
  updated_at
`;

const BARBERSHOP_SELECT = `
  id,
  owner_id,
  name,
  slug,
  description,
  phone,
  whatsapp,
  instagram_handle,
  document_number,
  postal_code,
  address_line,
  neighborhood,
  city,
  state,
  country_code,
  latitude,
  longitude,
  is_active,
  is_featured,
  is_premium,
  created_at,
  updated_at
`;

const PROFILE_LOOKUP_ATTEMPTS = 5;
const PROFILE_LOOKUP_DELAY_MS = 250;

const sleep = (delayMs: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs);
  });

const isNoRowsError = (error: { code?: string } | null) => error?.code === 'PGRST116';

export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user ?? null;
};

export const getProfileById = async (
  userId: string,
  attempts = PROFILE_LOOKUP_ATTEMPTS
): Promise<ProfileRecord | null> => {
  const supabase = await getSupabaseClient();

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', userId)
      .maybeSingle<ProfileRecord>();

    if (error && !isNoRowsError(error)) {
      throw error;
    }

    if (data) {
      return data;
    }

    if (attempt < attempts - 1) {
      await sleep(PROFILE_LOOKUP_DELAY_MS);
    }
  }

  return null;
};

export const getBarbershopById = async (barbershopId: string): Promise<BarbershopRecord | null> => {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('barbershops')
    .select(BARBERSHOP_SELECT)
    .eq('id', barbershopId)
    .maybeSingle<BarbershopRecord>();

  if (error && !isNoRowsError(error)) {
    throw error;
  }

  return data ?? null;
};

export const getOwnerBarbershop = async (ownerId: string): Promise<BarbershopRecord | null> => {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('barbershops')
    .select(BARBERSHOP_SELECT)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<BarbershopRecord>();

  if (error && !isNoRowsError(error)) {
    throw error;
  }

  return data ?? null;
};

export const getPrimaryBarbershopForProfile = async (
  profile: ProfileRecord
): Promise<BarbershopRecord | null> => {
  if (profile.primary_barbershop_id) {
    const barbershop = await getBarbershopById(profile.primary_barbershop_id);
    if (barbershop) {
      return barbershop;
    }
  }

  if (profile.role === 'owner') {
    return getOwnerBarbershop(profile.id);
  }

  return null;
};

export const getCurrentSessionContext = async (): Promise<SessionContext | null> => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const profile = await getProfileById(user.id);
  if (!profile) {
    throw new Error(
      'Seu perfil ainda nao esta disponivel no Supabase. Aguarde alguns segundos e tente novamente.'
    );
  }

  const primaryBarbershop = await getPrimaryBarbershopForProfile(profile);

  return {
    user,
    profile,
    primaryBarbershop,
  };
};

export const getPostAuthRedirectPath = (context: SessionContext): string => {
  const { profile, primaryBarbershop } = context;

  if (profile.role === 'owner') {
    return profile.onboarding_completed && primaryBarbershop ? '/admin' : '/onboarding';
  }

  if (profile.role === 'admin' || profile.role === 'staff') {
    return '/admin';
  }

  return '/painel';
};

export const resolvePostAuthRedirectPath = async (): Promise<string> => {
  const context = await getCurrentSessionContext();

  if (!context) {
    return '/login';
  }

  return getPostAuthRedirectPath(context);
};

export const signOutCurrentUser = async (): Promise<void> => {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};
