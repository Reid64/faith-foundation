-- ═══════════════════════════════════════════════════
-- PHASE 24 — FUND DESIGNATION CARRIED THROUGH THE LEDGER
-- ═══════════════════════════════════════════════════
--
-- WHAT THIS IS NOT. It does not add a fund column to `transactions`. That
-- column already exists — `transactions.fund fund_designation NOT NULL`, since
-- migration 001 — and so do per-fund cash accounts (1000–1060) and per-fund
-- program expense accounts (5000–5290). A brief asked for it to be added; the
-- live schema was read first, and it was already there.
--
-- WHAT WAS ACTUALLY MISSING, found by reading the chart of accounts against
-- the six funds Zeffy really offers:
--
--   1. REVENUE accounts existed for only THREE funds — 4000 unrestricted,
--      4100 housing_voucher, 4200 veterans. Donations to Recovery, Reentry and
--      Cornerstone Communities all fell through `revenue_code_for()` to
--      account 4600, "Donations — Other Restricted", whose fund is NULL.
--
--      The restriction class was right: 4600 is is_restricted = true, so a
--      designated gift was never counted as unrestricted and the
--      restricted/unrestricted split in the Statement of Activities was
--      correct. What was impossible was telling those three funds APART on the
--      revenue side. Half the donor-facing funds shared one line.
--
--   2. `journal_lines` carried no fund at all. The fund could only be inferred
--      from which account a line hit, so the moment two funds shared an
--      account the attribution was gone for good.
--
-- Both are fixed here. Every fund a donor can choose now has its own restricted
-- revenue account, and every journal line records the fund it belongs to
-- directly rather than by inference.
--
-- ON THE SIX FUNDS. Zeffy's live donation form offers exactly six:
-- General Fund, Housing Voucher Program, Veterans Path Home, Recovery Housing,
-- Second Chance Reentry, Cornerstone Communities. The `fund_designation` enum
-- has TEN labels and is deliberately left alone: three name programs retired on
-- 2026-08-14 (financial_literacy, single_parent_stability, emergency_bridge)
-- and must stay so historical rows keep rendering, and `operational` is an
-- internal designation for administrative money that was never offered to
-- donors. Dropping enum labels that live rows depend on would be a data loss
-- dressed up as tidying. The six are enforced in the application layer instead
-- (see DONOR_FUNDS in src/lib/faithproof/types.ts).

-- ── 1. Revenue accounts for the funds that had none ─────────────────────────
--
-- Codes sit in the 42xx block beside 4200 Veterans rather than extending 46xx,
-- because these are named restricted funds, not the catch-all.

INSERT INTO accounts (code, name, type, subtype, is_restricted, fund) VALUES
  ('4210', 'Individual Donations — Recovery',               'revenue', 'donations', true, 'recovery'),
  ('4220', 'Individual Donations — Reentry',                'revenue', 'donations', true, 'reentry'),
  ('4230', 'Individual Donations — Cornerstone Communities','revenue', 'donations', true, 'cornerstone_communities')
ON CONFLICT (code) DO NOTHING;

-- ── 2. Route the three funds to their own accounts ──────────────────────────
--
-- 4600 stays as the catch-all so a donation carrying a retired fund label still
-- posts to a real restricted account instead of failing.

CREATE OR REPLACE FUNCTION revenue_code_for(p_type TEXT, p_fund fund_designation) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_type = 'grant' THEN '4400'
    WHEN p_fund = 'housing_voucher' THEN '4100'
    WHEN p_fund = 'veterans' THEN '4200'
    WHEN p_fund = 'recovery' THEN '4210'
    WHEN p_fund = 'reentry' THEN '4220'
    WHEN p_fund = 'cornerstone_communities' THEN '4230'
    WHEN p_fund IN ('unrestricted', 'operational') THEN '4000'
    ELSE '4600'
  END;
$$;

-- ── 3. Every journal line records its fund ──────────────────────────────────

ALTER TABLE journal_lines ADD COLUMN IF NOT EXISTS fund fund_designation;

COMMENT ON COLUMN journal_lines.fund IS
  'Fund this line belongs to. Set explicitly by post_journal_pair from the '
  'source transaction or voucher; otherwise defaulted from the account by '
  'trg_journal_line_fund. Reporting groups on this rather than inferring a '
  'fund from the account, so two funds may safely share an account.';

CREATE INDEX IF NOT EXISTS idx_journal_lines_fund ON journal_lines(fund);

-- Manual entries go through create_journal_entry() and name an account but not
-- a fund. Rather than change that RPC and its form, fill the fund in from the
-- account, which is exactly the inference the reports used to do — only now it
-- is done once, at write time, and stored.
CREATE OR REPLACE FUNCTION journal_line_fund_default() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.fund IS NULL THEN
    SELECT a.fund INTO NEW.fund FROM accounts a WHERE a.id = NEW.account_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_journal_line_fund ON journal_lines;
CREATE TRIGGER trg_journal_line_fund
  BEFORE INSERT ON journal_lines
  FOR EACH ROW
  EXECUTE FUNCTION journal_line_fund_default();

-- Existing lines get the same treatment. (There are none today — the ledger is
-- empty — but this must be correct if it is ever run against a populated one.)
UPDATE journal_lines l
   SET fund = a.fund
  FROM accounts a
 WHERE l.account_id = a.id
   AND l.fund IS NULL
   AND a.fund IS NOT NULL;

