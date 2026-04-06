<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/358c8ec4-0ab1-4e4e-8d93-d22eb55956bf

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set `VITE_MAPBOX_TOKEN` in `.env` or `.env.local` with your public Mapbox token
3. Set Supabase credentials in `.env` or `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (recommended)
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_URL` (server-side only)
   - `SUPABASE_SERVICE_ROLE_KEY` (preferred for Auth Admin / Netlify Functions)
   - `SUPABASE_SECRET_KEY` (server-side only, never with `VITE_`)
4. Optionally set `GEMINI_API_KEY` for AI features
5. Run:
   `npm run dev`

## Supabase Database

This repo now includes the first database migration for auth, onboarding and marketplace data:

- `supabase/migrations/20260405_000001_initial_barberflow_schema.sql`

Main tables created by this migration:

- `profiles`
- `barbershops`
- `barbershop_memberships`
- `business_hours`
- `services`
- `barbers`
- `appointments`
- `blocked_slots`
- `reviews`

To apply it in your Supabase project:

1. Open the Supabase dashboard for your project.
2. Go to `SQL Editor`.
3. Open `supabase/migrations/20260405_000001_initial_barberflow_schema.sql` from this repo.
4. Paste the SQL and run it once.
5. In `Authentication > Providers`, keep Email enabled if you want login and register to work with email and password.

After the migration is applied:

- owner accounts created in `/register` automatically receive a row in `profiles`
- owner login is routed by `profiles.role` and onboarding status
- onboarding saves the barbershop, business hours and services to Supabase
- marketplace pages can read active barbershops from Supabase with fallback to the demo data
- `/b/:slug` now checks real availability and writes public bookings directly into `appointments`
- `/admin/equipe` can invite real staff users through Supabase Auth and sync `profiles`, `barbershop_memberships` and `barbers`

## Deploy

### Netlify (recommended)

1. In `Site configuration > Environment variables`, add:
   - `VITE_MAPBOX_TOKEN` (public token that starts with `pk.`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (recommended)
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_URL` (server-side)
   - `SUPABASE_SERVICE_ROLE_KEY` (preferred for invite flow and admin server functions)
   - `SUPABASE_SECRET_KEY` (server-side)
2. Do not expose sensitive keys in frontend variables (for example Supabase secret key).
3. For server validation, this repo includes:
   - `/.netlify/functions/supabase-admin-health`
   - `/.netlify/functions/public-booking-availability`
   - `/.netlify/functions/public-booking`
   - `/.netlify/functions/invite-staff`
4. Trigger a new deploy (`Trigger deploy > Clear cache and deploy site`).
5. `netlify.toml` is already configured to:
   - run `npm run build`
   - publish `dist`
   - load Netlify Functions from `netlify/functions`
   - use SPA redirect to `index.html`

### AWS Amplify

Use `amplify.yml` and configure:

- `VITE_MAPBOX_TOKEN`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL` (for backend/SSR/Lambda usage)
- `SUPABASE_SERVICE_ROLE_KEY` (preferred for backend auth admin flows)
- `SUPABASE_SECRET_KEY` (for backend/SSR/Lambda usage)
- `GEMINI_API_KEY` (optional)

Important for Amplify: `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_SECRET_KEY` should be consumed only by backend compute (Lambda, SSR, API). Do not inject them into frontend code or variables prefixed with `VITE_`.
