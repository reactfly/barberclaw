import {
  MARKETPLACE_BARBERSHOPS,
  type MarketplaceBarber,
  type MarketplaceBarbershop,
  type MarketplaceReview,
  type MarketplaceService,
} from '../data/marketplace';
import { getSupabaseClient } from './supabase';

interface SupabaseHourRow {
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_open: boolean;
}

interface SupabaseServiceRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  badge: string | null;
  is_active: boolean;
  display_order: number;
}

interface SupabaseBarberRow {
  id: string;
  name: string;
  role_label: string | null;
  specialty: string | null;
  experience_label: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

interface SupabaseReviewRow {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

interface SupabaseShopRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address_line: string;
  neighborhood: string | null;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  is_featured: boolean;
  is_premium: boolean;
  business_hours?: SupabaseHourRow[] | null;
  services?: SupabaseServiceRow[] | null;
  barbers?: SupabaseBarberRow[] | null;
  reviews?: SupabaseReviewRow[] | null;
}

const SHOP_SELECT = `
  id,
  slug,
  name,
  description,
  phone,
  whatsapp,
  address_line,
  neighborhood,
  city,
  state,
  latitude,
  longitude,
  is_featured,
  is_premium,
  business_hours (
    day_of_week,
    opens_at,
    closes_at,
    is_open
  ),
  services (
    id,
    name,
    description,
    price,
    duration_minutes,
    badge,
    is_active,
    display_order
  ),
  barbers (
    id,
    name,
    role_label,
    specialty,
    experience_label,
    avatar_url,
    is_active
  ),
  reviews (
    id,
    customer_name,
    rating,
    review_text,
    created_at
  )
`;

const DEFAULT_COORDINATES = { lat: -23.5614, lng: -46.6559 };
const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const fallbackMedia = MARKETPLACE_BARBERSHOPS[0];

const formatHours = (hours: SupabaseHourRow[] | null | undefined) => {
  const active = (hours ?? []).filter((entry) => entry.is_open);
  if (active.length === 0) {
    return undefined;
  }

  const sorted = [...active].sort((a, b) => a.day_of_week - b.day_of_week);
  return {
    open: sorted[0]?.opens_at?.slice(0, 5) ?? '09:00',
    close: sorted[sorted.length - 1]?.closes_at?.slice(0, 5) ?? '18:00',
    days: `${DAY_LABELS[sorted[0].day_of_week]} - ${DAY_LABELS[sorted[sorted.length - 1].day_of_week]}`,
  };
};

const computeOpenState = (hours: SupabaseHourRow[] | null | undefined) => {
  const now = new Date();
  const today = (hours ?? []).find((entry) => entry.day_of_week === now.getDay());

  if (!today || !today.is_open || !today.opens_at || !today.closes_at) {
    return { isOpen: false, closesAt: 'Fechado' };
  }

  const current = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMinute] = today.opens_at.split(':').map(Number);
  const [closeHour, closeMinute] = today.closes_at.split(':').map(Number);
  const opensAt = openHour * 60 + openMinute;
  const closesAt = closeHour * 60 + closeMinute;

  return {
    isOpen: current >= opensAt && current < closesAt,
    closesAt: today.closes_at.slice(0, 5),
  };
};

