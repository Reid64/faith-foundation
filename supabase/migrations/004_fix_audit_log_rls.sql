-- ═══════════════════════════════════════════════════
-- FAITHPROOF — TIGHTEN audit_log INSERT POLICY
-- ═══════════════════════════════════════════════════
--
-- 001 shipped:
--
--     CREATE POLICY "System can insert audit log entries"
--       ON audit_log FOR INSERT WITH CHECK (TRUE);
--
-- WITH CHECK (TRUE) is unconditional, so the `anon` role — every anonymous
-- visitor to the public website — could insert arbitrary rows into the audit
-- log. On a product whose entire purpose is a tamper-evident record of what the
-- Foundation did with donated money, an append-anything log is worse than no
-- log: it looks authoritative while being forgeable by anyone.
--
-- Flagged as an open item at the end of Phase 1 and closed here.
--
-- Requiring `auth.uid() IS NOT NULL` limits inserts to signed-in users. This is
-- the change specified for Phase 2 and it removes anonymous write access.
--
-- KNOWN REMAINING GAP, recorded deliberately rather than silently widened:
-- any authenticated user can still insert an entry naming any actor_id, because
-- the check does not compare actor_id to auth.uid(). Every write path in the
-- application sets actor_id from the server-side session, so the application
-- cannot produce a forged row — but the REST API would accept one. Closing that
-- needs `WITH CHECK (auth.uid() = actor_id)`, which is a stricter contract than
-- Phase 2 specified and would break any future server-side writer that logs on
-- behalf of another user. Revisit when the Phase 3 write paths are designed.

-- Both DROPs run before the CREATE so this migration is idempotent. There is no
-- migration-tracking table in this project — migrations are applied by hand —
-- so a re-run must not fail on "policy already exists". It did exactly that on
-- first application, because the policy had already been created directly in
-- the Supabase SQL editor.
DROP POLICY IF EXISTS "System can insert audit log entries" ON audit_log;
DROP POLICY IF EXISTS "Authenticated users can insert audit log entries" ON audit_log;

CREATE POLICY "Authenticated users can insert audit log entries"
  ON audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
