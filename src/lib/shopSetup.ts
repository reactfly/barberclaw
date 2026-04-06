import { getCurrentSessionContext, type BarbershopRecord } from './auth';
import { getSupabaseClient } from './supabase';

export interface BusinessHourRecord {
  id: string;
  shop_id: string;
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_open: boolean;
}

export interface ServiceRecord {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  badge: string | null;
  is_active: boolean;
  display_order: number;
}

export interface ShopSetupSnapshot {
  shop: BarbershopRecord | null;
  businessHours: BusinessHourRecord[];
  services: ServiceRecord[];
}

export interface ShopSetupPayload {
  shop: {
    name: string;
    description: string;
    documentNumber: string;
    phone: string;
    whatsapp: string;
    instagramHandle: string;
    postalCode: string;
    addressLine: string;
    neighborhood: string;
    city: string;
    state: string;
    countryCode: string;
    isPremium: boolean;
  };
  businessHours: Array<{
    day_of_week: number;
    is_open: boolean;
    opens_at: string | null;
    closes_at: string | null;
  }>;
  services: Array<{
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    badge: string;
    display_order: number;
  }>;
  ownerPhone?: string;
}

const SHOP_WITH_CHILDREN_SELECT = `
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
  updated_at,
  business_hours (
    id,
    shop_id,
    day_of_week,
    opens_at,
    closes_at,
    is_open
  ),
  services (
    id,
    shop_id,
    name,
    description,
    price,
    duration_minutes,
    badge,
    is_active,
    display_order
  )
`;

type ShopWithChildren = BarbershopRecord & {
  business_hours?: BusinessHourRecord[] | null;
  services?: ServiceRecord[] | null;
};

const normalizeSlug = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeText = (value: string) => value.trim();

const getUniqueSlug = async (name: string, currentShopId?: string) => {
  const supabase = await getSupabaseClient();
  const baseSlug = normalizeSlug(name) || `barbearia-${Date.now()}`;
  let candidate = baseSlug;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data, error } = await supabase
      .from('barbershops')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle<{ id: string }>();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data || data.id === currentShopId) {
      return candidate;
    }

    candidate = `${baseSlug}-${attempt + 2}`;
  }

  return `${baseSlug}-${Date.now().toString().slice(-4)}`;
};

export const loadCurrentOwnerSetup = async (): Promise<ShopSetupSnapshot> => {
  const context = await getCurrentSessionContext();
  if (!context) {
    throw new Error('Voce precisa estar logado para continuar.');
  }

  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('barbershops')
    .select(SHOP_WITH_CHILDREN_SELECT)
    .eq('owner_id', context.profile.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<ShopWithChildren>();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data) {
    return {
      shop: null,
      businessHours: [],
      services: [],
    };
  }

  const { business_hours, services, ...shop } = data;

  return {
    shop,
    businessHours: [...(business_hours ?? [])].sort((a, b) => a.day_of_week - b.day_of_week),
    services: [...(services ?? [])].sort((a, b) => a.display_order - b.display_order),
  };
};

export const saveCurrentOwnerSetup = async (payload: ShopSetupPayload): Promise<BarbershopRecord> => {
  const context = await getCurrentSessionContext();
  if (!context) {
    throw new Error('Voce precisa estar logado para continuar.');
  }

  if (context.profile.role !== 'owner' && context.profile.role !== 'admin') {
    throw new Error('Somente contas de barbearia podem concluir esse onboarding.');
  }

  const supabase = await getSupabaseClient();
  const existingShop = context.primaryBarbershop ?? (await loadCurrentOwnerSetup()).shop;
  const slug = await getUniqueSlug(payload.shop.name, existingShop?.id);

  const barbershopInput = {
    owner_id: context.profile.id,
    name: normalizeText(payload.shop.name),
    slug: existingShop?.slug ?? slug,
    description: normalizeText(payload.shop.description) || null,
    phone: normalizeText(payload.shop.phone) || null,
    whatsapp: normalizeText(payload.shop.whatsapp) || null,
    instagram_handle: normalizeText(payload.shop.instagramHandle).replace(/^@+/, '') || null,
    document_number: normalizeText(payload.shop.documentNumber) || null,
    postal_code: normalizeText(payload.shop.postalCode) || null,
    address_line: normalizeText(payload.shop.addressLine),
    neighborhood: normalizeText(payload.shop.neighborhood) || null,
    city: normalizeText(payload.shop.city),
    state: normalizeText(payload.shop.state).toUpperCase(),
    country_code: normalizeText(payload.shop.countryCode).toUpperCase() || 'BR',
    is_premium: payload.shop.isPremium,
  };

  let savedShop: BarbershopRecord | null = null;

  if (existingShop) {
    const { data, error } = await supabase
      .from('barbershops')
      .update(barbershopInput)
      .eq('id', existingShop.id)
      .select()
      .single<BarbershopRecord>();

    if (error) {
      throw error;
    }

    savedShop = data;
  } else {
    const { data, error } = await supabase
      .from('barbershops')
      .insert(barbershopInput)
      .select()
      .single<BarbershopRecord>();

    if (error) {
      throw error;
    }

    savedShop = data;
  }

  if (!savedShop) {
    throw new Error('Nao foi possivel salvar os dados da sua barbearia.');
  }

  const cleanedHours = payload.businessHours.map((entry) => ({
    shop_id: savedShop.id,
    day_of_week: entry.day_of_week,
    is_open: entry.is_open,
    opens_at: entry.is_open ? entry.opens_at : null,
    closes_at: entry.is_open ? entry.closes_at : null,
  }));

  const cleanedServices = payload.services
    .filter((service) => normalizeText(service.name).length > 0)
    .map((service) => ({
      shop_id: savedShop.id,
      name: normalizeText(service.name),
      description: normalizeText(service.description) || null,
      price: service.price,
      duration_minutes: service.duration_minutes,
      badge: normalizeText(service.badge) || null,
      is_active: true,
      display_order: service.display_order,
    }));

  const deleteHoursRequest = supabase.from('business_hours').delete().eq('shop_id', savedShop.id);
  const deleteServicesRequest = supabase.from('services').delete().eq('shop_id', savedShop.id);
  const [deletedHours, deletedServices] = await Promise.all([deleteHoursRequest, deleteServicesRequest]);

  if (deletedHours.error) {
    throw deletedHours.error;
  }

  if (deletedServices.error) {
    throw deletedServices.error;
  }

  if (cleanedHours.length > 0) {
    const { error } = await supabase.from('business_hours').insert(cleanedHours);
    if (error) {
      throw error;
    }
  }

  if (cleanedServices.length > 0) {
    const { error } = await supabase.from('services').insert(cleanedServices);
    if (error) {
      throw error;
    }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      phone: normalizeText(payload.ownerPhone ?? '') || context.profile.phone,
      onboarding_completed: true,
      primary_barbershop_id: savedShop.id,
    })
    .eq('id', context.profile.id);

  if (profileError) {
    throw profileError;
  }

  return savedShop;
};
