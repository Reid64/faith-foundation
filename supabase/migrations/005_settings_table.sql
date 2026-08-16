-- ═══════════════════════════════════════════════════
-- FAITHPROOF — SETTINGS TABLE
-- ═══════════════════════════════════════════════════
--
-- Key/value store for the toggles that control which sections appear on the
-- public /faithproof transparency page.
--
-- NOTE on the RLS policy below: it selects FROM profiles, which is the exact
-- shape that caused the infinite recursion fixed in 002. It is safe HERE and
-- not on `profiles` itself — the recursion in 002 happened because a policy ON
-- profiles queried profiles. A policy on a different table may read profiles
-- normally, and profiles' own SELECT policies now resolve without recursing.
-- Verified after applying: anon and authenticated both query settings cleanly.

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage settings" ON settings;
CREATE POLICY "Admins can manage settings" ON settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- The public transparency page must be able to READ these toggles while signed
-- out — otherwise every section would render as hidden for real visitors. The
-- values are booleans describing which sections are shown; nothing sensitive.
DROP POLICY IF EXISTS "Anyone can read settings" ON settings;
CREATE POLICY "Anyone can read settings" ON settings FOR SELECT
  USING (TRUE);

INSERT INTO settings (key, value) VALUES
  ('show_accountability_pulse', 'true'::jsonb),
  ('show_open_ledger', 'true'::jsonb),
  ('show_promises', 'true'::jsonb),
  ('show_proof_vault', 'true'::jsonb),
  ('show_nothing_hidden', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
