# Food Rescue AI

**Good food. Not goodbye.** A dark, responsive food-rescue MVP for restaurants, NGOs and volunteers. Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn-style Radix/CVA Button, Framer Motion, Supabase Auth/PostgreSQL/Storage, OpenStreetMap and optional Gemini.

> This is a runnable MVP, not a certified food-safety system or an audited production service. Production build and local workflow/security tests are included. Hosted Supabase, Gemini and a Vercel deployment must be tested using your accounts before launch. No deployment or connected-service provisioning has been performed for you.

## Start in 60 seconds — absolutely no keys

Requirements: Node.js **22+** and npm. Run from the extracted project folder:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000**. Leave environment variables blank. Choose **Explore the live demo**, then a role. The application starts with useful, clearly labelled sample data. Demo roles are not real authentication. Supabase is used for real accounts.

Build and run the same production bundle used by Vercel:

```bash
npm test
npm run build
npm start
```

### Important: “works on separate devices” has two meanings

| Mode                         | Runs on every device on a public Vercel URL? | Shares changing data across devices?                 | Real accounts?       |
| ---------------------------- | -------------------------------------------- | ---------------------------------------------------- | -------------------- |
| No keys (browser demo)       | Yes                                          | **No** — each browser has its own localStorage       | No — role simulation |
| Free Supabase, no Gemini key | Yes                                          | **Yes** — refreshes every 10 seconds, or use Refresh | Yes                  |
| Supabase + optional Gemini   | Yes                                          | Yes                                                  | Yes                  |

**Recommended multi-device presentation: free Supabase with Gemini left blank.** All reservations, deliveries and points work without any generative-AI key. Deterministic matching, urgency and impact work in every mode. Do not use Vercel process memory or local files as shared storage: serverless instances are ephemeral and independent.

Keyless uploads are resized to 1024px JPEG to conserve browser storage. Reset examples in Settings when preparing a new presentation. Sample expiry times are generated at the first visit/reset, not on every reload. Listings can expire naturally during a long demo.

## Free environment variables — where to get each one

| Variable                        | Required?            | How to obtain it                                                                                                                                                                                   |
| ------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Only for shared mode | Create a free project at https://supabase.com/dashboard. Open the project **Connect** dialog and copy the project URL, typically `https://YOUR_PROJECT.supabase.co`. Do not append `/rest/v1`.     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Only for shared mode | Project **Settings → API Keys**. Copy the **publishable key** (`sb_publishable_...`) or legacy **anon** key. The variable retains its conventional ANON name but accepts either public client key. |
| `GEMINI_API_KEY`                | Optional             | https://aistudio.google.com/apikey → Create API key. Select a project with free-tier access. Availability, model access and quotas vary by region/account and can change.                          |
| `GEMINI_MODEL`                  | Optional             | Defaults to `gemini-2.5-flash`. Choose an available **image-capable** model in AI Studio if your account no longer offers that model. This is a model identifier, not a secret.                    |

**Never use a Supabase secret key or service-role key in `NEXT_PUBLIC_` variables.** They bypass RLS. This application needs no service-role key, PostgreSQL connection password, Google Maps key, OAuth client ID or Vercel token. A Gemini key must remain server-only. Leave BOTH Supabase variables blank for the browser demo; set BOTH for shared mode.

Official references (verify current quotas and terms):

- https://supabase.com/docs/guides/api/api-keys
- https://supabase.com/pricing
- https://ai.google.dev/gemini-api/docs/api-key
- https://ai.google.dev/gemini-api/docs/billing
- https://ai.google.dev/gemini-api/docs/pricing
- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/limits/fair-use-guidelines

## Supabase setup (shared mode)