const mapServices = (services: SupabaseServiceRow[] | null | undefined): MarketplaceService[] => {
  const active = (services ?? [])
    .filter((service) => service.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  if (active.length === 0) {
    return fallbackMedia.services;
  }

  return active.map((service) => ({
    id: service.id,
    name: service.name,
    price: Number(service.price),
    duration: service.duration_minutes,
    description: service.description ?? 'Servico cadastrado pela barbearia.',
    badge: service.badge ?? undefined,
  }));
};

const mapBarbers = (barbers: SupabaseBarberRow[] | null | undefined): MarketplaceBarber[] => {
  const active = (barbers ?? []).filter((barber) => barber.is_active);
  if (active.length === 0) {
    return fallbackMedia.barbers;
  }

  return active.map((barber) => ({
    id: barber.id,
    name: barber.name,
    avatar: barber.avatar_url ?? '',
    role: barber.role_label ?? 'Barbeiro',
    specialty: barber.specialty ?? 'Atendimento personalizado',
    experience: barber.experience_label ?? 'Experiencia nao informada',
  }));
};

const mapReviews = (reviews: SupabaseReviewRow[] | null | undefined): MarketplaceReview[] => {
  const sorted = [...(reviews ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (sorted.length === 0) {
    return fallbackMedia.reviewsList;
  }

  return sorted.slice(0, 6).map((review) => ({
    id: review.id,
    name: review.customer_name,
    rating: review.rating,
    text: review.review_text,
    date: new Date(review.created_at).toLocaleDateString('pt-BR'),
    service: 'Atendimento',
  }));
};

const getAverageRating = (reviews: SupabaseReviewRow[] | null | undefined) => {
  const items = reviews ?? [];
  if (items.length === 0) {
    return fallbackMedia.rating;
  }

  const total = items.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / items.length).toFixed(1));
};

const mapShop = (shop: SupabaseShopRow): MarketplaceBarbershop => {
  const services = mapServices(shop.services);
  const barbers = mapBarbers(shop.barbers);
  const reviewsList = mapReviews(shop.reviews);
  const rating = getAverageRating(shop.reviews);
  const hours = formatHours(shop.business_hours);
  const openState = computeOpenState(shop.business_hours);
  const tags = Array.from(
    new Set(
      services
        .flatMap((service) => service.name.split(/[+/,-]/))
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 4)
    )
  );

  return {
    id: shop.id,
    source: 'supabase',
    slug: shop.slug,
    name: shop.name,
    neighborhood: shop.neighborhood ?? 'Regiao central',
    city: shop.city,
    state: shop.state,
    address: [shop.address_line, shop.neighborhood, `${shop.city} - ${shop.state}`].filter(Boolean).join(', '),
    coordinates: {
      lat: shop.latitude ?? DEFAULT_COORDINATES.lat,
      lng: shop.longitude ?? DEFAULT_COORDINATES.lng,
    },
    phone: shop.whatsapp ?? shop.phone ?? fallbackMedia.phone,
    hours,
    rating,
    reviews: shop.reviews?.length ?? 0,
    imageUrl: fallbackMedia.imageUrl,
    coverImageUrl: fallbackMedia.coverImageUrl,
    logoSeed: shop.name,
    isOpen: openState.isOpen,
    closesAt: openState.closesAt,
    priceFrom: services[0]?.price ?? fallbackMedia.priceFrom,
    nextSlot: openState.isOpen ? 'Hoje' : 'Proxima disponibilidade',
    responseTime: 'Responde em ate 15 min',
    waitTime: openState.isOpen ? 'Consulte agenda em tempo real' : 'Agenda disponivel para reserva',
    featured: shop.is_featured,
    premium: shop.is_premium,
    tags: tags.length > 0 ? tags : ['Corte', 'Barba'],
    amenities: ['Agendamento online', 'Confirmacao rapida', 'Perfil BarberFlow'],
    heroBlurb: shop.description ?? 'Barbearia cadastrada e pronta para receber agendamentos.',
    reviewHighlights: reviewsList.slice(0, 3).map((review) => review.text.slice(0, 48)),
    services,
    barbers,
    reviewsList,
  };
};

const mergeWithFallback = (shops: MarketplaceBarbershop[]) => {
  const map = new Map<string, MarketplaceBarbershop>();

  for (const shop of [...shops, ...MARKETPLACE_BARBERSHOPS]) {
    if (!map.has(shop.slug)) {
      map.set(shop.slug, shop);
    }
  }

  return Array.from(map.values());
};

export const getMarketplaceBarbershops = async (): Promise<MarketplaceBarbershop[]> => {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('barbershops')
      .select(SHOP_SELECT)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return mergeWithFallback((data as SupabaseShopRow[]).map(mapShop));
  } catch {
    return MARKETPLACE_BARBERSHOPS;
  }
};

export const getMarketplaceBarbershopBySlug = async (
  slug: string | undefined
): Promise<MarketplaceBarbershop> => {
  const shops = await getMarketplaceBarbershops();
  return shops.find((shop) => shop.slug === slug) ?? shops[0];
};
