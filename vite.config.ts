import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const normalizeValue = (value: string | undefined) => {
  if (!value) {
    return '';
  }

  return value.trim().replace(/^['"]|['"]$/g, '');
};

const pickFirst = (...values: Array<string | undefined>) => {
  for (const value of values) {
    const normalized = normalizeValue(value);
    if (normalized) {
      return normalized;
    }
  }

  return '';
};

const createPublicRuntimeConfig = (env: Record<string, string>) => ({
  mapboxToken: pickFirst(env.PUBLIC_MAPBOX_TOKEN, env.VITE_MAPBOX_TOKEN),
  supabaseUrl: pickFirst(env.PUBLIC_SUPABASE_URL, env.VITE_SUPABASE_URL, env.SUPABASE_URL),
  supabasePublishableKey: pickFirst(
    env.PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    env.VITE_SUPABASE_PUBLISHABLE_KEY
  )
});

export default defineConfig(({ mode }) => {
  // Fixed: Cast process to any to avoid TypeScript error with process.cwd()
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [
      react(),
      {
        name: 'public-runtime-config-dev-endpoint',
        configureServer(server) {
          server.middlewares.use('/api/public-runtime-config', (_req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(createPublicRuntimeConfig(env)));
          });
        }
      }
    ],
    build: {
      outDir: 'dist',
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  };
});