1. Create a **new** free Supabase project. Store the database password securely; this app does not need it in its environment.
2. Open **SQL Editor**, paste `supabase/schema.sql`, and run it **once**. This is an initial migration for an empty project, not an idempotent script. It creates the tables, indexes, profile trigger, atomic workflow functions, RLS policies, grants, quota limiter and `food-images` bucket.
3. Under **Authentication → URL Configuration**, set **Site URL** to your stable Vercel domain, e.g. `https://food-rescue-ai.vercel.app`. Add `http://localhost:3000/**` for local development and the exact trusted production/preview domains you will use. Avoid a broad wildcard over other people's Vercel sites.
4. Enable the **Email** provider. Email confirmation should remain enabled for a public launch. For a private hackathon test you can use the Auth dashboard to confirm your test accounts. Default email sending has provider limits; configure a suitable SMTP service before public onboarding.
5. Set the two public Supabase environment values in `.env.local` and restart `npm run dev`. In Vercel, configure the same values and redeploy (public variables are embedded at build time).
6. Sign up as a Restaurant, NGO and Volunteer using three distinct email accounts. Select the correct role at registration. A trigger creates each profile automatically.
7. Verify email and log in. In **Settings**, set the actual organisation name, address, coordinates and NGO meal capacity. The default `0,0` profile location is not a useful match. NGO profiles without a configured address are excluded from recommendations.
8. Optional: edit the three account emails in `supabase/seed.sql`, then run it in SQL Editor. It adds fresh example donations to the restaurant account. It does not create passwords or grant anonymous write access. Running the seed again inserts more listings, so normally run it once.
9. Open the app on separate devices/browsers. Log into a different role on each. Changes appear on the next 10-second refresh; Refresh forces an immediate update.

Food photos go to Supabase Storage in the uploader’s folder. The bucket is public so photos must not include private people or documents. Only authenticated restaurants can upload JPG/PNG/WebP files up to 4 MB. Listing photo is optional. Failed photos display an intentional category fallback. No geocoding service is used: enter coordinates from OpenStreetMap.

## Vercel deployment

1. Create a GitHub repository and push this folder (include `package-lock.json`; exclude `.env.local`, `node_modules`, `.next`).
2. Vercel → **Add New → Project** → import the repository.
3. Framework: **Next.js**. Root directory: project folder. Node runtime: **22.x** or a supported newer version. Build command `npm run build`; install command `npm ci`. Keep the default Next.js output directory.
4. **No-key presentation:** add no environment variables. Deploy and share the HTTPS URL. Each device has independent demo examples; switching roles on a single device demonstrates the full flow.
5. **Shared presentation:** add the Supabase URL and publishable/anon key. Leave Gemini blank if you don’t have a key. Deploy, update Supabase Site URL/allowed redirects, create or confirm test accounts, and seed as above.
6. Optional image suggestions: add `GEMINI_API_KEY` and optionally `GEMINI_MODEL`, then redeploy. The endpoint requires a signed-in restaurant and enforces 10 attempts/account/UTC day in PostgreSQL.
7. Check `/api/health` and run the manual checklist below on the deployed URL. Do not assume a successful build proves external integrations work.

**Free plan caveat:** Vercel Hobby is restricted to personal/non-commercial use. A personal hackathon demo may fit; commercial startup operation can require a paid plan. Check current terms for your use case. Supabase and Gemini free tiers have limits; free access is not a promise of unlimited availability. Supabase free projects may pause during inactivity; open/check the project before presenting. OpenStreetMap embeds require network access and carry their own attribution. No map key is needed.

## Feature and page map

| Route               | Purpose                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| `/`                 | Editorial landing page, mobile navigation, role entry                                                 |
| `/about`            | Mission, matching explanation and food-safety limits                                                  |
| `/signup`, `/login` | Role signup, password login, email confirmation, password recovery; demo role entry when unconfigured |
| `/dashboard`        | Role-aware statistics, active opportunities and recognition                                           |
| `/donations`        | History/listings/deliveries, status tabs, search, category filters, urgency/distance/quantity sorting |
| `/donations/new`    | Restaurant form, photo upload, optional image suggestions, pickup/expiry/location                     |
| `/donations/:id`    | Listing, OpenStreetMap, receiving destination and route link, NGO recommendations, lifecycle actions  |
| `/impact`           | Network or personal completed-meal impact with explicit assumptions                                   |
| `/leaderboard`      | Restaurant/volunteer rankings and badge/points rules                                                  |
| `/settings`         | Profile, coordinates, capacity, password update, demo reset                                           |

Anonymous users can read the landing/about pages. Connected community data requires sign-in. The interface has loading, error, empty, expired and permission states. Notifications are a lightweight in-app inbox, not email/push delivery.

## State machine and security

```text
Restaurant creates → available
NGO reserves → reserved + an open volunteer task
Volunteer accepts → task accepted
Volunteer collects → collected + 10 pickup points
Volunteer delivers → completed + 15 delivery points (25 if urgent)
Alternative: NGO confirms self-pickup before any volunteer accepts → completed
Completion → restaurant points + one analytics record
```

