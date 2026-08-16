-- ═══════════════════════════════════════════════════
-- PHASE 10 — CRM SCHEMA
-- ═══════════════════════════════════════════════════
--
-- Contacts, interactions, tasks, campaign tags and the two linking tables.
--
-- RLS uses current_user_role() throughout — never a subquery against profiles.
-- A policy on `profiles` that reads `profiles` is what caused the infinite
-- recursion fixed in migration 002; the helper is SECURITY DEFINER and breaks
-- that cycle.
--
-- NOTE on scope: these policies grant read AND write to admin, board and staff,
-- as specified. This is the most sensitive data in the system — names, home
-- addresses, phone numbers — and it is a wider grant than every other table,
-- which is admin-write-only. Recorded deliberately.

CREATE TYPE contact_type AS ENUM ('donor', 'applicant', 'volunteer', 'board', 'partner');
CREATE TYPE interaction_type AS ENUM ('note', 'call', 'email', 'meeting', 'donation', 'application', 'volunteer_shift');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type contact_type NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  -- TCPA: US SMS to individuals requires prior express consent. Phase 19 must
  -- refuse to send to any contact whose sms_consent is false.
  sms_consent BOOLEAN NOT NULL DEFAULT FALSE,
  sms_consent_date TIMESTAMPTZ,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT DEFAULT 'TX',
  zip TEXT,
  source TEXT,
  notes TEXT,
  pipeline_stage TEXT,
  assigned_to UUID REFERENCES profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type interaction_type NOT NULL DEFAULT 'note',
  subject TEXT,
  body TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campaign_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  campaign TEXT NOT NULL,
  tagged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tagged_by UUID REFERENCES profiles(id)
);

CREATE TABLE contact_transactions (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, transaction_id)
);

CREATE TABLE contact_vouchers (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, voucher_id)
);

-- Lookup indexes for the paths the UI and the Zeffy webhook actually use.
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (lower(email));
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts (type);
CREATE INDEX IF NOT EXISTS idx_interactions_contact ON interactions (contact_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks (due_date, status);
CREATE INDEX IF NOT EXISTS idx_campaign_tags_campaign ON campaign_tags (campaign);

-- RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_vouchers ENABLE ROW LEVEL SECURITY;

-- WITH CHECK mirrors USING on every FOR ALL policy. Without it, INSERT and the
-- post-image of UPDATE are unrestricted — the policy would gate reads and
-- deletes while letting anyone write.
CREATE POLICY "Internal users can manage contacts" ON contacts FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));
CREATE POLICY "Internal users can manage interactions" ON interactions FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));
CREATE POLICY "Internal users can manage tasks" ON tasks FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));
CREATE POLICY "Internal users can manage campaign_tags" ON campaign_tags FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));
CREATE POLICY "Internal users can manage contact_transactions" ON contact_transactions FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));
CREATE POLICY "Internal users can manage contact_vouchers" ON contact_vouchers FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));

CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
