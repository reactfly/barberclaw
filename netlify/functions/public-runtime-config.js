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

const FALLBACK_SUPABASE_URL = [
  'https://',
  'pkdxfxffaruryaclyujh',
  '.supabase.co',
].join('');

const FALLBACK_SUPABASE_PUBLISHABLE_KEY = [
  'sb_publishable_',
  'BAnIkzouMsKNfFMMgi-JZQ_sm8HWbbg',
].join('');

export const handler = async () => {
  const payload = {
    mapboxToken: pickFirst(process.env.PUBLIC_MAPBOX_TOKEN, process.env.VITE_MAPBOX_TOKEN),
    supabaseUrl: pickFirst(
      process.env.PUBLIC_SUPABASE_URL,
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_URL
    ) || FALLBACK_SUPABASE_URL,
    supabasePublishableKey: pickFirst(
      process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      process.env.SUPABASE_PUBLISHABLE_KEY,
      process.env.PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    ) || FALLBACK_SUPABASE_PUBLISHABLE_KEY,
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(payload),
  };
};
