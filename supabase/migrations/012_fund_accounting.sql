-- ═══════════════════════════════════════════════════
-- PHASE 15 — FUND ACCOUNTING
-- ═══════════════════════════════════════════════════
--
-- Double-entry bookkeeping for a 501(c)(3). Four things the spec flagged as
-- ambiguous are settled here:
--
--   1. AN ENTRY MUST BALANCE. A deferred constraint trigger checks that debits
--      equal credits per entry at COMMIT — not per row, because a balanced
--      entry is only balanced once every line is in. The app writes entry and
--      lines through create_journal_entry() so both land in one transaction;
--      the trigger is the backstop that catches anything written another way.
--
--   2. AUTO-POSTING IS IDEMPOTENT. Every automatic entry carries a reference of
--      the form 'transaction:<uuid>' or 'voucher:<uuid>'. The function returns
--      early if that reference already has an entry, so a re-confirm, a retry,
--      or a second webhook delivery cannot post revenue twice.
--
--   3. VOIDING REVERSES, IT DOES NOT DELETE. A confirmed transaction that is
--      later voided gets a reversing entry referencing
--      'transaction:<uuid>:reversal'. The original stays exactly where it was —
--      deleting it would destroy the audit trail this system exists to provide.
--
--   4. BALANCES ARE DERIVED, NEVER STORED. account_balances is a view over
--      journal_lines, declared security_invoker so the caller's RLS applies
--      rather than the view owner's. Postgres does the aggregation; nothing
--      sums a ledger in JavaScript.
--
-- The chart of accounts below also closes the gap the spec noted: every one of
-- the seven fund_designation labels now has a cash account and a program
-- expense account to post to, plus explicit "Other" accounts so a fund added
-- later still has somewhere to land instead of failing the post.
--
-- BOOKKEEPING CAVEAT: this is a working ledger, not a reviewed one. It should
-- be checked by the Treasurer before anything here is relied on for a filing.

CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type account_type NOT NULL,
  subtype TEXT,
  is_restricted BOOLEAN NOT NULL DEFAULT false,
  fund fund_designation,
  parent_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  -- 'transaction:<uuid>', 'voucher:<uuid>', 'transaction:<uuid>:reversal', or
  -- free text for a manual entry. UNIQUE so an automatic post cannot repeat.
  reference TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_journal_entries_reference
  ON journal_entries (reference)
  WHERE reference IS NOT NULL;

CREATE TABLE journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  debit_cents INTEGER NOT NULL DEFAULT 0 CHECK (debit_cents >= 0),
  credit_cents INTEGER NOT NULL DEFAULT 0 CHECK (credit_cents >= 0),
  memo TEXT,
  -- A line is a debit or a credit, never both and never neither.
  CONSTRAINT journal_line_one_sided CHECK (
    (debit_cents > 0 AND credit_cents = 0) OR
    (credit_cents > 0 AND debit_cents = 0)
  )
);

CREATE INDEX idx_journal_lines_entry ON journal_lines (entry_id);
CREATE INDEX idx_journal_lines_account ON journal_lines (account_id);
CREATE INDEX idx_journal_entries_date ON journal_entries (date DESC);

-- ── Balance enforcement ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION assert_entry_balances() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_entry UUID;
  v_debits BIGINT;
  v_credits BIGINT;
BEGIN
  v_entry := COALESCE(NEW.entry_id, OLD.entry_id);

  SELECT COALESCE(SUM(debit_cents), 0), COALESCE(SUM(credit_cents), 0)
    INTO v_debits, v_credits
    FROM journal_lines WHERE entry_id = v_entry;

  -- An entry whose lines were all removed is being deleted; let it go.
  IF v_debits = 0 AND v_credits = 0 THEN
    RETURN NULL;
  END IF;

  IF v_debits <> v_credits THEN
    RAISE EXCEPTION
      'Journal entry % does not balance: debits %, credits %',
      v_entry, v_debits, v_credits
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER trg_journal_lines_balance
  AFTER INSERT OR UPDATE OR DELETE ON journal_lines
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION assert_entry_balances();

-- ── Derived balances ────────────────────────────────────────────────────────
--
-- Sign convention: assets and expenses increase on the debit side, everything
-- else on the credit side. `balance_cents` is therefore the account's natural
-- balance — positive means what a reader expects it to mean.

