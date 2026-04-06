import { createRequire } from 'module';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);
const publicRuntimeConfigUtils = require('./netlify/functions/_public-runtime-config.cjs');
const {
  buildMissingPublicRuntimeConfigMessage,
  createPublicRuntimeConfig,
  getMissingPublicRuntimeConfigFields,
} = publicRuntimeConfigUtils as {
  buildMissingPublicRuntimeConfigMessage: (missingFields: string[]) => string;
  createPublicRuntimeConfig: (env?: Record<string, string | undefined>) => {
    mapboxToken: string;
    supabaseUrl: string;
    supabasePublishableKey: string;
  };
  getMissingPublicRuntimeConfigFields: (config: {
    mapboxToken: string;
    supabaseUrl: string;
    supabasePublishableKey: string;
  }) => string[];
};

const readRequestBody = (req: any) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

const runNetlifyFunction = async (handler: (event: any) => Promise<any>, req: any, res: any) => {
  const url = new URL(req.url || '', 'http://localhost');
  const body =
    req.method && req.method !== 'GET' && req.method !== 'HEAD'
      ? await readRequestBody(req)
      : '';

  const response = await handler({
    httpMethod: req.method || 'GET',
    headers: req.headers || {},
    queryStringParameters: Object.fromEntries(url.searchParams.entries()),
    body,
    rawUrl: url.toString(),
  });

  res.statusCode = response?.statusCode || 200;

  for (const [header, value] of Object.entries(response?.headers || {})) {
    if (value !== undefined) {
      res.setHeader(header, value as string);
    }
  }

  res.end(response?.body || '');
};

const sendJson = (res: any, statusCode: number, payload: unknown) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  Object.assign(process.env, env);

  const publicBookingAvailabilityHandler =
    require('./netlify/functions/public-booking-availability-handler.cjs').handler;
  const publicBookingHandler = require('./netlify/functions/public-booking-handler.cjs').handler;
  const inviteStaffHandler = require('./netlify/functions/invite-staff-handler.cjs').handler;

  return {
    plugins: [
      react(),
      {
        name: 'public-runtime-config-dev-endpoint',
        configureServer(server) {
          server.middlewares.use('/api/public-runtime-config', async (_req, res) => {
            const payload = createPublicRuntimeConfig(process.env);
            const missingFields = getMissingPublicRuntimeConfigFields(payload);

            if (missingFields.length > 0) {
              sendJson(res, 500, {
                error: buildMissingPublicRuntimeConfigMessage(missingFields),
                missingFields,
              });
              return;
            }

            sendJson(res, 200, payload);
          });

          server.middlewares.use('/api/public-booking-availability', (req, res) =>
            runNetlifyFunction(publicBookingAvailabilityHandler, req, res)
          );

          server.middlewares.use('/api/public-booking', (req, res) =>
            runNetlifyFunction(publicBookingHandler, req, res)
          );

          server.middlewares.use('/api/invite-staff', (req, res) =>
            runNetlifyFunction(inviteStaffHandler, req, res)
          );
        },
      },
    ],
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');

            if (!normalizedId.includes('node_modules')) {
              return undefined;
            }

            if (normalizedId.includes('mapbox-gl') || normalizedId.includes('react-map-gl')) {
              return 'mapbox';
            }

            if (normalizedId.includes('@supabase/')) {
              return 'supabase';
            }

            if (normalizedId.includes('gsap')) {
              return 'animation';
            }

            return 'vendor';
          },
        },
      },
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
  };
});
