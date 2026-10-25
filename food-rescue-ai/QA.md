# Validation and handoff

## Executed locally

- Next.js 15.5.28 production build: passed.
- TypeScript checking: passed during the production build.
- Seven automated test cases: passed. Domain cases cover urgency boundaries, distance, point thresholds, completed-only impact, weighted matching and role badges. The PostgreSQL integration case executes the migration and tests role restrictions, column grants, direct-write denial, reservation conflicts, ownership checks, once-only collection/completion rewards, analytics creation, anonymous read denial and the persistent AI quota.
- Mobile production-browser smoke test at 390 × 844: passed. Created a donation, reserved as NGO, accepted/collected/delivered as volunteer, checked points and persisted reload, completed a separate NGO self-pickup, tested empty search, mobile navigation, Settings updates, API manual fallback and an independent browser's separate demo state.
- Captured 46 route/role/viewport combinations at widths 1440 and 390, plus the mobile menu. Automated checks found no horizontal document overflow and no uncaught browser page errors. Inspected the distinct screen layouts and mobile interaction layout visually.
- Runtime dependency audit: no known vulnerabilities reported by `npm audit --omit=dev` at generation time. This is point-in-time evidence, not a permanent security guarantee. Next.js remains on the requested 15.x line; PostCSS is patched via an npm override and Zod is on 4.x.

## Not executed with real external credentials

- Hosted Supabase sign-up/email confirmation, password recovery, cloud Storage uploads and cross-device updates.
- Gemini model inference, provider quotas and account-specific model availability.
- A real Vercel deployment, production redirect URLs, SMTP delivery and device-specific Safari/Android testing.

Use the real-service checklist in README.md after supplying your environment variables. This package contains no secrets and has not been deployed on your behalf.

## Explicit operating boundaries

No-key demo uses independent per-browser storage and simulated roles. Shared mode requires Supabase, even with Gemini disabled. Matching is heuristic and impact is an estimate. Photos do not prove food safety. Public launch requires partner verification, applicable legal/food-safety procedures, privacy/retention policies, abuse prevention, monitoring, backups and operational ownership.
