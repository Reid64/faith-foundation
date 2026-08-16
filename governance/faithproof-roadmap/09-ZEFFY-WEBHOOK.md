# Phase 9 — Zeffy Webhook + Auto-Population

## Objective
Every donation made through Zeffy on faithfoundationsf.org auto-creates a pending transaction in FaithProof without manual entry. Admin confirms it in the Command Center.

## Zeffy Webhook Details
Zeffy sends a POST request to a configured endpoint on every completed donation.
Endpoint to build: POST /api/webhooks/zeffy
Zeffy webhook payload includes: donor name, donor email, amount, fund designation, transaction ID, timestamp, campaign name.

## Database Changes
Add to transactions table:
- zeffy_transaction_id TEXT UNIQUE — Zeffy's internal transaction ID
- zeffy_campaign TEXT — campaign name from Zeffy
- donor_email TEXT — donor email (used for CRM auto-linking)

Migration file: supabase/migrations/006_zeffy_webhook_fields.sql

## API Route
File: src/app/api/webhooks/zeffy/route.ts
Method: POST
Auth: verify Zeffy webhook signature header (x-zeffy-signature) against ZEFFY_WEBHOOK_SECRET env var using HMAC-SHA256
On valid request:
  1. Parse payload
  2. Check zeffy_transaction_id not already in DB (idempotency)
  3. Insert transaction: type=donation, status=pending, amount_cents=amount*100, fund=map from campaign name, donor_name, donor_email, donor_anonymous=false, zeffy_transaction_id, zeffy_campaign, transaction_date=today, is_public=false
  4. If donor email exists in CRM contacts table: link transaction to contact, log interaction
  5. If donor email not in CRM: create new CRM contact with type=donor
  6. Insert audit_log entry
  7. Return 200 OK

Fund mapping from Zeffy campaign names:
  "Housing Voucher" → housing_voucher
  "Veterans" → veterans
  "Recovery" → recovery
  "Reentry" → reentry
  "Single Parent" → single_parent_stability (note: not in current enum — add if needed)  
  "Emergency" → operational
  "Financial Literacy" → financial_literacy
  "General" or anything else → unrestricted

## Environment Variables needed
ZEFFY_WEBHOOK_SECRET — add to .env.local and Vercel production

## Admin UX
Command Center "Requires Attention" panel already shows pending transactions.
No additional UI needed — webhook auto-populates, admin confirms.

## Zeffy Configuration
After building: go to Zeffy dashboard → Settings → Webhooks → add endpoint https://faithfoundationsf.org/api/webhooks/zeffy

## Build-time notes (added at spec creation, not part of the original brief)

These are open questions to resolve when Phase 9 is actually built. They are
recorded here so the build does not stall on them.

1. **`single_parent_stability` is not a `fund_designation` value.** The current
   enum is: housing_voucher, financial_literacy, veterans, recovery, reentry,
   operational, unrestricted. The spec flags this itself. Note also that Single
   Parent Stability was retired as a program on 2026-08-14, and
   `financial_literacy` is deliberately excluded from the fund dropdowns for new
   records (see SELECTABLE_FUNDS in src/lib/faithproof/types.ts) for the same
   reason. Decide at build time whether to add the enum label or map that
   campaign to `unrestricted`.
2. **Webhook writes cannot use the user's Supabase client.** A webhook has no
   session, and RLS grants INSERT on transactions only to `role = 'admin'`. The
   route must use the service-role client (src/lib/supabase/service.ts), which
   is exactly what that client exists for.
3. **`audit_log.actor_id` references `profiles(id)`.** A webhook has no acting
   user, so the entry must either use a NULL actor or a dedicated system
   profile. NULL is allowed by the schema.
4. **Confirm Zeffy's actual signature scheme before building.** The HMAC-SHA256
   header name and payload shape above are assumptions; verify against Zeffy's
   current webhook documentation, because a wrong verification either rejects
   every real donation or accepts forged ones.
5. **Idempotency needs the UNIQUE constraint to do the work.** Check-then-insert
   races under concurrent deliveries; rely on `zeffy_transaction_id UNIQUE` and
   treat a 23505 as "already recorded, return 200".
