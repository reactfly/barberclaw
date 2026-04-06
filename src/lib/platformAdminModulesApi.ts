import { getSupabaseClient } from './supabase';

export interface PlatformServerListResponse<T> {
  ok: boolean;
  items: T[];
  summary?: Record<string, number | string>;
}

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

const request = async <T>(path: string) => {
  const accessToken = await getSessionAccessToken();
  const response = await fetch(path, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const body = (await response.json().catch(() => ({}))) as PlatformServerListResponse<T> & { error?: string };
  if (!response.ok || body.ok === false) {
    throw new Error(body.error || 'Nao foi possivel carregar o modulo do super admin.');
  }

  return body;
};

export const getPlatformPlans = () => request<any>('/api/platform-plans');
export const getPlatformTransactions = () => request<any>('/api/platform-transactions');
export const getPlatformTickets = () => request<any>('/api/platform-tickets');
export const getPlatformNotifications = () => request<any>('/api/platform-notifications');
export const getPlatformContent = () => request<any>('/api/platform-content');
export const getPlatformAuditLogs = () => request<any>('/api/platform-audit-logs');
