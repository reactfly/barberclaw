import { format, isToday, parseISO } from 'date-fns';
import { getBarbershopById, getCurrentSessionContext, type BarbershopRecord, type ProfileRecord } from './auth';
import { getSupabaseClient } from './supabase';

export type MembershipRole = 'owner' | 'manager' | 'barber' | 'assistant';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
const ADMIN_SELECTED_SHOP_STORAGE_KEY = 'barberflow_admin_selected_shop_id';

export interface AdminContext {
  profile: ProfileRecord;
  shop: BarbershopRecord | null;
  availableShops: BarbershopRecord[];
  isPlatformAdmin: boolean;
  membershipRole: MembershipRole | null;
  canManageShop: boolean;
}

export interface AdminBusinessHour {
  id: string;
  shop_id: string;
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_open: boolean;
}

export interface AdminService {
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

export interface AdminBarber {
  id: string;
  shop_id: string;
  membership_id: string | null;
  profile_id: string | null;
  name: string;
  role_label: string | null;
  specialty: string | null;
  experience_label: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export interface AdminAppointment {
  id: string;
  shop_id: string;
  service_id: string | null;
  barber_id: string | null;
  customer_profile_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
}

export interface AdminBlockedSlot {
  id: string;
  shop_id: string;
  barber_id: string | null;
  blocked_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  created_by: string | null;
}

export interface AdminReview {
  id: string;
  shop_id: string;
  appointment_id: string | null;
  customer_profile_id: string | null;
  customer_name: string;
  customer_role: string | null;
  rating: number;
  review_text: string;
  avatar_url: string | null;
  status: 'pending' | 'published' | 'hidden';
  created_at: string;
}

export interface DashboardAppointmentItem {
  id: string;
  customerName: string;
  serviceName: string;
  barberName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  amount: number;
  appointmentDate: string;
}

export interface DashboardData {
  context: AdminContext;
  revenueToday: number;
  appointmentsToday: number;
  appointmentsCapacity: number;
  newCustomersToday: number;
  upcomingAppointments: DashboardAppointmentItem[];
}

export interface SettingsData {
  context: AdminContext;
  businessHours: AdminBusinessHour[];
}

export interface StaffData {
  context: AdminContext;
  barbers: AdminBarber[];
  services: AdminService[];
}

export interface InviteStaffPayload {
  fullName: string;
  email: string;
  membershipRole: MembershipRole;
  roleLabel: string;
  specialty: string;
  experienceLabel: string;
  avatarUrl: string;
  commissionRate: number;
  createBarberProfile: boolean;
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  totalVisits: number;
  averageRating: number | null;
  lastService: string;
}

export interface CalendarData {
  context: AdminContext;
  barbers: AdminBarber[];
  services: AdminService[];
  appointments: AdminAppointment[];
  blockedSlots: AdminBlockedSlot[];
  businessHours: AdminBusinessHour[];
}

type MembershipLookup = {
  shop_id: string;
  role: MembershipRole;
};

const slugifyValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isNoRowsError = (error: { code?: string } | null) => error?.code === 'PGRST116';
const appointmentDateTimeValue = (appointment: AdminAppointment) =>
  `${appointment.appointment_date}T${appointment.start_time}`;

const addMinutesToTime = (time: string, minutes: number) => {
  const [hour, minute] = time.split(':').map(Number);
  const totalMinutes = hour * 60 + minute + minutes;
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(normalized / 60);
  const nextMinute = normalized % 60;
  return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}:00`;
};

const stripSeconds = (time: string | null | undefined, fallback = '00:00') =>
  time ? time.slice(0, 5) : fallback;

const getSessionAccessToken = async () => {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error('Sua sessao expirou. Faca login novamente para continuar.');
  }

  return accessToken;
};

const readStoredAdminShopId = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(ADMIN_SELECTED_SHOP_STORAGE_KEY) ?? '';
};

const storeAdminShopId = (shopId: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (shopId) {
    window.localStorage.setItem(ADMIN_SELECTED_SHOP_STORAGE_KEY, shopId);
    return;
  }

  window.localStorage.removeItem(ADMIN_SELECTED_SHOP_STORAGE_KEY);
};

const getCapacityFromHours = (hours: AdminBusinessHour[], date: Date) => {
  const day = hours.find((entry) => entry.day_of_week === date.getDay() && entry.is_open);
  if (!day?.opens_at || !day?.closes_at) {
    return 0;
  }

  const [startHour, startMinute] = day.opens_at.split(':').map(Number);
  const [endHour, endMinute] = day.closes_at.split(':').map(Number);
  return Math.max(0, endHour * 2 + Math.floor(endMinute / 30) - (startHour * 2 + Math.floor(startMinute / 30)));
};

export const getAdminContext = async (): Promise<AdminContext> => {
  const session = await getCurrentSessionContext();
  if (!session) {
    throw new Error('Voce precisa estar logado para acessar o painel admin.');
  }

  const supabase = await getSupabaseClient();
  const isPlatformAdmin = session.profile.role === 'admin';
  let shop = session.primaryBarbershop;
  let membershipRole: MembershipRole | null = null;

  const { data: memberships, error: membershipError } = await supabase
    .from('barbershop_memberships')
    .select('shop_id, role')
    .eq('profile_id', session.profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (membershipError) {
    throw membershipError;
  }

  const membershipItems = ((memberships ?? []) as MembershipLookup[]);
  const primaryMembership = membershipItems[0] ?? null;
  const membershipShopIds = Array.from(new Set(membershipItems.map((item) => item.shop_id)));
  membershipRole = primaryMembership?.role ?? null;

  const { data: ownedShops, error: ownedShopsError } = await supabase
    .from('barbershops')
    .select('*')
    .eq('owner_id', session.profile.id)
    .order('name', { ascending: true });

  if (ownedShopsError) {
    throw ownedShopsError;
  }

  const { data: membershipShops, error: membershipShopsError } = membershipShopIds.length
    ? await supabase
        .from('barbershops')
        .select('*')
        .in('id', membershipShopIds)
        .order('name', { ascending: true })
    : { data: [], error: null };

  if (membershipShopsError) {
    throw membershipShopsError;
  }

  const availableShopsMap = new Map<string, BarbershopRecord>();
  for (const item of [session.primaryBarbershop, ...(ownedShops ?? []), ...(membershipShops ?? [])]) {
    if (item?.id) {
      availableShopsMap.set(item.id, item as BarbershopRecord);
    }
  }

  const availableShops = Array.from(availableShopsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR')
  );

  const storedShopId = readStoredAdminShopId();
  if (!shop && primaryMembership) {
    shop = await getBarbershopById(primaryMembership.shop_id);
  }

  if (storedShopId) {
    const storedShop = availableShops.find((item) => item.id === storedShopId) ?? null;
    if (storedShop) {
      shop = storedShop;
      membershipRole =
        membershipItems.find((item) => item.shop_id === storedShop.id)?.role ?? membershipRole;
    }
  }

  if (!shop && availableShops.length > 0) {
    shop = availableShops[0];
    membershipRole =
      membershipItems.find((item) => item.shop_id === shop?.id)?.role ?? membershipRole;
  }

  if (!shop && !isPlatformAdmin) {
    throw new Error('Sua conta ainda nao esta vinculada a nenhuma barbearia.');
  }

  const canManageShop =
    isPlatformAdmin ||
    session.profile.role === 'owner' ||
    membershipRole === 'owner' ||
    membershipRole === 'manager';

  if (shop) {
    storeAdminShopId(shop.id);
  }

  return {
    profile: session.profile,
    shop,
    availableShops,
    isPlatformAdmin,
    membershipRole,
    canManageShop,
  };
};

export const switchAdminShop = async (profileId: string, shopId: string): Promise<void> => {
  storeAdminShopId(shopId);

  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from('profiles')
    .update({ primary_barbershop_id: shopId || null })
    .eq('id', profileId);

  if (error) {
    throw error;
  }
};

export const getShopBusinessHours = async (shopId: string): Promise<AdminBusinessHour[]> => {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .eq('shop_id', shopId)
    .order('day_of_week', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminBusinessHour[];
};

export const getShopServices = async (shopId: string): Promise<AdminService[]> => {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('shop_id', shopId)
    .order('display_order', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminService[];
};

export const getShopBarbers = async (shopId: string): Promise<AdminBarber[]> => {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminBarber[];
};

export const getShopAppointments = async (
  shopId: string,
  options?: {
    fromDate?: string;
    toDate?: string;
    limit?: number;
  }
): Promise<AdminAppointment[]> => {
  const supabase = await getSupabaseClient();
  let query = supabase
    .from('appointments')
    .select('*')
    .eq('shop_id', shopId)
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (options?.fromDate) {
    query = query.gte('appointment_date', options.fromDate);
  }

  if (options?.toDate) {
    query = query.lte('appointment_date', options.toDate);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminAppointment[];
};

export const getShopBlockedSlots = async (
  shopId: string,
  date?: string
): Promise<AdminBlockedSlot[]> => {
  const supabase = await getSupabaseClient();
  let query = supabase
    .from('blocked_slots')
    .select('*')
    .eq('shop_id', shopId)
    .order('blocked_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (date) {
    query = query.eq('blocked_date', date);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminBlockedSlot[];
};

export const getShopReviews = async (shopId: string): Promise<AdminReview[]> => {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminReview[];
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const context = await getAdminContext();
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  if (!context.shop) {
    return {
      context,
      revenueToday: 0,
      appointmentsToday: 0,
      appointmentsCapacity: 0,
      newCustomersToday: 0,
      upcomingAppointments: [],
    };
  }

  const [hours, appointments, services, barbers] = await Promise.all([
    getShopBusinessHours(context.shop.id),
    getShopAppointments(context.shop.id, { fromDate: todayDate, limit: 120 }),
    getShopServices(context.shop.id),
    getShopBarbers(context.shop.id),
  ]);

  const todayAppointments = appointments.filter((appointment) => appointment.appointment_date === todayDate);
  const activeToday = todayAppointments.filter((appointment) => appointment.status !== 'cancelled');
  const serviceMap = new Map(services.map((service) => [service.id, service]));
  const barberMap = new Map(barbers.map((barber) => [barber.id, barber]));

  const revenueToday = activeToday.reduce((sum, appointment) => {
    const service = appointment.service_id ? serviceMap.get(appointment.service_id) : null;
    return sum + (service?.price ?? 0);
  }, 0);

  const allAppointmentsSorted = [...appointments].sort((a, b) =>
    appointmentDateTimeValue(a).localeCompare(appointmentDateTimeValue(b))
  );
  const seenCustomers = new Map<string, string>();

  for (const appointment of allAppointmentsSorted) {
    const customerKey = appointment.customer_profile_id || appointment.customer_phone || appointment.customer_email || appointment.customer_name;
    if (!seenCustomers.has(customerKey)) {
      seenCustomers.set(customerKey, appointment.appointment_date);
    }
  }

  const newCustomersToday = Array.from(seenCustomers.values()).filter((date) => date === todayDate).length;

  const upcomingAppointments = appointments
    .filter((appointment) => appointment.status !== 'cancelled')
    .sort((a, b) => appointmentDateTimeValue(a).localeCompare(appointmentDateTimeValue(b)))
    .slice(0, 8)
    .map((appointment) => ({
      id: appointment.id,
      customerName: appointment.customer_name,
      serviceName: appointment.service_id ? serviceMap.get(appointment.service_id)?.name ?? 'Servico' : 'Servico livre',
      barberName: appointment.barber_id ? barberMap.get(appointment.barber_id)?.name ?? 'Profissional' : 'Sem profissional',
      startTime: stripSeconds(appointment.start_time),
      endTime: stripSeconds(appointment.end_time),
      status: appointment.status,
      amount: appointment.service_id ? serviceMap.get(appointment.service_id)?.price ?? 0 : 0,
      appointmentDate: appointment.appointment_date,
    }));

  return {
    context,
    revenueToday,
    appointmentsToday: activeToday.length,
    appointmentsCapacity: getCapacityFromHours(hours, new Date()),
    newCustomersToday,
    upcomingAppointments,
  };
};

export const getSettingsData = async (): Promise<SettingsData> => {
  const context = await getAdminContext();
  const businessHours = context.shop ? await getShopBusinessHours(context.shop.id) : [];

  return {
    context,
    businessHours,
  };
};

export const createManagedBarbershop = async (payload: {
  name: string;
  description: string;
  phone: string;
  whatsapp: string;
  instagramHandle: string;
  documentNumber: string;
  postalCode: string;
  addressLine: string;
  neighborhood: string;
  city: string;
  state: string;
}): Promise<BarbershopRecord> => {
  const context = await getAdminContext();
  const supabase = await getSupabaseClient();
  const baseSlug = slugifyValue(payload.name) || 'barbearia';
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data, error } = await supabase
      .from('barbershops')
      .select('id')
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();

    if (error && !isNoRowsError(error)) {
      throw error;
    }

    if (!data) {
      break;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const { data: createdShop, error: createError } = await supabase
    .from('barbershops')
    .insert({
      owner_id: context.profile.id,
      name: payload.name.trim(),
      slug,
      description: payload.description.trim() || null,
      phone: payload.phone.trim() || null,
      whatsapp: payload.whatsapp.trim() || null,
      instagram_handle: payload.instagramHandle.trim().replace(/^@+/, '') || null,
      document_number: payload.documentNumber.trim() || null,
      postal_code: payload.postalCode.trim() || null,
      address_line: payload.addressLine.trim(),
      neighborhood: payload.neighborhood.trim() || null,
      city: payload.city.trim(),
      state: payload.state.trim().toUpperCase(),
      country_code: 'BR',
      is_active: true,
    })
    .select('*')
    .single<BarbershopRecord>();

  if (createError) {
    throw createError;
  }

  const defaultBusinessHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
    shop_id: createdShop.id,
    day_of_week: dayOfWeek,
    is_open: dayOfWeek !== 0,
    opens_at: dayOfWeek !== 0 ? '09:00:00' : null,
    closes_at: dayOfWeek !== 0 ? (dayOfWeek === 6 ? '17:00:00' : '19:00:00') : null,
  }));

  const { error: businessHoursError } = await supabase
    .from('business_hours')
    .insert(defaultBusinessHours);

  if (businessHoursError) {
    throw businessHoursError;
  }

  await switchAdminShop(context.profile.id, createdShop.id);
  return createdShop;
};

export const saveShopSettings = async (payload: {
  name: string;
  description: string;
  phone: string;
  whatsapp: string;
  instagramHandle: string;
  documentNumber: string;
  postalCode: string;
  addressLine: string;
  neighborhood: string;
  city: string;
  state: string;
  businessHours: Array<{
    day_of_week: number;
    is_open: boolean;
    opens_at: string | null;
    closes_at: string | null;
  }>;
}): Promise<void> => {
  const context = await getAdminContext();
  if (!context.shop) {
    throw new Error('Selecione ou cadastre uma barbearia antes de salvar configuracoes.');
  }
  const shop = context.shop;
  if (!context.canManageShop) {
    throw new Error('Sua conta possui acesso somente leitura para esta barbearia.');
  }

  const supabase = await getSupabaseClient();

  const { error: shopError } = await supabase
    .from('barbershops')
    .update({
      name: payload.name.trim(),
      description: payload.description.trim() || null,
      phone: payload.phone.trim() || null,
      whatsapp: payload.whatsapp.trim() || null,
      instagram_handle: payload.instagramHandle.trim().replace(/^@+/, '') || null,
      document_number: payload.documentNumber.trim() || null,
      postal_code: payload.postalCode.trim() || null,
      address_line: payload.addressLine.trim(),
      neighborhood: payload.neighborhood.trim() || null,
      city: payload.city.trim(),
      state: payload.state.trim().toUpperCase(),
    })
    .eq('id', shop.id);

  if (shopError) {
    throw shopError;
  }

  const { error: deleteError } = await supabase
    .from('business_hours')
    .delete()
    .eq('shop_id', shop.id);

  if (deleteError) {
    throw deleteError;
  }

  const cleanedHours = payload.businessHours.map((entry) => ({
    shop_id: shop.id,
    day_of_week: entry.day_of_week,
    is_open: entry.is_open,
    opens_at: entry.is_open ? entry.opens_at : null,
    closes_at: entry.is_open ? entry.closes_at : null,
  }));

  const { error: hoursError } = await supabase.from('business_hours').insert(cleanedHours);
  if (hoursError) {
    throw hoursError;
  }
};

export const getStaffData = async (): Promise<StaffData> => {
  const context = await getAdminContext();
  if (!context.shop) {
    return {
      context,
      barbers: [],
      services: [],
    };
  }
  const [barbers, services] = await Promise.all([
    getShopBarbers(context.shop.id),
    getShopServices(context.shop.id),
  ]);

  return {
    context,
    barbers,
    services,
  };
};

export const inviteStaffMember = async (payload: InviteStaffPayload): Promise<void> => {
  const context = await getAdminContext();
  if (!context.shop) {
    throw new Error('Selecione uma barbearia antes de convidar colaboradores.');
  }
  if (!context.canManageShop) {
    throw new Error('Sua conta possui acesso somente leitura para esta barbearia.');
  }

  const accessToken = await getSessionAccessToken();
  const response = await fetch('/api/invite-staff', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ...payload,
      shopId: context.shop.id,
      redirectTo: `${window.location.origin}/admin`,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!response.ok || body.ok === false) {
    throw new Error(body.error || 'Nao foi possivel convidar o colaborador.');
  }
};

export const createBarber = async (payload: {
  name: string;
  roleLabel: string;
  specialty: string;
  experienceLabel: string;
  avatarUrl: string;
}): Promise<void> => {
  const context = await getAdminContext();
  if (!context.shop) {
    throw new Error('Selecione uma barbearia antes de cadastrar profissionais.');
  }
  if (!context.canManageShop) {
    throw new Error('Sua conta possui acesso somente leitura para esta barbearia.');
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase.from('barbers').insert({
    shop_id: context.shop.id,
    name: payload.name.trim(),
    role_label: payload.roleLabel.trim() || null,
    specialty: payload.specialty.trim() || null,
    experience_label: payload.experienceLabel.trim() || null,
    avatar_url: payload.avatarUrl.trim() || null,
    is_active: true,
  });

  if (error) {
    throw error;
  }
};

export const updateBarber = async (
  barberId: string,
  payload: {
    name: string;
    roleLabel: string;
    specialty: string;
    experienceLabel: string;
    avatarUrl: string;
    isActive: boolean;
  }
): Promise<void> => {
  const context = await getAdminContext();
  if (!context.shop) {
    throw new Error('Selecione uma barbearia antes de editar profissionais.');
  }
  if (!context.canManageShop) {
    throw new Error('Sua conta possui acesso somente leitura para esta barbearia.');
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from('barbers')
    .update({
      name: payload.name.trim(),
      role_label: payload.roleLabel.trim() || null,
      specialty: payload.specialty.trim() || null,
      experience_label: payload.experienceLabel.trim() || null,
      avatar_url: payload.avatarUrl.trim() || null,
      is_active: payload.isActive,
    })
    .eq('id', barberId)
    .eq('shop_id', context.shop.id);

  if (error) {
    throw error;
  }
};

export const deleteBarber = async (barberId: string): Promise<void> => {
  const context = await getAdminContext();
  if (!context.shop) {
    throw new Error('Selecione uma barbearia antes de remover profissionais.');
  }
  if (!context.canManageShop) {
    throw new Error('Sua conta possui acesso somente leitura para esta barbearia.');
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from('barbers')
    .delete()
    .eq('id', barberId)
    .eq('shop_id', context.shop.id);

  if (error) {
    throw error;
  }
};

export const createService = async (payload: {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  badge: string;
}): Promise<void> => {
  const context = await getAdminContext();
  if (!context.shop) {
    throw new Error('Selecione uma barbearia antes de cadastrar servicos.');
  }
  if (!context.canManageShop) {
    throw new Error('Sua conta possui acesso somente leitura para esta barbearia.');
  }

  const services = await getShopServices(context.shop.id);
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from('services').insert({
    shop_id: context.shop.id,
    name: payload.name.trim(),
    description: payload.description.trim() || null,
    price: payload.price,
    duration_minutes: payload.durationMinutes,
    badge: payload.badge.trim() || null,
    is_active: true,
    display_order: services.length,
  });

  if (error) {
    throw error;
  }
};

export const updateService = async (
  serviceId: string,
  payload: {
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    badge: string;
    isActive: boolean;
  }
): Promise<void> => {
  const context = await getAdminContext();
  if (!context.shop) {
    throw new Error('Selecione uma barbearia antes de editar servicos.');
  }
  if (!context.canManageShop) {
    throw new Error('Sua conta possui acesso somente leitura para esta barbearia.');
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from('services')
    .update({
      name: payload.name.trim(),
      description: payload.description.trim() || null,
      price: payload.price,
      duration_minutes: payload.durationMinutes,
      badge: payload.badge.trim() || null,
      is_active: payload.isActive,
    })
    .eq('id', serviceId)
    .eq('shop_id', context.shop.id);

  if (error) {
    throw error;
  }
};

export const deleteService = async (serviceId: string): Promise<void> => {
  const context = await getAdminContext();
  if (!context.shop) {
    throw new Error('Selecione uma barbearia antes de remover servicos.');
  }
  if (!context.canManageShop) {
    throw new Error('Sua conta possui acesso somente leitura para esta barbearia.');
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)
    .eq('shop_id', context.shop.id);

  if (error) {
    throw error;
  }
};

export const getCustomersData = async (): Promise<{
  context: AdminContext;
  customers: CustomerSummary[];
}> => {
  const context = await getAdminContext();
  if (!context.shop) {
    return {
      context,
      customers: [],
    };
  }
  const [appointments, reviews, services] = await Promise.all([
    getShopAppointments(context.shop.id, { limit: 1000 }),
    getShopReviews(context.shop.id),
    getShopServices(context.shop.id),
  ]);

  const serviceMap = new Map(services.map((service) => [service.id, service.name]));
  const grouped = new Map<string, CustomerSummary & { ratingSum: number; ratingCount: number }>();

  for (const appointment of appointments) {
    const key =
      appointment.customer_profile_id ||
      appointment.customer_phone ||
      appointment.customer_email ||
      appointment.customer_name;

    const current = grouped.get(key);
    const appointmentDateValue = parseISO(`${appointment.appointment_date}T${appointment.start_time}`);
    const lastService = appointment.service_id ? serviceMap.get(appointment.service_id) ?? 'Servico' : 'Servico livre';

    if (!current) {
      grouped.set(key, {
        id: key,
        name: appointment.customer_name,
        email: appointment.customer_email ?? 'Nao informado',
        phone: appointment.customer_phone,
        lastVisit: appointment.appointment_date,
        totalVisits: 1,
        averageRating: null,
        lastService,
        ratingSum: 0,
        ratingCount: 0,
      });
      continue;
    }

    current.totalVisits += 1;
    if (appointmentDateValue > parseISO(`${current.lastVisit}T00:00:00`)) {
      current.lastVisit = appointment.appointment_date;
      current.lastService = lastService;
      current.email = appointment.customer_email ?? current.email;
      current.phone = appointment.customer_phone || current.phone;
      current.name = appointment.customer_name || current.name;
    }
  }

  for (const review of reviews) {
    const entry = Array.from(grouped.values()).find((customer) => customer.name === review.customer_name);
    if (entry) {
      entry.ratingSum += review.rating;
      entry.ratingCount += 1;
      entry.averageRating = Number((entry.ratingSum / entry.ratingCount).toFixed(1));
    }
  }

  const customers = Array.from(grouped.values())
    .map(({ ratingSum: _ratingSum, ratingCount: _ratingCount, ...customer }) => customer)
    .sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));

  return {
    context,
    customers,
  };
};

export const getCalendarData = async (date: string): Promise<CalendarData> => {
  const context = await getAdminContext();
  if (!context.shop) {
    return {
      context,
      barbers: [],
      services: [],
      appointments: [],
      blockedSlots: [],
      businessHours: [],
    };
  }
  const [barbers, services, appointments, blockedSlots, businessHours] = await Promise.all([
    getShopBarbers(context.shop.id),
    getShopServices(context.shop.id),
    getShopAppointments(context.shop.id, { fromDate: date, toDate: date, limit: 200 }),
    getShopBlockedSlots(context.shop.id, date),
    getShopBusinessHours(context.shop.id),
  ]);

  return {
    context,
    barbers,
    services,
    appointments,
    blockedSlots,
    businessHours,
  };
};

export const createAppointment = async (payload: {
  appointmentDate: string;
  startTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  barberId: string;
  notes: string;
}): Promise<void> => {
  const context = await getAdminContext();
  if (!context.shop) {
    throw new Error('Selecione uma barbearia antes de criar agendamentos.');
  }
  const service = (await getShopServices(context.shop.id)).find((item) => item.id === payload.serviceId);

  if (!service) {
    throw new Error('Selecione um servico valido.');
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase.from('appointments').insert({
    shop_id: context.shop.id,
    service_id: payload.serviceId,
    barber_id: payload.barberId || null,
    customer_name: payload.customerName.trim(),
    customer_email: payload.customerEmail.trim() || null,
    customer_phone: payload.customerPhone.trim(),
    appointment_date: payload.appointmentDate,
    start_time: payload.startTime.length === 5 ? `${payload.startTime}:00` : payload.startTime,
    end_time: addMinutesToTime(payload.startTime, service.duration_minutes),
    notes: payload.notes.trim() || null,
    status: 'confirmed',
  });

  if (error) {
    throw error;
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> => {
  const context = await getAdminContext();
  if (!context.shop) {
    throw new Error('Selecione uma barbearia antes de atualizar agendamentos.');
  }
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('shop_id', context.shop.id);

  if (error) {
    throw error;
  }
};

export const createBlockedSlot = async (payload: {
  blockedDate: string;
  startTime: string;
  endTime: string;
  barberId: string;
  reason: string;
}): Promise<void> => {
  const context = await getAdminContext();
  if (!context.shop) {
    throw new Error('Selecione uma barbearia antes de bloquear horarios.');
  }
  if (!context.canManageShop) {
    throw new Error('Sua conta possui acesso somente leitura para esta barbearia.');
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase.from('blocked_slots').insert({
    shop_id: context.shop.id,
    barber_id: payload.barberId || null,
    blocked_date: payload.blockedDate,
    start_time: payload.startTime.length === 5 ? `${payload.startTime}:00` : payload.startTime,
    end_time: payload.endTime.length === 5 ? `${payload.endTime}:00` : payload.endTime,
    reason: payload.reason.trim() || null,
    created_by: context.profile.id,
  });

  if (error) {
    throw error;
  }
};

export const getStatusMeta = (status: AppointmentStatus) => {
  switch (status) {
    case 'confirmed':
      return 'bg-lime-400/20 text-lime-400';
    case 'completed':
      return 'bg-sky-400/20 text-sky-300';
    case 'cancelled':
      return 'bg-red-400/20 text-red-300';
    case 'no_show':
      return 'bg-orange-400/20 text-orange-300';
    case 'pending':
    default:
      return 'bg-yellow-400/20 text-yellow-300';
  }
};

export const formatAppointmentDateLabel = (date: string) =>
  isToday(parseISO(`${date}T00:00:00`)) ? 'Hoje' : format(parseISO(`${date}T00:00:00`), 'dd/MM/yyyy');
