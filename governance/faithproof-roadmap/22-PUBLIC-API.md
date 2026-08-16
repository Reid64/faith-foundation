# Phase 22 — Public API

## Objective
RESTful API allowing partner organizations, HUD counselors, and other nonprofits to query FAITH Foundation's public transparency data programmatically.

## Base URL
https://faithfoundationsf.org/api/v1/public/

## Endpoints

GET /api/v1/public/stats
Returns: total_donations, vouchers_disbursed, promises_kept, overhead_rate
Auth: none required

GET /api/v1/public/transactions
Returns: paginated list of is_public=true confirmed transactions
Query params: page, per_page, fund, type, date_from, date_to
Auth: none required

GET /api/v1/public/promises
Returns: paginated list of is_public=true promises with status
Auth: none required

GET /api/v1/public/documents
Returns: list of is_public=true verified documents with external_url
Auth: none required

GET /api/v1/public/funds
Returns: fund balances and allocation percentages
Auth: none required

## Rate Limiting
100 requests per hour per IP
Return 429 with Retry-After header when exceeded

## Response Format
JSON with envelope: { data: [...], meta: { total, page, per_page } }
All amounts in cents and formatted dollars

## Documentation Page
/api/v1/public/docs — simple HTML documentation page listing all endpoints with examples

## Build-time notes (added at spec creation, not part of the original brief)

1. **Reuse `src/lib/faithproof/public.ts` — do not re-query.** It already
   implements every one of these reads with the correct filters
   (`is_public = true AND status = 'confirmed'`, verified documents, public
   promises) and is what /faithproof and the explorer use. A second
   implementation is a second place for a filter to drift and start publishing
   rows that should be private.
2. **Never select donor or recipient names.** The public page deliberately never
   queries them. An API is far easier to scrape than a web page, so the column
   list must be explicit — never `select("*")`.
3. **Use the anon client, not the service-role client.** RLS is then a second
   line of defence behind the explicit filters. Using `supabaseAdmin` here would
   remove that safety net entirely on a public, unauthenticated endpoint.
4. **`per_page` must be capped** (e.g. max 100) or a single request can pull the
   entire ledger and become a denial-of-service vector.
5. **Rate limiting needs shared state.** Vercel serverless instances do not share
   memory, so an in-process counter does not work. Use Vercel KV, Upstash, or a
   Postgres table — and note that per-IP limiting is weak behind shared NATs.
6. **Set CORS deliberately.** Partner orgs calling from a browser need
   `Access-Control-Allow-Origin`; decide whether that is `*` (fine for genuinely
   public data) or an allowlist.
7. **Version the response shape, not just the URL.** `/v1/` is in the path;
   treat the envelope as a contract once a partner depends on it.
8. **Add `/api/v1/public/docs` to the sitemap exclude list** — it is a docs page,
   not a marketing page, and should not compete in search.
