# Release Checklist

## Preflight

- Confirm `backend/.env` values are set for production.
- Confirm production-only env gates:
  - `DISABLE_PAYMENTS=true` (for no-payment rollout)
  - `ENABLE_SIMULATOR_API=false`
  - `ENABLE_OBSERVABILITY_INGEST=true`
  - `TRUST_PROXY=true` (when behind LB / reverse proxy)
- Confirm Android/iOS API base URLs point to the production API.
- Verify admin JWT login against production backend.

## Automated Gates

- Run release content validation:
  - `node scripts/validate_release_content.mjs`
- Run backend verification:
  - `cd backend && npm run verify`
- Run backend prayer contract (local orchestration):
  - `cd backend && npm run test:contract:prayers:local`
- Run backend dependency audit:
  - `cd backend && npm audit --omit=dev`
- Run admin production build:
  - `cd admin && npm run build`

## Backend Runtime Checks

- `GET /health/live` returns HTTP 200.
- `GET /health/ready` returns HTTP 200 with `mongodb: "up"`.
- `GET /api/observability/health` returns `status: "ok"` when observability ingest is enabled.
- `GET /api/observability/slo` returns target metrics payload.
- Auth endpoints:
  - register/login/refresh/me flow passes with request IDs in responses.
- Booking flow:
  - create booking with `x-idempotency-key`
  - retry returns replayed booking (no duplicate booking row)
- Admin flow:
  - dashboard loads
  - assign date works
  - in-progress status push payload generated
  - video upload updates status to `video_ready`

## Android Smoke Checks

- Build release APK successfully:
  - `.\.tools\gradle-8.7\bin\gradle.bat :androidApp:assembleRelease`
- Build debug APK for physical phone QA artifact:
  - `.\.tools\gradle-8.7\bin\gradle.bat :androidApp:installDebug`
  - Copy `androidApp/build/outputs/apk/debug/androidApp-debug.apk` to `artifacts/apk/divya-debug-latest.apk`
  - Generate `artifacts/apk/divya-debug-latest.sha256`
- Home page loads with pan-India roadmap section.
- Prayer player:
  - each mapped prayer resolves to its own bundled MP3 (no single-stream fallback)
  - play/pause/stop works
  - mini-player persists while navigating between tabs
  - speed controls work from mini-player and full player
  - offline save behavior is visible where applicable
  - quality/source labels are visible

## Launch Blocking Criteria

- Any crash in auth, booking, prayer playback, shared session, or video playback critical path blocks release.
- Any broken puja video upload/delivery path blocks release.
- Any client screen showing placeholder/sample/demo copy blocks release.
- Any production release build with cleartext enabled blocks release.