`transition_donation` locks the donation row and validates the authenticated user, role, ownership, previous state, pickup time and expiry inside one PostgreSQL transaction. Two NGOs cannot reserve the same donation. Repeated completion cannot mint more rewards. NGO self-pickup is blocked after volunteer acceptance. Expired food cannot be reserved, accepted or collected. A volunteer may record delivery of already collected food after expiry for audit accuracy; that does **not** certify it safe to eat. Expired delivery receives standard points, not an urgency bonus. Coordinate food safety offline.

- RLS is enabled on every public table.
- Public client keys are safe to expose only with correct RLS/grants; anonymous users cannot read the directory or donations.
- Names, roles and locations form a signed-in community directory; participant IDs and lifecycle data are visible to authenticated members. Auth emails/passwords never appear in the public profiles table. This is deliberately a small trusted-community MVP, **not** a tenant-isolated enterprise deployment.
- Clients cannot directly modify workflow state, rewards, analytics or notifications.
- Role is immutable through client profile updates; only name, location, coordinates and capacity are writable.
- Private image analysis authenticates the bearer token, checks restaurant role, consumes a persistent per-account quota, validates image size/type, times out requests, and validates Gemini’s JSON. Gemini never evaluates food safety.
- Sessions persist via the Supabase browser client, auto-refresh and are cleared on signout. Auth access is ultimately enforced by RLS, not the UI redirect.
- Browser localStorage is not a trusted identity store; never treat keyless role simulation as authentication.

### Matching, urgency, points and impact

Matching is an **explainable heuristic**, not a trained model:

- Distance score: `max(0, 1 − straightLineKm / 30)`.
- Quantity score: `min(NGO capacity / meal quantity, 1)`.
- Urgency score: if expiry is within two hours, `max(0, 1 − km / 10)`, otherwise `0.8`.
- Match percentage: `round(100 × (0.5 × distance + 0.3 × quantity + 0.2 × urgency))`.
- Urgency: expired ≤0h; High ≤2h; Medium ≤6h; Low >6h. It is time-based, not an assessment of food condition.
- Restaurant rewards: <10 meals →10; 10–29→25; 30+→50, on completion.
- Volunteer rewards: pickup→10, delivery→15, urgent delivery→25 **instead of** 15.
- Restaurant badges: Food Saver 10+, Community Hero 150+, Platinum Donor 500+.
- Volunteer badges: Helper 10+, Rescuer 100+, Champion 300+.
- Saved meals count only completed donations. Weight estimate = meals×0.4 kg; CO₂e estimate = weight×2.5; environmental/impact score = min(100, round(meals/5)). Assumptions are explicitly labelled and are not scientifically audited claims. Adjust `src/lib/domain.ts` and SQL analytics factors together if changing the model.

The `badges` table stores badge definitions; the current highest badge is derived from immutable point totals rather than duplicated in a user field. `analytics` is an immutable completion ledger; UI totals are derived from visible completed donations. No fake historical trends are shown.

## API

The UI uses Supabase’s RLS-protected Data API and RPC directly. Next.js also exposes REST endpoints for integrations. **No service-role key** is used.

| Endpoint                                       | Auth                                         | Purpose                                                                                 |
| ---------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| `GET /api/health`                              | None                                         | App mode/feature configuration, no secrets                                              |
| `GET /api/donations?status=available&offset=0` | Bearer access token                          | Listing page, 50 per request                                                            |
| `POST /api/donations`                          | Restaurant bearer token                      | Validated donation creation; JSON fields below                                          |
| `POST /api/donations/:id/transition`           | Bearer token                                 | `{ "action": "reserve" }`; accepted actions: reserve, accept, collect, deliver, confirm |
| `POST /api/analyze`                            | Restaurant bearer token in connected AI mode | multipart `image`; returns suggested food_name/category/description                     |

Donation body: `food_name`, `category`, optional `image_url` (HTTPS), integer `quantity`, ISO-8601 `pickup_at` and `expires_at`, `location`, numeric `lat` and `lng`, `description`. Owner and state are server-controlled.

In keyless/unconfigured mode `/api/analyze` returns a clear manual-entry notice, **not fabricated image analysis**. Deterministic matching remains available without Gemini. Photos sent to Gemini are processed by Google; disclose this to real users and check free-tier data-use terms before sending sensitive content.

