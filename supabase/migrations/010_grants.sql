-- ═══════════════════════════════════════════════════
-- PHASE 13 — GRANT TRACKING
-- ═══════════════════════════════════════════════════
--
-- Two deliberate additions to the brief, both recorded here rather than made
-- silently:
--
--   1. WITH CHECK mirrors USING on the policy. FOR ALL without WITH CHECK
--      leaves INSERT and UPDATE unconstrained on the new row, so a staff
--      account could write a row it would not be allowed to read back.
--
--   2. transaction_id column. The "Add to Transactions" button records an
--      awarded grant as revenue; without somewhere to remember that it already
--      ran, a second click books the same award twice. The column is set on
--      success and the button reads as done once it is populated.

CREATE TYPE grant_status AS ENUM (
  'prospect',
  'researching',
  'applied',
  'awarded',
  'reporting',
  'closed',
  'declined'
);

CREATE TABLE grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  funder TEXT NOT NULL,
  -- INTEGER cents caps at ~$21.4M, the same ceiling transactions and vouchers
  -- already carry. Well above any grant FAITH Foundation is pursuing.
  amount_cents INTEGER,
  status grant_status NOT NULL DEFAULT 'prospect',
  program TEXT,
  fund fund_designation,
  application_deadline DATE,
  award_date DATE,
  reporting_deadline DATE,
  reporting_period TEXT,
  application_notes TEXT,
  award_notes TEXT,
  reporting_notes TEXT,
  contact_name TEXT,
  contact_email TEXT,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grants_status ON grants (status);
CREATE INDEX IF NOT EXISTS idx_grants_reporting_deadline ON grants (reporting_deadline);
CREATE INDEX IF NOT EXISTS idx_grants_application_deadline ON grants (application_deadline);

ALTER TABLE grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal users can manage grants" ON grants FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));

CREATE TRIGGER trg_grants_updated_at BEFORE UPDATE ON grants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
