# A calm, three-minute demo

## Prepare

- **Single-device, no keys:** open Settings → Reset demo data, then choose Restaurant.
- **Multiple devices, shared story:** configure free Supabase, set locations, seed fresh listings, log into Restaurant on a laptop, NGO on another browser/device, Volunteer on a third. No Gemini key is needed. Check that the free database is awake.
- Explain that images and seeded examples are illustrative; food safety is verified by people.

## 1. Start with the kitchen (45 seconds)

“Good food shouldn’t become waste just because the lunch rush ended.”

Show the landing page and Restaurant overview. Create a donation with a photo, quantity, pickup start and expiry. Image suggestions are optional; if Gemini isn’t configured, enter the description yourself. Never pretend a manual suggestion is image analysis.

## 2. Show the connection (45 seconds)

Open NGO → Find food. On a single-device demo use **Switch demo role**; shared mode uses another signed-in device. Show category/search filters, urgency, the map and explainable match score. Reserve the donation. Use Refresh on other devices if you don’t want to wait up to 10 seconds.

## 3. Make the rescue (45 seconds)

Switch/open Volunteer. Find the reserved donation’s delivery. Accept pickup, mark collected once pickup is allowed, then mark delivered. The destination and OSM route link are on the details page.

## 4. Close on outcomes (45 seconds)

Return to Restaurant/Impact. Completed meals count toward estimated waste prevented and CO₂e avoided; points and badges reflect completed actions, not promises. Open the leaderboard.

“This is a coordination layer for a trusted local network: restaurants provide the food, NGOs know the need, volunteers close the gap.”

## Be direct if asked

- “Does it work without keys?” Yes, on any device; each browser gets independent data. Shared, cross-device updates use free Supabase.
- “Is the matching really AI?” It is an explainable weighted matching heuristic. Gemini powers optional image-to-listing suggestions, not the match score.
- “Can the AI tell if the food is safe?” No. People verify ingredients, storage, expiry and handling.
- “Are the environmental numbers audited?” No. They are transparent estimates using fixed assumptions.
- “Is it ready for real-world scale?” It’s a functioning MVP with database security, not a replacement for partner verification, food-safety operations or production monitoring.
