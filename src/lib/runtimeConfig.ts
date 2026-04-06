export interface PublicRuntimeConfig {
  mapboxToken: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
}

const DEFAULT_PUBLIC_RUNTIME_CONFIG: PublicRuntimeConfig = {
  mapboxToken: '',
  supabaseUrl: '',
  supabasePublishableKey: ''
};

let cachedConfig: PublicRuntimeConfig | null = null;
let configPromise: Promise<PublicRuntimeConfig> | null = null;

const normalizeValue = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/^['"]|['"]$/g, '');
};

const normalizeConfig = (value: unknown): PublicRuntimeConfig => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_PUBLIC_RUNTIME_CONFIG;
  }

  const config = value as Partial<PublicRuntimeConfig>;

  return {
    mapboxToken: normalizeValue(config.mapboxToken),
    supabaseUrl: normalizeValue(config.supabaseUrl),
    supabasePublishableKey: normalizeValue(config.supabasePublishableKey)
  };
};

export const getCachedPublicRuntimeConfig = (): PublicRuntimeConfig | null => cachedConfig;

export const getPublicRuntimeConfig = async (): Promise<PublicRuntimeConfig> => {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (!configPromise) {
    configPromise = fetch('/api/public-runtime-config', {
      headers: { Accept: 'application/json' }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Nao foi possivel carregar a configuracao publica (${response.status}).`);
        }

        const payload = await response.json();
        const config = normalizeConfig(payload);
        const missingFields = [
          !config.supabaseUrl ? 'supabaseUrl' : '',
          !config.supabasePublishableKey ? 'supabasePublishableKey' : '',
        ].filter(Boolean);

        if (missingFields.length > 0) {
          throw new Error(
            `O endpoint /api/public-runtime-config respondeu sem ${missingFields.join(' e ')}. Verifique as variaveis PUBLIC_/VITE_/SUPABASE_ do ambiente.`
          );
        }

        cachedConfig = config;
        return config;
      })
      .catch((error) => {
        configPromise = null;
        throw error;
      });
  }

  return configPromise;
};
