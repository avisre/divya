# Web Deploy

The consumer web app lives in `web/` and is designed to run as a static SPA against the existing Express + MongoDB backend.

## Local

1. Install dependencies:
   ```bash
   cd web
   npm install
   ```
2. Copy env defaults if needed:
   ```bash
   cp .env.example .env
   ```
3. Start the app:
   ```bash
   npm run dev
   ```

Local development uses the Vite proxy:
- `/api` -> `https://divya-twug.onrender.com/api`
- `/socket.io` -> `https://divya-twug.onrender.com/socket.io`

Default API target:
- `https://divya-twug.onrender.com/api`

Default socket target:
- `https://divya-twug.onrender.com`

## Render

The root blueprint includes a `divya-web` static service.

Required settings:
- root directory: `web`
- build command: `npm ci && npm run build`
- publish directory: `dist`

Environment variables:
```text
VITE_API_BASE_URL=https://divya-twug.onrender.com/api
VITE_SOCKET_BASE_URL=https://divya-twug.onrender.com
```

SPA routing:
- The blueprint rewrites `/*` to `/index.html`.

## Backend CORS

The backend must explicitly allow the deployed web origin in `CORS_ORIGINS`.

Example:
```text
CORS_ORIGINS=https://divya-web.onrender.com,https://divya-twug.onrender.com
```

If the web app is moved to a custom domain, update both:
- `CORS_ORIGINS`
- `VITE_API_BASE_URL` / `VITE_SOCKET_BASE_URL` if the backend host changes
