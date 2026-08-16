# Phase 17 — Fund Accounting

## Objective
Native fund accounting inside FaithProof. Chart of accounts, restricted vs unrestricted fund tracking, financial statements, board-ready reports. No external ERP needed.

## Database
File: supabase/migrations/012_fund_accounting.sql

### accounts table (chart of accounts)
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
code TEXT UNIQUE NOT NULL — e.g. 1000, 2000, 4000
name TEXT NOT NULL
type account_type — enum: asset, liability, equity, revenue, expense
subtype TEXT — e.g. cash, accounts_receivable, restricted_fund
is_restricted BOOLEAN DEFAULT false
fund fund_designation — which program fund this account belongs to
parent_id UUID REFERENCES accounts(id) — for hierarchical chart
is_active BOOLEAN DEFAULT true
created_at TIMESTAMPTZ DEFAULT NOW()

### journal_entries table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
date DATE NOT NULL
description TEXT NOT NULL
reference TEXT — links to transaction_id or grant_id
created_by UUID REFERENCES profiles(id)
created_at TIMESTAMPTZ DEFAULT NOW()

### journal_lines table
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
entry_id UUID REFERENCES journal_entries(id)
account_id UUID REFERENCES accounts(id)
debit_cents INTEGER DEFAULT 0
credit_cents INTEGER DEFAULT 0
memo TEXT

## Default Chart of Accounts for FAITH Foundation
Assets:
  1000 Cash — Operating
  1010 Cash — Housing Voucher Fund
  1020 Cash — Veterans Fund
  1030 Cash — Recovery Fund
  1040 Cash — Restricted Grants
  1100 Accounts Receivable
  1200 Prepaid Expenses

Liabilities:
  2000 Accounts Payable
  2100 Deferred Revenue — Restricted Grants

Equity:
  3000 Net Assets — Unrestricted
  3100 Net Assets — Temporarily Restricted
  3200 Net Assets — Permanently Restricted

Revenue:
  4000 Individual Donations — Unrestricted
  4100 Individual Donations — Housing Voucher
  4200 Individual Donations — Veterans
  4300 Corporate Donations
  4400 Grant Revenue
  4500 Interest Income

Expenses:
  5000 Program Expenses — Housing Vouchers
  5100 Program Expenses — Veterans
  5200 Program Expenses — Recovery
  5300 Administrative Expenses
  5400 Fundraising Expenses

## Pages

### /admin/accounting — Accounting Dashboard
Fund balance cards (one per active fund)
Year-to-date income vs expense chart
Recent journal entries
"New Journal Entry" button

### /admin/accounting/accounts — Chart of Accounts
Hierarchical display of all accounts
Balance column (calculated from journal lines)
"Add Account" button

### /admin/accounting/journal — Journal
All journal entries, newest first
Each entry expandable to show debit/credit lines
"New Entry" button
Filter by date range, account

### /admin/accounting/reports — Financial Reports
Statement of Financial Position (Balance Sheet)
Statement of Activities (Income Statement)
Statement of Cash Flows
Fund Balance Report — restricted vs unrestricted
All generated on demand, printable, exportable as PDF via document generation engine

## Auto-Integration
When a transaction is confirmed in FaithProof:
  Auto-create journal entry: debit appropriate Cash account, credit appropriate Revenue account
  When voucher disbursed: debit Program Expense account, credit Cash account

## Build-time notes (added at spec creation, not part of the original brief)

1. **Nothing in the schema enforces that an entry balances.** Double-entry is
   only meaningful if total debits equal total credits per `entry_id`. Enforce
   it — a deferred constraint trigger on `journal_entries`, or an RPC that
   writes entry + lines in one transaction and rejects an imbalance. Without it
   the balance sheet silently stops balancing.
2. **Auto-posting must be idempotent and must hook the transition, not the row.**
   Confirming a transaction fires `confirmTransaction` in
   src/app/admin/transactions/[id]/actions.ts. Post the journal entry there,
   keyed on `reference = transaction_id`, so a re-confirm or a retry cannot
   double-post revenue.
3. **Voiding and un-confirming need reversal entries, not deletions.** A voided
   transaction that already posted must generate a reversing entry; deleting the
   original destroys the audit trail that makes this system worth having.
4. **Balances are derived, never stored.** Compute from `journal_lines` so the
   ledger stays the single source of truth. PostgREST cannot aggregate, so this
   needs a Postgres view or RPC — see the note in the Command Center about
   summing in JavaScript, which is fine at 10 rows and wrong at 10,000.
5. **`fund_designation` currently has 7 labels; the chart above covers 4 funds.**
   Reentry and financial_literacy have no cash or program-expense accounts.
   Reconcile before seeding.
6. **This is bookkeeping for a 501(c)(3).** Whatever is built should be reviewed
   by Scott Ellis as Treasurer before it is relied on for a filing.
