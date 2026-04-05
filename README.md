<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/358c8ec4-0ab1-4e4e-8d93-d22eb55956bf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_MAPBOX_TOKEN` in `.env` or `.env.local` to your public Mapbox token
3. Optionally set `GEMINI_API_KEY` in `.env` or `.env.local` for the AI features
4. Run the app:
   `npm run dev`

## Deploy

For AWS Amplify or any CI/CD provider, configure these environment variables in the deployment settings instead of committing them to Git:

- `VITE_MAPBOX_TOKEN`
- `GEMINI_API_KEY` (optional)

The `amplify.yml` build already reads these variables and writes them to `.env.production` during deploy.
