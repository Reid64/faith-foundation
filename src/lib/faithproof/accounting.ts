import type { BadgeTone } from "@/app/admin/_components/ui";
import type { FundDesignation } from "./types";

export const ACCOUNT_TYPES = [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  asset: "Asset",
  liability: "Liability",
  equity: "Equity",
  revenue: "Revenue",
  expense: "Expense",
};

export const ACCOUNT_TYPE_TONES: Record<string, BadgeTone> = {
  asset: "blue",
  liability: "amber",
  equity: "purple",
  revenue: "green",
  expense: "red",
};

/** Statement order — assets first, then the rest of the balance sheet. */
export const ACCOUNT_TYPE_ORDER: AccountType[] = [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
];

export type Account = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subtype: string | null;
  is_restricted: boolean;
  fund: FundDesignation | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
};

/**
 * A row of the account_balances view.
 *
 * Postgres BIGINT arrives as a string over PostgREST — always run it through
 * `cents()` rather than trusting it to be a number.
 */
export type AccountBalance = {
  account_id: string;
  code: string;
  name: string;
  type: AccountType;
  fund: FundDesignation | null;
  is_restricted: boolean;
  is_active: boolean;
  debit_cents: string | number;
  credit_cents: string | number;
  balance_cents: string | number;
};

export type JournalEntry = {
  id: string;
  date: string;
  description: string;
  reference: string | null;
  created_by: string | null;
  created_at: string;
};

export type JournalLine = {
  id: string;
  entry_id: string;
  account_id: string;
  debit_cents: number;
  credit_cents: number;
  memo: string | null;
};

export function cents(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Human form of an automatic entry's reference.
 *
 * Automatic posts carry 'transaction:<uuid>' or 'voucher:<uuid>'; a manual
 * entry carries whatever the bookkeeper typed.
 */
export function describeReference(reference: string | null): {
  label: string;
  href: string | null;
} {
  if (!reference) return { label: "—", href: null };

  const reversal = reference.endsWith(":reversal");
  const base = reversal ? reference.slice(0, -":reversal".length) : reference;
  const [kind, id] = base.split(":");

  if (kind === "transaction" && id) {
    return {
      label: reversal ? "Voided transaction (reversal)" : "Transaction",
      href: `/admin/transactions/${id}`,
    };
  }
  if (kind === "voucher" && id) {
    return { label: "Voucher", href: `/admin/vouchers/${id}` };
  }
  return { label: reference, href: null };
}
