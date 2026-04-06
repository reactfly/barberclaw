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

const createPublicRuntimeConfig = (env = {}) => ({
  mapboxToken: pickFirst(env.PUBLIC_MAPBOX_TOKEN, env.VITE_MAPBOX_TOKEN),
  supabaseUrl: pickFirst(env.PUBLIC_SUPABASE_URL, env.VITE_SUPABASE_URL, env.SUPABASE_URL),
  supabasePublishableKey: pickFirst(
    env.SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    env.SUPABASE_PUBLISHABLE_KEY,
    env.PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    env.VITE_SUPABASE_PUBLISHABLE_KEY
  ),
});

const getMissingPublicRuntimeConfigFields = (config) =>
  [
    !config?.supabaseUrl ? 'supabaseUrl' : '',
    !config?.supabasePublishableKey ? 'supabasePublishableKey' : '',
  ].filter(Boolean);

const buildMissingPublicRuntimeConfigMessage = (missingFields) =>
  `As variaveis publicas do Supabase estao ausentes: ${missingFields.join(', ')}. Configure o ambiente antes de iniciar a aplicacao.`;

module.exports = {
  buildMissingPublicRuntimeConfigMessage,
  createPublicRuntimeConfig,
  getMissingPublicRuntimeConfigFields,
  normalizeValue,
  pickFirst,
};
