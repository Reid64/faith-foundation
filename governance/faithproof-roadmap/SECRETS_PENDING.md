# Secrets & Manual Steps Pending

Values and actions that must be completed by a human. **Nothing here is stored
in a committed `.env` file** — `.env*.local` is gitignored.

---

## ZEFFY_WEBHOOK_SECRET (Phase 9)

```
ZEFFY_WEBHOOK_SECRET=08cdeab1c85dd73e58c985bf2757b379
```

- Add to Vercel: `vercel env add ZEFFY_WEBHOOK_SECRET production`
- Add to `.env.local` for local testing

**Status: generated but NOT yet enforced.** The current `/api/webhooks/zeffy`
route does not verify a signature, because Zapier's plain "Webhooks by Zapier"
POST action does not compute an HMAC — there is nothing for the endpoint to
check. Signature verification should be switched on the moment either
(a) Zeffy ships a native webhook with a signing secret, or (b) the Zap is moved
to a Code step that signs the body with the value above.

**Consequence while unenforced:** anyone who learns the URL can create *pending*
transactions. They cannot publish anything — every webhook row is written
`status: 'pending'` and `is_public: false`, so it counts toward no public
total until a human confirms it in the Command Center. Treat unexpected pending
rows as spam, not as income.

---

## ANTHROPIC_API_KEY (Phase 18 — AI Intake Assistant)

Required for the intake chat widget. **Not currently set anywhere.**

- Get from: console.anthropic.com → API Keys
- Add to Vercel: `vercel env add ANTHROPIC_API_KEY production`
- Add to `.env.local` locally
- Server-side only — never prefix with `NEXT_PUBLIC_`

Until it is set, `/api/ai/intake` returns a clear "assistant not configured"
message and the widget tells the visitor to use the normal application form.

**Model:** the route defaults to `claude-sonnet-5` and reads an optional
`ANTHROPIC_MODEL` override, so the model can be changed without touching the
system prompt. The phase brief named `claude-sonnet-4-6`; if the default ever
returns a 404 for an unknown model, set `ANTHROPIC_MODEL` rather than editing
the route.

**Program list deviation, recorded deliberately:** the brief's system prompt
offered Single Parent Stability, Emergency Bridge Housing, and a Financial
Literacy Program. All three were retired on 2026-08-14 and their routes now 301
to `/programs`. The shipped prompt offers only the programs FAITH Foundation
actually runs — otherwise the assistant would offer nonexistent help to
families in crisis and collect their income and phone number against it. The
prompt also states explicitly that it cannot decide eligibility.

---

## Jitsi recording and transcription (Phase 19 — Board Meeting Room)

Board meetings run on the **public meet.jit.si server**, which needs no account
and no environment variable. Two consequences:

- **Recording requires a paid 8x8 account.** The Start Recording control exists
  and calls the Jitsi API, but on the free public server it will not produce a
  file. Until that changes, the transcript is added by hand on the minutes page
  (paste, or load a .txt), and Claude drafts the minutes from it.
- **Self-hosting removes both limits.** Jitsi on the spare laptop server makes
  recording free and unlimited, and Whisper transcription can run locally on the
  same machine. When that exists, set `JITSI_SERVER_URL` and point the room at
  it — the domain is the only value the client needs.

Room names are `faithproof-board-<meeting-uuid>` and are not secret, so **lobby
mode is enabled**: the first participant admits everyone else. Knowing a URL is
not enough to sit in a board meeting.

---

## Cloudflare Turnstile (Phase 20 — public form CAPTCHA) — ALREADY SET

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY   # public by design, identifies the widget
TURNSTILE_SECRET_KEY             # server only, never NEXT_PUBLIC_
```

**Both are already set in Vercel production.** This build neither created nor
modified them. Unlike every other entry in this file, nothing is pending.

They are deliberately **not** in local `.env.local`. Consequences, by design:
- **Local / preview without the keys:** the widget renders "Spam protection is
  not configured in this environment", and the server logs a loud warning and
  skips the check, so development is not bricked.
- **Production without the secret:** every submission is refused. A spam gate
  that opens when its checker is missing is not a gate.

For local testing use Cloudflare's published test keys — always passes:
`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`; always
fails: `2x00000000000000000000AB` / `2x0000000000000000000000000000000AA`.

---

## ZOHO_SMTP_PASS (Phase 11 — Mail merge)

Zoho app-specific password for info@faithfoundationsf.org.

- Generate in Zoho Mail → Settings → Security → App Passwords
- Add to Vercel: `vercel env add ZOHO_SMTP_PASS production`

Until it is set, `sendEmail()` logs the message to the server console instead
of sending, and every `email_sends` row is written with
`status = 'failed'` and an explanatory `error_text`. **It never reports a
send that did not happen.**

---

## Twilio (Phase 19 — SMS, not yet built)

`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.

Note: the `contacts` table already carries `sms_consent` and
`sms_consent_date`. US SMS to individuals is TCPA-regulated — do not send to a
contact whose `sms_consent` is false.

---

## Database migrations

Migrations 006–014 were **applied directly to the live database** during the
build (via a direct Postgres connection), so no manual SQL-editor step is
required. The files remain in `supabase/migrations/` as the record.

The `board-minutes` storage bucket (Phase 19, private, 50 MB limit) was created
by calling `GET /api/setup/storage` once as an administrator. That is done, not
pending. The endpoint is safe to call again — an existing bucket is reported,
not recreated.

Verify with: `select table_name from information_schema.tables where table_schema='public'`

---

## Zapier configuration (Phase 9)

See `ZAPIER-SETUP.md` in this directory.
