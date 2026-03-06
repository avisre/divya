# Divya

Divya is a Kotlin Multiplatform Mobile prayer app for the Hindu diaspora, centered on Bhadra Bhagavathi Temple, Karunagapally.

## Workspace Layout

- `backend/`: Node.js + Express + MongoDB Atlas API
- `shared/`: Kotlin Multiplatform shared logic and data contracts
- `androidApp/`: Android Jetpack Compose shell
- `iosApp/`: iOS SwiftUI shell
- `admin/`: React + Vite admin dashboard shell

## Status

Backend, Android, shared KMM, and admin are wired with production hardening for auth/session, observability, push registration paths, booking (waitlist-first), and media playback.

Explicit exclusions for this release track:
- Stripe payments
- Google authentication

## Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Install packages:
   ```bash
   cd backend
   npm install
   ```
3. Seed data:
   ```bash
   npm run seed
   ```
4. Run the API:
   ```bash
   npm run dev
   ```

## Admin

1. Install packages:
   ```bash
   cd admin
   npm install
   ```
2. Run the dashboard:
   ```bash
   npm run dev
   ```
3. Open booking simulator:
   - Route: `/simulator`
   - Requires `ENABLE_SIMULATOR_API=true` on backend.

## KMM

1. Open the repository in Android Studio for the Android/shared modules.
2. Open `iosApp/DivyaApp.xcodeproj` in Xcode after generating the KMM framework setup for your environment.
3. Add real keys to:
   - `androidApp/local.properties`
   - `iosApp/Config.xcconfig`
4. For physical Android phone testing with a local backend, set:
   - `DIVYA_API_URL_DEVICE=http://<your-lan-ip>:5000/api`
   - Debug builds on emulator continue to use `DIVYA_API_URL_DEBUG` / `10.0.2.2`.

## Notes

- Only one temple is seeded: Bhadra Bhagavathi Temple, Karunagapally.
- All pujas are waitlist-only and prasad is unavailable.
- Panchang and nakshatra logic are referenced to Karunagapally coordinates.

## Booking Simulator APIs

- `GET /api/simulator/bootstrap?currency=USD`
  - Returns temple and puja catalog plus defaults for simulation UI.
- `POST /api/simulator/booking`
  - Simulates booking output (reference, waitlist position, timeline, payment preview) without creating a real Stripe charge.

## Retention Layer APIs

- Daily recommendation:
  - `GET /api/prayers/daily-recommendation?timezone=America/New_York&date=2026-03-05`
- Panchang with guidance:
  - `GET /api/panchang/today?timezone=America/New_York`
  - `GET /api/panchang/upcoming?timezone=America/New_York&days=30`
- Festivals:
  - `GET /api/festivals/upcoming?days=30`
  - `GET /api/festivals/:id`
- Learning paths:
  - `GET /api/deities/:id/learning-path`
  - `GET /api/deities/:id/learning-path/:moduleId`
  - `POST /api/deities/:id/learning-path/:moduleId/complete` (auth)
  - `GET /api/users/learning-progress` (auth)
- Shared prayer sessions:
  - `POST /api/prayer-sessions` (auth)
  - `GET /api/prayer-sessions/:code` (auth)
  - `POST /api/prayer-sessions/:code/join` (auth)
  - `POST /api/prayer-sessions/:code/end` (auth)
  - Socket events are enabled via Socket.IO server on the backend host.
- Gifts:
  - `POST /api/bookings/gift` (auth)
  - `GET /api/bookings/gifts-sent` (auth)
  - `GET /api/bookings/gifts-received` (auth)
- Streak and certificates:
  - `POST /api/users/prayer-complete` (auth)
  - `POST /api/users/streak/use-grace` (auth)
  - `GET /api/users/certificate/:milestoneId` (auth)

## Quality Gates

- Content validation:
  ```bash
  node scripts/validate_release_content.mjs
  ```
- Backend verification:
  ```bash
  cd backend
  npm run verify
  ```
- Backend prayer contract check (starts backend in-process):
  ```bash
  cd backend
  npm run test:contract:prayers:local
  ```
- Backend dependency audit:
  ```bash
  cd backend
  npm audit --omit=dev
  ```
- Admin build verification:
  ```bash
  cd admin
  npm run build
  ```

## Licensed YouTube Media Download

Use this only for prayer media you are licensed to use and distribute.

1. Install required tools:
   ```bash
   pip install yt-dlp
   ```
   - Install `ffmpeg` (Windows example):
     ```bash
     winget install --id Gyan.FFmpeg --exact --accept-source-agreements --accept-package-agreements
     ```
2. Fill URLs in `scripts/prayer_youtube_manifest.json` for the 36 prayer items.
   - Optional auto-fill from YouTube search:
     ```bash
     python scripts/fill_prayer_manifest_links.py --force --search-size 10
     ```
3. Run audio download (Android `res/raw`):
   ```bash
   python scripts/download_youtube_prayers.py --kind audio --audio-format mp3
   ```
4. Optional dry run:
   ```bash
   python scripts/download_youtube_prayers.py --dry-run
   ```
5. Optional video mode:
   ```bash
   python scripts/download_youtube_prayers.py --kind video --video-container mp4
   ```

## Release Docs

- Production status: `docs/PRODUCTION_READINESS.md`
- Release runbook: `docs/RELEASE_CHECKLIST.md`
- Render backend deploy: `docs/RENDER_DEPLOY.md`
