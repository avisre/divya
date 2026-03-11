# Web Rebuild Audit

Date: March 10, 2026
Scope: Replace the consumer `web/` app with a Next.js App Router web app while preserving consumer route parity and shifting web auth to HttpOnly cookie-backed sessions.

## What Changed

- Replaced the Vite consumer app runtime with a Next.js 15 app in [`web/`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/web).
- Moved the legacy Vite runtime into [`web/legacy-vite`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/web/legacy-vite) so the root `web/` runtime is unambiguously Next.js.
- Added a same-origin web auth/session layer:
  - [`/api/auth/login`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/web/app/api/auth/login/route.ts)
  - [`/api/auth/register`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/web/app/api/auth/register/route.ts)
  - [`/api/auth/logout`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/web/app/api/auth/logout/route.ts)
  - [`/api/auth/session`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/web/app/api/auth/session/route.ts)
  - [`/api/auth/oauth/complete`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/web/app/api/auth/oauth/complete/route.ts)
- Added a generic same-origin backend proxy for authenticated browser actions:
  - [`/api/backend/[...path]`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/web/app/api/backend/%5B...path%5D/route.ts)
- Rebuilt the public/auth/account route surface in Next App Router:
  - landing, login, register, oauth callback
  - home, prayers, prayer detail, temple, pujas, puja detail, calendar
  - deity detail, learning path, learning module
  - bookings, booking detail, sacred video
  - profile, in-app support, contact-us, privacy, terms, sitemap
  - shared prayer create and shared prayer session
- Added SEO and trust surfaces:
  - [`/robots.txt`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/web/app/robots.ts)
  - [`/sitemap.xml`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/web/app/sitemap.ts)
  - human-readable [`/sitemap`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/web/app/sitemap/page.tsx)
- Updated deployment blueprint in [`render.yaml`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/render.yaml) so `divya-web` is a Node web service instead of a static site.
- Updated backend web fallback URL in [`authController.js`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/backend/src/controllers/authController.js) and local env docs in [`backend/.env.example`](C:/Users/avina/Downloads/moonshot%20ideas/prayer%20app/om/backend/.env.example).

## Route Parity

Implemented consumer routes:

- `/`
- `/login`
- `/register`
- `/oauth/callback`
- `/home`
- `/prayers`
- `/prayers/[slug]`
- `/temple`
- `/pujas`
- `/pujas/[id]`
- `/calendar`
- `/deities/[id]`
- `/deities/[id]/learn`
- `/deities/[id]/learn/[moduleId]`
- `/bookings`
- `/bookings/[id]`
- `/videos/[bookingId]`
- `/profile`
- `/contact`
- `/contact-us`
- `/privacy`
- `/terms`
- `/sitemap`
- `/shared-prayer/create`
- `/shared-prayer/[sessionCode]`

## Auth / Privacy Model

- Web login and registration now set a secure HttpOnly cookie instead of returning a browser-stored JWT.
- Google OAuth remains available on web.
- GitHub OAuth remains in backend support code but is intentionally not surfaced in the new web UI.
- The browser-side code in `app/`, `components/`, and `lib/` no longer references `localStorage`, `sessionStorage`, `JWT`, or GitHub auth copy.
- Sensitive authenticated browser calls use the same-origin proxy instead of exposing the backend token to the browser.

## Verification Run

Passed:

- `web`: `npm install`
- `web`: `npm run build`
- `backend`: `npm run verify`

Verified by build output:

- Next.js App Router compiled successfully.
- Dynamic and static route generation completed for the new route set.
- Type-checking passed.
- Backend syntax verification passed after the auth controller change.

Verified by code audit:

- No browser token storage in the new Next web runtime.
- Public legal/support/SEO surfaces are present.
- Render config now matches a server-rendered Next deployment model.

Not yet verified live:

- Real Google OAuth callback against production credentials.
- End-to-end booking submission against a live backend environment.
- End-to-end shared prayer realtime behavior against a live socket backend.
- Cross-device visual QA on actual phones/tablets/desktops.

## UI / UX Scorecard

Overall: 8.8 / 10

- Visual consistency: 9.0 / 10
  - The new web shell, hero, card, and action styles are consistent and materially closer to the Om 2 visual language than the old Vite app.
- Clarity: 8.8 / 10
  - Landing, auth, temple, prayer, and booking surfaces now present the next action more clearly.
- Responsiveness: 8.6 / 10
  - The new layout is mobile-first and scales cleanly through tablet/desktop widths, but it still needs live device QA before claiming a 10.
- Trust and privacy: 9.3 / 10
  - This is the biggest upgrade. HttpOnly cookie-backed sessions and same-origin proxying are materially stronger than the old client-stored token model.
- Flow quality: 8.4 / 10
  - Core routes are in place and coherent, but a few account flows are still lean implementations rather than highly polished product flows.

## Residual Gaps

- The new web app is production-build clean, but not yet production-proven without a live auth/booking smoke pass.
- Shared prayer on web is functional but still a thin real-time client, not a deeply polished collaboration surface.
- The route surface is preserved, but some pages are intentionally streamlined relative to the previous SPA to get the security model, deployment model, and design reset in place first.

## Recommended Next Steps

1. Run a live smoke test against the deployed backend for email auth, Google auth, booking submission, support submission, and shared prayer join/end.
2. Do a visual QA sweep on mobile, tablet, and desktop and capture a screenshot proof pack for the rebuilt web app.
3. If Google OAuth is for Play/production domains, confirm `WEB_APP_URL`, `GOOGLE_OAUTH_REDIRECT_URI`, and Render envs match the deployed hostname exactly.
