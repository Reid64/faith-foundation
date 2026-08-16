-- ═══════════════════════════════════════════════════
-- PHASE 11 — MAIL SCHEMA
-- ═══════════════════════════════════════════════════
--
-- Templates and a send log. `email_sends` is the record of what actually left
-- the building: every attempt is written, and a failure is written as
-- status = 'failed' with error_text rather than being swallowed.

CREATE TYPE template_type AS ENUM ('donor_receipt', 'impact_report', 'volunteer_welcome', 'application_update', 'board_report', 'custom');
CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed', 'bounced');

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  type template_type NOT NULL DEFAULT 'custom',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id),
  contact_id UUID REFERENCES contacts(id),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  status email_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_text TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_sends_contact ON email_sends (contact_id, created_at DESC);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal users can manage templates" ON email_templates FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));
CREATE POLICY "Internal users can manage email_sends" ON email_sends FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));

CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
