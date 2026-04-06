import { getSupabaseClient } from './supabase';

export interface PublicAvailabilityResult {
  slots: string[];
  opensAt: string | null;
  closesAt: string | null;
  message: string;
}

export interface PublicBookingConfirmation {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
}

const getOptionalAccessToken = async () => {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session?.access_token ?? '';
};

const requestJson = async <T>(
  path: string,
  init?: RequestInit,
  includeSession = false
): Promise<T> => {
  const headers = new Headers(init?.headers ?? {});
  headers.set('Accept', 'application/json');

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (includeSession) {
    const accessToken = await getOptionalAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(path, {
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
  } & T;

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `A requisicao falhou (${response.status}).`);
  }

  return payload;
};

export const getPublicAvailability = async (params: {
  shopId: string;
  barberId: string;
  appointmentDate: string;
  durationMinutes: number;
}): Promise<PublicAvailabilityResult> => {
  const searchParams = new URLSearchParams({
    shopId: params.shopId,
    barberId: params.barberId,
    date: params.appointmentDate,
    durationMinutes: String(params.durationMinutes),
  });

  const payload = await requestJson<PublicAvailabilityResult>(
    `/api/public-booking-availability?${searchParams.toString()}`
  );

  return {
    slots: (payload.slots ?? []).map((slot) => slot.slice(0, 5)),
    opensAt: payload.opensAt ? payload.opensAt.slice(0, 5) : null,
    closesAt: payload.closesAt ? payload.closesAt.slice(0, 5) : null,
    message: payload.message ?? '',
  };
};

export const createPublicBooking = async (payload: {
  shopId: string;
  serviceId: string;
  barberId: string;
  appointmentDate: string;
  startTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}): Promise<{
  appointment: PublicBookingConfirmation;
  barberName: string;
  serviceName: string;
  message: string;
}> =>
  requestJson(
    '/api/public-booking',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    true
  );
