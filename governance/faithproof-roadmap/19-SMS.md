# Phase 19 — SMS Notifications

## Objective
Send SMS notifications via Twilio for application status updates, volunteer reminders, donation confirmations. Reaches families without reliable email.

## Environment Variables
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER — FAITH Foundation's Twilio number

## SMS Types
Application status update: "Your FAITH Foundation application status has been updated to [status]. Visit faithfoundationsf.org/apply-portal for details."
Volunteer reminder: "Reminder: You're signed up to volunteer for [event] on [date] at [time]. Thank you!"
Donation confirmation: "Thank you for your $[amount] gift to FAITH Foundation. Your generosity helps Texas families reach homeownership."
Voucher issued: "Great news! Your FAITH Foundation housing voucher has been approved. Check your email for details."

## Implementation
File: src/lib/sms.ts — Twilio client wrapper
send(to: string, message: string): Promise<void>

## Integration Points
Call send() from:
  - Application status change server actions
  - Volunteer shift confirmation
  - Transaction confirmation (if donor phone on file)
  - Voucher approval

## Pages
### /admin/settings — add SMS section
Twilio credentials status (connected/not connected)
Test SMS button — sends test message to admin phone

## Build-time notes (added at spec creation, not part of the original brief)

1. **Consent is a legal requirement, not a nicety.** US SMS to individuals falls
   under TCPA; sending without prior express consent carries statutory damages
   per message. The `contacts` table has no consent field. Add one
   (`sms_consent BOOLEAN`, `sms_consent_at TIMESTAMPTZ`) and gate every send on
   it before this ships.
2. **STOP/HELP handling is mandatory.** Twilio auto-replies to STOP on its
   numbers, but the opt-out must be written back to the contact record or the
   next campaign re-messages someone who opted out. That needs an inbound
   webhook.
3. **`send()` returning `Promise<void>` hides failures.** A silent SMS failure on
   a voucher approval means a family is never told. Return a result, record it
   (an `sms_sends` table mirroring `email_sends`), and never let a send failure
   roll back or block the status transition that triggered it.
4. **Do not put dollar amounts or approval decisions in SMS lightly.** Messages
   land on lock screens. The voucher text already avoids details — keep that
   discipline for the donation confirmation too, or make it opt-in.
5. **Phone numbers need E.164 normalisation** before Twilio will accept them;
   the CRM stores free-text `phone`.
6. **`twilio` is not currently a dependency.**
