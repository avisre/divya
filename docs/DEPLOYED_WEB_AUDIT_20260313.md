# Deployed Web Audit

- Generated: 2026-03-13
- Target: `https://divya-xbza.onrender.com`
- Audit script: `web/scripts/production_smoke_audit.mjs`

## Summary

The current deployed site is not production-ready for authenticated web flows.

- Public, read-only pages and sample content routes are working.
- New user registration is failing on the deployed site.
- Existing user sign-in is failing on the deployed site.
- Authenticated routes remain inaccessible because the web session cookie is never established.
- Protected web mutations that go through `/api/backend/*` are also failing on the deployed site.

## Deployed Result

- Passed: `22`
- Failed: `14`

## Passing Areas

- Landing page and public auth pages
- Public prayers, temple, calendar, pujas, privacy, terms, sitemap, contact-us
- Public sample APIs for prayers, pujas, deities, festivals, and panchang
- Public detail pages for a prayer, puja, and deity
- Public support page content

## Failing Areas

- `register new user` -> `500`
- `session after register` -> no active session
- `login existing user` -> `500`
- `session after login` -> no active session
- Protected routes:
  - `/home`
  - `/profile`
  - `/bookings`
  - `/contact`
  - `/shared-prayer/create`
  - deity learn route
- Protected mutations:
  - profile update -> `500`
  - gothram suggest -> `500`
  - favorite prayer toggle -> `401` because auth session is missing
- Shared prayer create page content check fails because auth redirect still occurs

## Root Cause

The locally verified fix is present in code, but the deployed site is still serving the earlier broken behavior:

- `/api/web-auth/*` write routes fail with `500`
- `/api/backend/*` write proxy routes fail with `500`

The underlying code issue was reproduced locally and fixed:

1. Express was consuming request bodies before Next route handlers saw `/api/web-auth/*` and `/api/backend/*`.
2. The unified server was patched to skip Express body parsing for those Next-owned API prefixes.
3. The full local production smoke audit then passed `35/36`, with the only remaining local miss being logout cookie clearing under non-HTTPS localhost, which is not representative of deployed HTTPS behavior.

## Verified Local Fix State

The following commits contain the auth/proxy fix path:

- `7a0995e` `fix(web): write auth cookies on response`
- `c0351bc` `fix(web): preserve next request bodies in unified server`

Those commits are pushed to:

- `publish-v8`
- `main`

## Conclusion

Code is fixed locally. The deployed Render service at `https://divya-xbza.onrender.com` is still not serving the corrected build/runtime for authenticated web flows.
