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

### Netlify (recomendado)

1. Em `Site configuration > Environment variables`, adicione:
   - `VITE_MAPBOX_TOKEN` (token publico Mapbox iniciado por `pk.`)
2. Não adicione `GEMINI_API_KEY` no frontend da Netlify para evitar exposição de segredo.
3. Faça um novo deploy (`Trigger deploy > Clear cache and deploy site`).
4. O arquivo `netlify.toml` ja esta configurado para:
   - buildar com `npm run build`
   - publicar `dist`
   - aplicar redirect SPA para `index.html`

### AWS Amplify

Use o `amplify.yml` deste repositório e configure no painel:

- `VITE_MAPBOX_TOKEN`
- `GEMINI_API_KEY` (opcional)
