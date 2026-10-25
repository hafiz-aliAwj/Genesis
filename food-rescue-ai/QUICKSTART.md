# Food Rescue AI — start here

## No-key demo

1. Install Node.js 22 or newer.
2. Open a terminal in this folder.
3. Run:

```bash
npm ci
npm run dev
```

4. Open http://localhost:3000 and choose **Explore the live demo**.
5. Select Restaurant, NGO or Volunteer. **Switch demo role** follows the same rescue on one device. **Settings → Reset demo data** starts fresh.

No environment file is required for this mode. You can deploy to Vercel with no variables, but different devices will have independent demo data.

## Shared multi-device demo (recommended)

1. Create a free Supabase project.
2. Run `supabase/schema.sql` once in its SQL Editor.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public publishable/anon key, never a secret/service-role key).
4. Configure Supabase Site URL and allowed redirects for your Vercel domain.
5. Deploy/redeploy. Register the three roles with separate accounts, confirm email and set their locations in Settings.
6. Optionally edit account emails in `supabase/seed.sql` and run it to add fresh listings.

Gemini can remain blank. Matching, urgency, points and all rescue actions still work. Shared devices refresh every ten seconds or when Refresh is clicked.

## Optional photo suggestions

Get a free-tier key, if eligible, at https://aistudio.google.com/apikey. Set `GEMINI_API_KEY` server-side and redeploy. `GEMINI_MODEL` defaults to `gemini-2.5-flash`; model availability and quotas may change. Without a key, enter listing text manually; the app never fakes image analysis.

Read **README.md** for detailed free-key instructions, API routes, schema, security, deployment and troubleshooting. **DEMO.md** contains a three-minute presentation plan. **QA.md** lists executed tests and remaining real-service checks.

Vercel Hobby is for personal/non-commercial use; check its current terms before commercial operation.
