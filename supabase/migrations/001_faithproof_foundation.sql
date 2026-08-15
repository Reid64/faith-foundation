-- ═══════════════════════════════════════════════════
-- FAITHPROOF SCHEMA — PHASE 1 FOUNDATION
-- ═══════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ───────────────────────────────────────────────────
-- ROLES & AUTH
-- ───────────────────────────────────────────────────

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'board', 'staff', 'public');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ───────────────────────────────────────────────────
-- FINANCIAL TRANSACTIONS
-- ───────────────────────────────────────────────────

CREATE TYPE transaction_type AS ENUM ('donation', 'grant', 'expense', 'voucher_disbursement', 'operational');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'reconciled', 'voided');
CREATE TYPE fund_designation AS ENUM ('housing_voucher', 'financial_literacy', 'veterans', 'recovery', 'reentry', 'operational', 'unrestricted');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  fund fund_designation NOT NULL,
  description TEXT,
  donor_name TEXT,
  donor_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  reference_number TEXT,
  transaction_date DATE NOT NULL,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_public BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Public can only see transactions marked is_public = true
CREATE POLICY "Public can view public transactions"
  ON transactions FOR SELECT
  USING (is_public = TRUE AND status = 'confirmed');

-- Authenticated staff/admin/board can view all
CREATE POLICY "Internal users can view all transactions"
  ON transactions FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'board', 'staff')));

-- Only admin can insert/update/delete
CREATE POLICY "Admins can manage transactions"
  ON transactions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ───────────────────────────────────────────────────
-- VOUCHERS
-- ───────────────────────────────────────────────────

CREATE TYPE voucher_status AS ENUM ('pending', 'approved', 'disbursed', 'expired', 'cancelled');

CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number TEXT UNIQUE NOT NULL,
  status voucher_status NOT NULL DEFAULT 'pending',
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  fund fund_designation NOT NULL DEFAULT 'housing_voucher',
  recipient_name TEXT,
  recipient_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
  program TEXT,
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  transaction_id UUID REFERENCES transactions(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view anonymized disbursed vouchers"
  ON vouchers FOR SELECT
  USING (status = 'disbursed' AND recipient_anonymous = TRUE);

CREATE POLICY "Internal users can view all vouchers"
  ON vouchers FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'board', 'staff')));

CREATE POLICY "Admins can manage vouchers"
  ON vouchers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ───────────────────────────────────────────────────
-- PROMISES (mission commitments)
-- ───────────────────────────────────────────────────

CREATE TYPE promise_status AS ENUM ('active', 'fulfilled', 'in_progress', 'missed', 'revised');

CREATE TABLE promises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status promise_status NOT NULL DEFAULT 'active',
  target_date DATE,
  fulfilled_date DATE,
  proof_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE promises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public promises"
  ON promises FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Admins can manage promises"
  ON promises FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ───────────────────────────────────────────────────
-- PROOF VAULT (documents)
-- ───────────────────────────────────────────────────

CREATE TYPE document_type AS ENUM (
  'irs_determination', 'audit', 'tax_return', 'board_minutes',
  'financial_statement', 'grant_award', 'donor_receipt', 'policy', 'other'
);

CREATE TABLE proof_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type document_type NOT NULL,
  description TEXT,
  storage_path TEXT,
  external_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE proof_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public verified documents"
  ON proof_documents FOR SELECT
  USING (is_public = TRUE AND verified = TRUE);

CREATE POLICY "Internal users can view all documents"
  ON proof_documents FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'board', 'staff')));

CREATE POLICY "Admins can manage documents"
  ON proof_documents FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ───────────────────────────────────────────────────
-- AUDIT LOG
-- ───────────────────────────────────────────────────

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and board can view audit log"
  ON audit_log FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'board')));

CREATE POLICY "System can insert audit log entries"
  ON audit_log FOR INSERT
  WITH CHECK (TRUE);

-- ───────────────────────────────────────────────────
-- HELPER FUNCTION: auto-update updated_at
-- ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vouchers_updated_at BEFORE UPDATE ON vouchers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_promises_updated_at BEFORE UPDATE ON promises FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON proof_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ───────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP
-- ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'staff'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
