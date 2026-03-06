# Render Deployment (Backend)

This project includes a Render blueprint at `render.yaml` for the backend service.

## Why this is required

Play closed testing users cannot reach your laptop backend.
You need a public HTTPS backend for release builds.

## Deploy steps

1. Push this repo to GitHub (Render needs a git repo source).
2. In Render dashboard, choose **New +** -> **Blueprint**.
3. Select the repo and deploy `render.yaml`.
4. Fill all `sync: false` environment values:
   - `MONGODB_URI` (for your current setup: ``)
   - `JWT_SECRET` (minimum 32 chars)
   - `CORS_ORIGINS` (for example: `https://divya.app,https://admin.divya.app`)
   - `PUBLIC_API_BASE_URL` (for example: `https://<your-service>.onrender.com`)
   - `ADMIN_DASHBOARD_URL`
   - `SENDGRID_API_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `MIXPANEL_TOKEN`
5. Wait for build and start to complete.
6. Verify health endpoints:
   - `https://<your-service>.onrender.com/health/live`
   - `https://<your-service>.onrender.com/health/ready`
7. Verify API:
   - `https://<your-service>.onrender.com/api/prayers`

## Android release URL

For Play release builds, point API to your live backend URL.

Set one of:
- `DIVYA_API_URL_RELEASE=https://<your-service>.onrender.com/api`
- or keep `https://divya.app/api` only after that domain is actually mapped to your backend

Then rebuild:

```powershell
.\.tools\gradle-8.7\bin\gradle :androidApp:bundleRelease
```

## Current blocker

`divya.app` is currently parked/sales landing, not serving this backend.
Do not use `https://divya.app/api` until DNS and routing are correctly configured.
