# Zapier Setup for Zeffy → FaithProof

Zeffy does not offer native webhooks, so a Zapier Zap forwards each donation to
the FaithProof endpoint.

## Trigger
App: Zeffy
Event: New Order / New Donation

## Action
App: Webhooks by Zapier
Event: POST

## URL — USE THE TRAILING SLASH

    https://faithfoundationsf.org/api/webhooks/zeffy/

The project sets `trailingSlash: true`, so the slashless URL answers **308** and
relies on the client re-sending the POST body to the redirect target. Verified
live: curl with `-L` follows it correctly and the donation is recorded, but the
slashless URL returns only `Redirecting...` to a client that does not follow.
Zapier generally follows redirects — do not depend on it. Configure the Zap with
the trailing slash.

## Payload (map Zeffy fields to these keys)
donor_name: [Zeffy donor full name field]
donor_email: [Zeffy donor email field]
amount: [Zeffy amount field]
campaign: [Zeffy campaign/fund name field]
transaction_id: [Zeffy transaction ID field]
date: [Zeffy transaction date field]

## Content Type
application/json

## Testing
After saving the Zap, make a $1 test donation on Zeffy and confirm a **pending**
transaction appears at /admin/transactions.

You can also test the endpoint directly:

```
curl -X POST https://faithfoundationsf.org/api/webhooks/zeffy \
  -H "Content-Type: application/json" \
  -d '{"donor_name":"Test Donor","donor_email":"test@example.com","amount":"1.00","campaign":"General","transaction_id":"test-001","date":"2026-08-16"}'
```

Expected: `{"ok":true,"transaction_id":"..."}`. Re-sending the same
`transaction_id` returns `{"ok":true,"duplicate":true}` and creates nothing.
Delete the test row afterwards.

## What the endpoint does
1. Parses the payload (amount accepts `$1,234.56`, `1234.56`, or a number).
2. Maps the campaign name to a fund designation; anything unrecognised becomes
   `unrestricted`.
3. Refuses duplicates on `zeffy_transaction_id` — both by an up-front check and
   by a UNIQUE constraint, which is what actually holds under concurrent
   deliveries.
4. Inserts the transaction as **pending** and **not public**.
5. Writes an `audit_log` entry with `actor_id = NULL` and action
   `transaction.created_via_webhook`.
6. Links the donation to a CRM contact by email, creating one if new. A CRM
   failure is logged but never loses the donation.

## Important
Every webhook donation lands as **pending**. It counts toward no public total
until an administrator confirms it in the Command Center. That is deliberate: an
unauthenticated endpoint must not be able to publish a number on the public
transparency page.
