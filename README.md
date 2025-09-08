# Gradalyze Frontend

Frontend for the Gradalyze academic profiling and career recommendation platform.

## Quickstart

1. Install dependencies
   ```bash
   npm install
   ```

2. Configure environment
   Create `.env` for development in `frontend/`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_NODE_ENV=development
   ```
   Optionally, create `.env.production` for production builds:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.com
   VITE_NODE_ENV=production
   ```

3. Start the app
   ```bash
   npm run dev
   # app runs on http://localhost:5173 by default
   ```

## Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build locally

## Configuration

- API base URL is configured via environment variables in `src/config/api.ts`.
- You can set `VITE_API_BASE_URL` to point to your backend.

## Project Structure

```
frontend/
  src/
    pages/           # Route pages (Dashboard, Analysis, etc.)
    components/      # Reusable UI components
    admin/           # Admin-specific screens
    config/          # API config and helpers
    main.tsx         # App bootstrap
```

## Features

- Authentication (login/signup)
- Academic document upload and analysis
- Learning archetype identification
- Career and job recommendations
- Personalized dashboard
- Professional dossier generation

## Deployment

### Vercel
1. Connect the repo
2. Configure env vars:
   - `VITE_API_BASE_URL` – backend API URL
   - `VITE_NODE_ENV=production`
3. Deploy via dashboard or CLI

### Static hosting
- Run `npm run build`. Deploy `dist/` to your static host (e.g., Netlify, S3+CloudFront).

## Troubleshooting

- CORS errors: ensure backend enables CORS and `VITE_API_BASE_URL` is correct.
- 404 on refresh: configure host to fallback to `index.html` for SPA routing.
- Env not picked up: restart dev server after changing `.env` files.