CREATE VIEW account_balances
WITH (security_invoker = true) AS
SELECT
  a.id AS account_id,
  a.code,
  a.name,
  a.type,
  a.fund,
  a.is_restricted,
  a.is_active,
  COALESCE(SUM(l.debit_cents), 0)::BIGINT AS debit_cents,
  COALESCE(SUM(l.credit_cents), 0)::BIGINT AS credit_cents,
  CASE
    WHEN a.type IN ('asset', 'expense')
      THEN COALESCE(SUM(l.debit_cents), 0) - COALESCE(SUM(l.credit_cents), 0)
    ELSE COALESCE(SUM(l.credit_cents), 0) - COALESCE(SUM(l.debit_cents), 0)
  END::BIGINT AS balance_cents
FROM accounts a
LEFT JOIN journal_lines l ON l.account_id = a.id
GROUP BY a.id;

-- ── Manual entry RPC ────────────────────────────────────────────────────────
--
-- Writes the entry and every line in ONE transaction, so a rejected imbalance
-- leaves nothing behind. SECURITY INVOKER: row level security still decides
-- whether the caller may write.

CREATE OR REPLACE FUNCTION create_journal_entry(
  p_date DATE,
  p_description TEXT,
  p_reference TEXT,
  p_lines JSONB
) RETURNS UUID
LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_entry UUID;
  v_debits BIGINT := 0;
  v_credits BIGINT := 0;
  v_line JSONB;
BEGIN
  IF jsonb_array_length(p_lines) < 2 THEN
    RAISE EXCEPTION 'A journal entry needs at least two lines.'
      USING ERRCODE = 'check_violation';
  END IF;

  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
    v_debits := v_debits + COALESCE((v_line ->> 'debit_cents')::BIGINT, 0);
    v_credits := v_credits + COALESCE((v_line ->> 'credit_cents')::BIGINT, 0);
  END LOOP;

  IF v_debits <> v_credits THEN
    RAISE EXCEPTION 'Debits (%) do not equal credits (%).', v_debits, v_credits
      USING ERRCODE = 'check_violation';
  END IF;
  IF v_debits = 0 THEN
    RAISE EXCEPTION 'A journal entry cannot be for zero.'
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO journal_entries (date, description, reference, created_by)
  VALUES (p_date, p_description, NULLIF(p_reference, ''), auth.uid())
  RETURNING id INTO v_entry;

  INSERT INTO journal_lines (entry_id, account_id, debit_cents, credit_cents, memo)
  SELECT
    v_entry,
    (l ->> 'account_id')::UUID,
    COALESCE((l ->> 'debit_cents')::INTEGER, 0),
    COALESCE((l ->> 'credit_cents')::INTEGER, 0),
    NULLIF(l ->> 'memo', '')
  FROM jsonb_array_elements(p_lines) AS l;

  RETURN v_entry;
END;
$$;

-- ── Automatic posting ───────────────────────────────────────────────────────
--
-- SECURITY DEFINER on purpose. Confirmations arrive from an admin session, but
-- they also arrive from the Zeffy webhook through the service-role client,
-- where current_user_role() is null. A posting that only worked for one of
-- those paths would silently skip the other, and the ledger would be short.

CREATE OR REPLACE FUNCTION account_id_for_code(p_code TEXT) RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id FROM accounts WHERE code = p_code;
$$;

CREATE OR REPLACE FUNCTION cash_code_for_fund(p_fund fund_designation) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_fund
    WHEN 'housing_voucher' THEN '1010'
    WHEN 'veterans' THEN '1020'
    WHEN 'recovery' THEN '1030'
    WHEN 'reentry' THEN '1050'
    WHEN 'cornerstone_communities' THEN '1060'
    ELSE '1000'
  END;
$$;

CREATE OR REPLACE FUNCTION program_expense_code_for_fund(p_fund fund_designation) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_fund
    WHEN 'housing_voucher' THEN '5000'
    WHEN 'veterans' THEN '5100'
    WHEN 'recovery' THEN '5200'
    WHEN 'reentry' THEN '5250'
    WHEN 'cornerstone_communities' THEN '5260'
    WHEN 'operational' THEN '5300'
    ELSE '5290'
  END;
$$;

CREATE OR REPLACE FUNCTION revenue_code_for(p_type TEXT, p_fund fund_designation) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_type = 'grant' THEN '4400'
    WHEN p_fund = 'housing_voucher' THEN '4100'
    WHEN p_fund = 'veterans' THEN '4200'
    WHEN p_fund IN ('unrestricted', 'operational') THEN '4000'
    ELSE '4600'
  END;
