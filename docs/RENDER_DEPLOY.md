# Render Deploy

This repo is set up for Render Blueprint deploys through `render.yaml`.

## Services

- `divya-backend`
- `divya-web`

## Files to use

- Blueprint: `render.yaml`
- Backend env template: `backend/.env.render.example`
- Web env template: `web/.env.render.example`

## Required Render environment values

### Backend

- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `PUBLIC_API_BASE_URL`
- `WEB_APP_URL`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`

### Web

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_BACKEND_ORIGIN`
- `BACKEND_API_BASE_URL`

## Google OAuth values

- Authorized JavaScript origin:
  - your web Render URL, for example `https://your-web-app.onrender.com`
- Authorized redirect URI:
  - `https://your-backend.onrender.com/api/auth/oauth/google/callback`

## Deploy steps

1. Push the current branch to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Select this GitHub repo.
4. Render will read `render.yaml`.
5. Fill the backend and web env vars using the two `.env.render.example` files.
6. Deploy both services.
7. After first deploy, verify:
   - web homepage loads
   - email signup/signin works
   - Google OAuth redirects back to the web app
   - `/robots.txt` and `/sitemap.xml` resolve on the web service

## Notes

- The web app is a Next.js Node service, not a static site.
- The browser does not connect directly to MongoDB; MongoDB stays behind the backend service.
- If the web or backend URL changes after initial deploy, update:
  - `CORS_ORIGINS`
  - `WEB_APP_URL`
  - `PUBLIC_API_BASE_URL`
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_BACKEND_ORIGIN`
  - `BACKEND_API_BASE_URL`
  - Google OAuth redirect/origin settings
