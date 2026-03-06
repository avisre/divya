# Production Readiness Status

## Completed Foundations

- Structured API errors with stable `code`, `message`, `requestId`, and `durationMs` response fields.
- Request context middleware adds request IDs to every response (`x-request-id`).
- Strict backend startup config validation (`MONGODB_URI`, `JWT_SECRET`, CORS in production, Stripe checks when enabled).
- Graceful backend shutdown with SIGINT/SIGTERM handling and Mongo/socket/cron cleanup.
- Health endpoints:
  - `GET /health`
  - `GET /health/live`
  - `GET /health/ready`
- Global API rate limiting plus endpoint-specific limiters.
- Conditional non-production API exposure via env flags:
  - `ENABLE_SIMULATOR_API`
  - `ENABLE_OBSERVABILITY_INGEST`
- Response compression + hardened Express defaults (`x-powered-by` disabled).
- Observability endpoints:
  - `GET /api/observability/health`
  - `GET /api/observability/slo`
  - `POST /api/observability/events`
  - `POST /api/observability/crashes`
- Idempotent booking creation support via `x-idempotency-key`.
- Booking flow supports payment-disabled mode (`DISABLE_PAYMENTS=true`) with stable API contract (`paymentRequired` flag).
- Push delivery path implemented via FCM HTTP v1 with service-account auth (`FIREBASE_SERVICE_ACCOUNT_JSON`, optional `FCM_PROJECT_ID`).
- Android session token moved to `EncryptedSharedPreferences` with safe fallback.
- Android release hardening:
  - cleartext disabled in release
  - minify + resource shrink
  - ProGuard rules added
  - debug gallery tooling gated behind `ENABLE_GALLERY_TOOLS`
- Prayer player prefers bundled per-prayer audio assets by slug/title to avoid single-stream fallback issues.
- Content governance validation script:
  - minimum prayer count
  - bundled audio mapping coverage
  - placeholder/demo wording checks in client UIs
- CI workflow (`.github/workflows/quality-gates.yml`) running:
  - release content validation
  - backend verification
  - admin build verification
- Admin dashboard upgraded from static placeholders to API-backed pages and action flows.

## Open Production Gaps

- Full auth lifecycle hardening:
  - refresh-token rotation strategy
  - token revocation and session management
- APNs/iOS push parity and physical device verification.
- Crash reporting + alert routing to an external APM (Sentry/Crashlytics equivalent).
- End-to-end subscription production integration (RevenueCat live products and entitlement reconciliation).
- Video delivery hardening:
  - CDN layer and cache policy
  - signed URL expiry policy and rotation
- Full automated tests:
  - API integration tests
  - mobile UI regression tests
  - critical path smoke tests in CI
- Security hardening:
  - managed secrets store beyond `.env`
  - dependency audit gating in CI (backend currently clean on prod dependencies)
  - stricter webhook verification coverage

## Recommended Immediate Next Milestone

Ship a "v1 production hardening sprint" focused on:
1. APNs + Android physical-device push validation and runbooks.
2. External crash alerting integration and on-call routing.
3. API integration test suite for auth, booking, and admin actions.
4. RevenueCat entitlement reconciliation tests in staging.