$$;

CREATE OR REPLACE FUNCTION post_journal_pair(
  p_date DATE,
  p_description TEXT,
  p_reference TEXT,
  p_debit_code TEXT,
  p_credit_code TEXT,
  p_amount_cents INTEGER
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_entry UUID;
  v_debit UUID;
  v_credit UUID;
BEGIN
  IF p_amount_cents IS NULL OR p_amount_cents <= 0 THEN
    RETURN NULL;
  END IF;

  -- Idempotency: the reference is unique, and an existing one means this has
  -- already been posted.
  SELECT id INTO v_entry FROM journal_entries WHERE reference = p_reference;
  IF v_entry IS NOT NULL THEN
    RETURN v_entry;
  END IF;

  v_debit := account_id_for_code(p_debit_code);
  v_credit := account_id_for_code(p_credit_code);
  IF v_debit IS NULL OR v_credit IS NULL THEN
    -- Missing account: do not post a half entry, and do not block the
    -- underlying confirmation either. The imbalance would be worse than the
    -- gap, and the gap is visible in the journal.
    RETURN NULL;
  END IF;

  INSERT INTO journal_entries (date, description, reference, created_by)
  VALUES (p_date, p_description, p_reference, auth.uid())
  RETURNING id INTO v_entry;

  INSERT INTO journal_lines (entry_id, account_id, debit_cents, credit_cents)
  VALUES (v_entry, v_debit, p_amount_cents, 0),
         (v_entry, v_credit, 0, p_amount_cents);

  RETURN v_entry;
END;
$$;

CREATE OR REPLACE FUNCTION auto_journal_on_transaction_confirm() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ref TEXT := 'transaction:' || NEW.id::TEXT;
BEGIN
  IF NEW.type IN ('donation', 'grant') THEN
    -- Money in: cash up (debit), revenue up (credit).
    PERFORM post_journal_pair(
      NEW.transaction_date,
      'Auto: ' || NEW.type || ' confirmed' ||
        COALESCE(' — ' || NULLIF(NEW.description, ''), ''),
      v_ref,
      cash_code_for_fund(NEW.fund),
      revenue_code_for(NEW.type::TEXT, NEW.fund),
      NEW.amount_cents
    );
  ELSE
    -- Money out: expense up (debit), cash down (credit).
    PERFORM post_journal_pair(
      NEW.transaction_date,
      'Auto: ' || NEW.type || ' confirmed' ||
        COALESCE(' — ' || NULLIF(NEW.description, ''), ''),
      v_ref,
      program_expense_code_for_fund(NEW.fund),
      cash_code_for_fund(NEW.fund),
      NEW.amount_cents
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transaction_confirmed
  AFTER UPDATE ON transactions
  FOR EACH ROW
  WHEN (OLD.status <> 'confirmed' AND NEW.status = 'confirmed')
  EXECUTE FUNCTION auto_journal_on_transaction_confirm();

CREATE OR REPLACE FUNCTION reverse_journal_on_transaction_void() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_original UUID;
  v_ref TEXT := 'transaction:' || NEW.id::TEXT || ':reversal';
  v_entry UUID;
BEGIN
  SELECT id INTO v_original
    FROM journal_entries
   WHERE reference = 'transaction:' || NEW.id::TEXT;

  IF v_original IS NULL THEN
    RETURN NEW; -- never posted; nothing to reverse
  END IF;

  IF EXISTS (SELECT 1 FROM journal_entries WHERE reference = v_ref) THEN
    RETURN NEW; -- already reversed
  END IF;

  INSERT INTO journal_entries (date, description, reference, created_by)
  VALUES (
    CURRENT_DATE,
    'Auto: reversal of voided transaction',
    v_ref,
    auth.uid()
  )
  RETURNING id INTO v_entry;

  -- Sides swapped. The original entry is left exactly as it was.
  INSERT INTO journal_lines (entry_id, account_id, debit_cents, credit_cents, memo)
  SELECT v_entry, account_id, credit_cents, debit_cents, 'Reversal'
    FROM journal_lines WHERE entry_id = v_original;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transaction_voided
  AFTER UPDATE ON transactions
  FOR EACH ROW
  WHEN (OLD.status <> 'voided' AND NEW.status = 'voided')
  EXECUTE FUNCTION reverse_journal_on_transaction_void();

CREATE OR REPLACE FUNCTION auto_journal_on_voucher_disbursed() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM post_journal_pair(
    COALESCE(NEW.disbursed_at::DATE, CURRENT_DATE),
    'Auto: voucher ' || NEW.voucher_number || ' disbursed',
    'voucher:' || NEW.id::TEXT,
    program_expense_code_for_fund(NEW.fund),
    cash_code_for_fund(NEW.fund),
    NEW.amount_cents
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_voucher_disbursed
  AFTER UPDATE ON vouchers
  FOR EACH ROW
  WHEN (OLD.status <> 'disbursed' AND NEW.status = 'disbursed')
  EXECUTE FUNCTION auto_journal_on_voucher_disbursed();

-- ── Row level security ──────────────────────────────────────────────────────

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal users can manage accounts" ON accounts FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));

CREATE POLICY "Internal users can manage journal_entries" ON journal_entries FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));

CREATE POLICY "Internal users can manage journal_lines" ON journal_lines FOR ALL
  USING (current_user_role() IN ('admin', 'board', 'staff'))
  WITH CHECK (current_user_role() IN ('admin', 'board', 'staff'));

-- ── Default chart of accounts ───────────────────────────────────────────────

INSERT INTO accounts (code, name, type, subtype, is_restricted, fund) VALUES
  ('1000', 'Cash — Operating',                       'asset', 'cash', false, 'operational'),
  ('1010', 'Cash — Housing Voucher Fund',            'asset', 'cash', true,  'housing_voucher'),
  ('1020', 'Cash — Veterans Fund',                   'asset', 'cash', true,  'veterans'),
  ('1030', 'Cash — Recovery Fund',                   'asset', 'cash', true,  'recovery'),
  ('1040', 'Cash — Restricted Grants',               'asset', 'cash', true,  NULL),
  ('1050', 'Cash — Reentry Fund',                    'asset', 'cash', true,  'reentry'),
  ('1060', 'Cash — Cornerstone Communities Fund',    'asset', 'cash', true,  'cornerstone_communities'),
  ('1100', 'Accounts Receivable',                    'asset', 'accounts_receivable', false, NULL),
  ('1200', 'Prepaid Expenses',                       'asset', 'prepaid', false, NULL),

  ('2000', 'Accounts Payable',                       'liability', 'accounts_payable', false, NULL),
  ('2100', 'Deferred Revenue — Restricted Grants',   'liability', 'deferred_revenue', true, NULL),

  ('3000', 'Net Assets — Unrestricted',              'equity', 'net_assets', false, 'unrestricted'),
  ('3100', 'Net Assets — Temporarily Restricted',    'equity', 'net_assets', true, NULL),
  ('3200', 'Net Assets — Permanently Restricted',    'equity', 'net_assets', true, NULL),

  ('4000', 'Individual Donations — Unrestricted',    'revenue', 'donations', false, 'unrestricted'),
  ('4100', 'Individual Donations — Housing Voucher', 'revenue', 'donations', true,  'housing_voucher'),
  ('4200', 'Individual Donations — Veterans',        'revenue', 'donations', true,  'veterans'),
  ('4300', 'Corporate Donations',                    'revenue', 'donations', false, NULL),
  ('4400', 'Grant Revenue',                          'revenue', 'grants', false, NULL),
  ('4500', 'Interest Income',                        'revenue', 'interest', false, NULL),
  -- Catch-all so a donation to any other fund still posts to a real account
  -- instead of failing. Reclassify from here when it matters.
  ('4600', 'Donations — Other Restricted',           'revenue', 'donations', true, NULL),

  ('5000', 'Program Expenses — Housing Vouchers',    'expense', 'program', true,  'housing_voucher'),
  ('5100', 'Program Expenses — Veterans',            'expense', 'program', true,  'veterans'),
  ('5200', 'Program Expenses — Recovery',            'expense', 'program', true,  'recovery'),
  ('5250', 'Program Expenses — Reentry',             'expense', 'program', true,  'reentry'),
  ('5260', 'Program Expenses — Cornerstone Communities', 'expense', 'program', true, 'cornerstone_communities'),
  ('5290', 'Program Expenses — Other',               'expense', 'program', false, NULL),
  ('5300', 'Administrative Expenses',                'expense', 'administrative', false, 'operational'),
  ('5400', 'Fundraising Expenses',                   'expense', 'fundraising', false, NULL);