## Folder structure

```text
src/
  app/
    [[...path]]/page.tsx       App Router entry for application routes
    api/health/route.ts        Health/status
    api/analyze/route.ts       Authenticated Gemini image suggestions
    api/donations/route.ts     REST listing/creation
    api/donations/[id]/transition/route.ts
    globals.css               Responsive dark design + Tailwind
    layout.tsx                Metadata/root layout
    not-found.tsx
  components/
    app.tsx                   Public pages, role-aware screens, forms
    provider.tsx              Auth/session, Supabase/local adapters
    ui/button.tsx             Radix Slot/CVA shadcn-compatible Button
  lib/
    domain.ts                 Types, seed factory, scoring/impact/points
    supabase.ts               Optional browser client
    api.ts                    Bearer-authenticated server client
    utils.ts                  clsx/tailwind-merge
supabase/
  schema.sql                  Initial migration, RLS, storage, RPCs
  seed.sql                    Fresh examples for real test accounts
scripts/
  smoke.cjs                   Browser smoke tests and screenshots
  screenshot-audit.cjs        Public and role page capture + overflow checks
tests/
  domain.test.ts              Matching, points, expiry, impact tests
  database.test.ts            Actual PostgreSQL engine tests (PGlite)
.env.example
README.md
DEMO.md
QA.md
```

The single optional catch-all keeps the MVP cohesive; public URLs remain distinct and refreshable. The shared provider handles both storage modes. The UI uses the shadcn composition pattern and a real Radix/CVA Button; not every card or input is a third-party component. Add further shadcn components using the included `components.json` as needed.

## Test and launch checklist

```bash
npm ci
npm test
npm run build
npm start
```

`npm test` executes domain tests and a local PostgreSQL-compatible integration suite using PGlite. It stubs the Supabase auth/storage schemas only; the actual migration, RLS, column grants, triggers, functions and transactions are executed. It does not replace a hosted Supabase integration test.

1. On two or three devices, sign into separate real roles on the same Supabase project.
2. Restaurant creates a donation with safe expiry; verify Storage image upload and persisted reload.
3. NGO reserves it; another NGO attempting reservation receives an error.
4. Volunteer accepts, collects after pickup start, and delivers. Verify restaurant points, volunteer points, completed history, destination and notifications on each account.
5. Test NGO self-pickup on a second donation. Do not award volunteer points for this branch.
6. Verify expired reservation rejection and repeat-click reward protection.
7. Test signup confirmation, logout, session restoration and password recovery via your deployed domain.
8. With Gemini configured, test a real image, a non-food image, quota exhaustion and a provider failure. Without a key, ensure manual entry remains usable.
9. Test phone width, navigation, uploads, keyboard focus, reduced motion, empty results, offline image fallback and OpenStreetMap attribution.
10. Check plan quotas, trusted-user onboarding, privacy notices, backup strategy, SMTP, incident response, food-donation laws and food-safety procedures before a real public launch.

## Known MVP boundaries

No payment processing, organisation vetting, moderation/admin console, address geocoding, live GPS tracking, SMS/email notifications, realtime WebSockets, cancellation/reassignment, food certification or legal policy is implemented. Connections refresh every 10 seconds. The UI currently loads the authenticated community dataset for a small MVP; add server pagination and scoped directory queries for larger deployments. OSM route links are external and may not cover every region. Badges are highest-tier derived labels, not individually issued certificates. Browser demo data does not synchronize even between separate tabs automatically.

For a public production launch add abuse protection/CAPTCHA at signup, email delivery, account deletion/retention, privacy/terms, trusted partner verification, rate limiting beyond AI calls, storage cleanup, monitoring, backups and operational review. Vercel is the deployment target, not evidence that a deployment has happened.

### Optional browser QA scripts

With the production server running, install Playwright separately if it is not available, then run `npm run test:smoke` and `npm run test:visual`. Set `CHROMIUM_PATH` to your Chromium executable (or adapt the scripts to Playwright's bundled browser), `BASE_URL` for another local/deployed URL, and `SHOT_DIR` for screenshot output. These scripts test **keyless mode**; do not run the role-simulation scripts against a shared-mode deployment.

The project pins Next.js 15.5.28 and overrides its PostCSS dependency to a patched 8.5.x release. Keep the lockfile and periodically run `npm audit`; dependency advisories change over time. Zod 4 is used for request/AI output validation.