-- ── 4. post_journal_pair carries the fund explicitly ────────────────────────
--
-- DROP first, deliberately: in Postgres, CREATE OR REPLACE FUNCTION with a
-- different argument count creates a second OVERLOAD rather than replacing the
-- original, and the existing 6-argument callers would keep resolving to the old
-- one. Dropping guarantees there is exactly one.

DROP FUNCTION IF EXISTS post_journal_pair(DATE, TEXT, TEXT, TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION post_journal_pair(
  p_date DATE,
  p_description TEXT,
  p_reference TEXT,
  p_debit_code TEXT,
  p_credit_code TEXT,
  p_amount_cents INTEGER,
  p_fund fund_designation DEFAULT NULL
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
    -- gap.
    RETURN NULL;
  END IF;

  INSERT INTO journal_entries (date, description, reference)
  VALUES (p_date, p_description, p_reference)
  RETURNING id INTO v_entry;

  INSERT INTO journal_lines (entry_id, account_id, debit_cents, credit_cents, memo, fund)
  VALUES (v_entry, v_debit, p_amount_cents, 0, p_description, p_fund),
         (v_entry, v_credit, 0, p_amount_cents, p_description, p_fund);

  RETURN v_entry;
END;
$$;

-- ── 5. The auto-posting triggers pass the fund through ──────────────────────

CREATE OR REPLACE FUNCTION auto_journal_on_transaction_confirm() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.type IN ('donation', 'grant') THEN
    -- Money in: cash up (debit), revenue up (credit).
    PERFORM post_journal_pair(
      NEW.transaction_date,
      'Auto: ' || NEW.type || ' confirmed' ||
        COALESCE(' — ' || NULLIF(NEW.description, ''), ''),
      'transaction:' || NEW.id::TEXT,
      cash_code_for_fund(NEW.fund),
      revenue_code_for(NEW.type::TEXT, NEW.fund),
      NEW.amount_cents,
      NEW.fund
    );
  ELSE
    -- Money out: expense up (debit), cash down (credit).
    PERFORM post_journal_pair(
      NEW.transaction_date,
      'Auto: ' || NEW.type || ' confirmed' ||
        COALESCE(' — ' || NULLIF(NEW.description, ''), ''),
      'transaction:' || NEW.id::TEXT,
      program_expense_code_for_fund(NEW.fund),
      cash_code_for_fund(NEW.fund),
      NEW.amount_cents,
      NEW.fund
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION auto_journal_on_voucher_disbursed() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM post_journal_pair(
    COALESCE(NEW.disbursed_at::DATE, CURRENT_DATE),
    'Auto: voucher ' || NEW.voucher_number || ' disbursed',
    'voucher:' || NEW.id::TEXT,
    program_expense_code_for_fund(NEW.fund),
    cash_code_for_fund(NEW.fund),
    NEW.amount_cents,
    NEW.fund
  );
  RETURN NEW;
END;
$$;

-- The void reversal copies existing lines, so it must copy the fund too or a
-- reversal would silently drop the attribution it is reversing.
CREATE OR REPLACE FUNCTION reverse_journal_on_transaction_void() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_original UUID;
  v_ref TEXT := 'transaction:' || NEW.id::TEXT || ':reversal';
  v_entry UUID;
BEGIN
  SELECT id INTO v_original FROM journal_entries
   WHERE reference = 'transaction:' || NEW.id::TEXT;
  IF v_original IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_entry FROM journal_entries WHERE reference = v_ref;
  IF v_entry IS NOT NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO journal_entries (date, description, reference)
  VALUES (CURRENT_DATE, 'Auto: reversal of voided transaction', v_ref)
  RETURNING id INTO v_entry;

  INSERT INTO journal_lines (entry_id, account_id, debit_cents, credit_cents, memo, fund)
  SELECT v_entry, account_id, credit_cents, debit_cents, 'Reversal', fund
    FROM journal_lines WHERE entry_id = v_original;

  RETURN NEW;
END;
$$;

-- ── 6. Flag rows whose designation is not known, rather than asserting it ───
--
-- `transactions.fund` is NOT NULL, so every existing row already carries a
-- value — which means a row reading 'unrestricted' is ambiguous: it may be a
-- donor who chose the General Fund, or a default applied when nothing captured
-- the designation. Recording the difference is the whole point; writing
-- 'General Fund' over an unknown and saying nothing would be a quiet lie in the
-- one place this organisation promises not to tell one.

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS fund_backfilled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN transactions.fund_backfilled IS
  'True when the fund on this row was inferred or defaulted rather than '
  'captured from the donor. Displayed in the admin UI as "unverified" and '
  'never presented as a donor choice.';

-- Every transaction that predates this migration was created before any path
-- captured a designation from the donor, so none of their funds are verified.
UPDATE transactions SET fund_backfilled = true WHERE created_at < NOW();

-- ── RLS ─────────────────────────────────────────────────────────────────────
--
-- No new policies. `journal_lines`, `journal_entries`, `accounts` and
-- `transactions` already carry FOR ALL policies gated on current_user_role(),
-- and row level security is exactly that — adding a column to a table changes
-- nothing about which rows a caller may see. Adding a policy here would
-- duplicate migration 012 and 001, not tighten anything.
