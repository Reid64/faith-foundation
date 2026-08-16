-- ═══════════════════════════════════════════════════
-- PHASE 9 — ZEFFY WEBHOOK FIELDS
-- ═══════════════════════════════════════════════════
--
-- Adds the columns the Zeffy/Zapier webhook writes, plus the fund labels the
-- campaign mapper can produce.
--
-- TWO SYNTAX CORRECTIONS vs the brief, both required for this to run at all:
--
-- 1. `ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS` is NOT valid PostgreSQL —
--    there is no IF NOT EXISTS clause on ADD CONSTRAINT. It is wrapped in a
--    DO block that checks pg_constraint instead, which is idempotent.
-- 2. `ALTER TYPE ... ADD VALUE` cannot run inside a transaction block. The
--    three enum additions are therefore at the end of this file and MUST be
--    executed as separate statements outside any BEGIN/COMMIT. Applied that
--    way against the live database.

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS zeffy_transaction_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS zeffy_campaign TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS donor_email TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transactions_zeffy_transaction_id_key'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT transactions_zeffy_transaction_id_key
      UNIQUE (zeffy_transaction_id);
  END IF;
END $$;

-- The UNIQUE constraint is what actually enforces idempotency. The webhook's
-- check-then-insert races under concurrent Zapier deliveries, so a 23505 from
-- this constraint is treated as "already recorded" and answered 200.

-- ── Enum additions — run OUTSIDE a transaction ──────────────────────────────
-- 'single_parent_stability' and 'emergency_bridge' name programs that were
-- RETIRED from the public site on 2026-08-07 / 2026-08-14. They are added only
-- so historical Zeffy campaigns can be mapped without data loss; both are
-- excluded from SELECTABLE_FUNDS in src/lib/faithproof/types.ts so neither can
-- be chosen for a new record, exactly as 'financial_literacy' already is.

ALTER TYPE fund_designation ADD VALUE IF NOT EXISTS 'single_parent_stability';
ALTER TYPE fund_designation ADD VALUE IF NOT EXISTS 'emergency_bridge';
ALTER TYPE fund_designation ADD VALUE IF NOT EXISTS 'cornerstone_communities';
