# Render Deploy

This repo is set up for a single Render Blueprint deploy through `render.yaml`.

## Service

- `divya-app`

## Files to use

- Blueprint: `render.yaml`
- Backend env template: `backend/.env.render.example`
- Web env template: `web/.env.render.example`

## Required Render environment values

### Shared

- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `PUBLIC_API_BASE_URL`
- `WEB_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_BACKEND_ORIGIN`
- `BACKEND_API_BASE_URL`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`

## Google OAuth values

- Authorized JavaScript origin:
  - your Render app URL, for example `https://your-app.onrender.com`
- Authorized redirect URI:
  - `https://your-app.onrender.com/api/auth/oauth/google/callback`

## Deploy steps

1. Push the current branch to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Select this GitHub repo.
4. Render will read `render.yaml`.
5. Fill the shared env vars using the two `.env.render.example` files.
6. Deploy the single service.
7. After first deploy, verify:
  - web homepage loads
  - email signup/signin works
  - Google OAuth redirects back to the web app
  - `/robots.txt` and `/sitemap.xml` resolve on the web service
  - `/health/ready` resolves on the same host

## Notes

- The app is a unified Next.js + Express Node service.
- The browser does not connect directly to MongoDB; MongoDB stays behind the API routes on the same host.
- If the app URL changes after initial deploy, update:
  - `CORS_ORIGINS`
  - `WEB_APP_URL`
  - `PUBLIC_API_BASE_URL`
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_BACKEND_ORIGIN`
  - `BACKEND_API_BASE_URL`
  - Google OAuth redirect/origin settings
