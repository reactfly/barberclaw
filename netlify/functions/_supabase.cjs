const { createClient } = require('@supabase/supabase-js');

const normalizeValue = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/^['"]|['"]$/g, '');
};

const pickFirst = (...values) => {
  for (const value of values) {
    const normalized = normalizeValue(value);
    if (normalized) {
      return normalized;
    }
  }

  return '';
};

const getSupabaseUrl = () =>
  pickFirst(
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    process.env.PUBLIC_SUPABASE_URL
  );

const getServiceRoleKey = () =>
  pickFirst(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET_KEY
  );

const getPublishableKey = () =>
  pickFirst(
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

const createAdminClient = () => {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_URL and a server-side service role key are required in the environment.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

const jsonResponse = (statusCode, payload, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  },
  body: JSON.stringify(payload),
});

const getHeader = (headers, headerName) => {
  if (!headers || typeof headers !== 'object') {
    return '';
  }

  const target = headerName.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) {
      return Array.isArray(value) ? value[0] : normalizeValue(value);
    }
  }

  return '';
};

const getBearerToken = (headers) => {
  const authorization = getHeader(headers, 'authorization');
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return '';
  }

  return authorization.slice(7).trim();
};

const parseJsonBody = (event) => {
  if (!event || typeof event.body !== 'string' || !event.body.trim()) {
    return {};
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throw new Error('O corpo da requisicao precisa estar em JSON valido.');
  }
};

const sleep = (delayMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

const waitForProfile = async (supabaseAdmin, userId, attempts = 10, delayMs = 250) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      return data;
    }

    if (attempt < attempts - 1) {
      await sleep(delayMs);
    }
  }

  return null;
};

const verifySessionToken = async (supabaseAdmin, headers) => {
  const accessToken = getBearerToken(headers);

  if (!accessToken) {
    throw new Error('Sessao nao encontrada. Faca login novamente para continuar.');
  }

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) {
    throw error || new Error('Nao foi possivel validar a sessao informada.');
  }

  return {
    accessToken,
    user: data.user,
  };
};

const getManagerContext = async (supabaseAdmin, userId, shopId) => {
  const profilePromise = supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  const shopPromise = supabaseAdmin
    .from('barbershops')
    .select('*')
    .eq('id', shopId)
    .maybeSingle();
  const membershipPromise = supabaseAdmin
    .from('barbershop_memberships')
    .select('*')
    .eq('shop_id', shopId)
    .eq('profile_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  const [{ data: profile, error: profileError }, { data: shop, error: shopError }, { data: membership, error: membershipError }] =
    await Promise.all([profilePromise, shopPromise, membershipPromise]);

  if (profileError && profileError.code !== 'PGRST116') {
    throw profileError;
  }

  if (shopError && shopError.code !== 'PGRST116') {
    throw shopError;
  }

  if (membershipError && membershipError.code !== 'PGRST116') {
    throw membershipError;
  }

  if (!profile) {
    throw new Error('Perfil do usuario nao foi encontrado no Supabase.');
  }

  if (!shop) {
    throw new Error('Barbearia nao encontrada.');
  }

  const canManageShop =
    profile.role === 'admin' ||
    membership?.role === 'owner' ||
    membership?.role === 'manager' ||
    shop.owner_id === userId;

  return {
    profile,
    shop,
    membership,
    canManageShop,
  };
};

const getSiteUrl = (headers, fallbackPath = '') => {
  const explicitOrigin = getHeader(headers, 'origin');
  if (explicitOrigin) {
    return `${explicitOrigin.replace(/\/$/, '')}${fallbackPath}`;
  }

  const forwardedProto = getHeader(headers, 'x-forwarded-proto') || 'https';
  const forwardedHost = getHeader(headers, 'x-forwarded-host') || getHeader(headers, 'host');

  if (!forwardedHost) {
    return fallbackPath;
  }

  return `${forwardedProto}://${forwardedHost}${fallbackPath}`;
};

module.exports = {
  createAdminClient,
  getBearerToken,
  getPublishableKey,
  getServiceRoleKey,
  getSiteUrl,
  getSupabaseUrl,
  jsonResponse,
  parseJsonBody,
  verifySessionToken,
  getManagerContext,
  waitForProfile,
};
