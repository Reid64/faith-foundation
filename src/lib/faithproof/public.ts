import { createServerClient } from "@/lib/supabase/server";
import type { ProofDocument, Promise_, Transaction } from "./types";

/**
 * Public FaithProof queries.
 *
 * These run for signed-out visitors, so every one of them is subject to the
 * anon-role RLS policies:
 *   transactions      is_public = true AND status = 'confirmed'
 *   vouchers          status = 'disbursed' AND recipient_anonymous = true
 *   promises          is_public = true
 *   proof_documents   is_public = true AND verified = true
 *
 * The filters are ALSO written explicitly in each query rather than relying on
 * the policy alone. If a policy is ever loosened, the public page must not
 * quietly start publishing rows the copy does not describe — belt and braces on
 * the one surface where a mistake is visible to donors.
 */

export type PublicStats = {
  confirmedGiftsCents: number;
  vouchersDisbursed: number;
  promisesKept: number;
  programSpendCents: number;
  overheadCents: number;
  totalConfirmedCents: number;
  overheadPct: number;
  programPct: number;
  promisesOnTrackPct: number;
  totalPublicPromises: number;
};

export type PublicSettings = Record<string, boolean>;

/** Section toggles from the settings table; defaults to shown. */
export async function getPublicSettings(): Promise<PublicSettings> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("settings").select("key, value");

  const out: PublicSettings = {
    show_accountability_pulse: true,
    show_open_ledger: true,
    show_promises: true,
    show_proof_vault: true,
    show_nothing_hidden: true,
  };
  for (const row of data ?? []) {
    const r = row as { key: string; value: unknown };
    out[r.key] = r.value === true;
  }
  return out;
}

export async function getPublicStats(): Promise<PublicStats> {
  const supabase = await createServerClient();

  const [confirmed, disbursed, promisesKept, allPromises] = await Promise.all([
    supabase
      .from("transactions")
      .select("type, amount_cents")
      .eq("status", "confirmed")
      .eq("is_public", true),
    supabase
      .from("vouchers")
      .select("*", { count: "exact", head: true })
      .eq("status", "disbursed"),
    supabase
      .from("promises")
      .select("*", { count: "exact", head: true })
      .eq("status", "fulfilled")
      .eq("is_public", true),
    supabase
      .from("promises")
      .select("status")
      .eq("is_public", true),
  ]);

  const rows = (confirmed.data ?? []) as { type: string; amount_cents: number }[];
  const sumWhere = (pred: (t: string) => boolean) =>
    rows.filter((r) => pred(r.type)).reduce((n, r) => n + (r.amount_cents ?? 0), 0);

  const confirmedGiftsCents = sumWhere((t) => t === "donation");
  const programSpendCents = sumWhere((t) => t === "voucher_disbursement");
  const overheadCents = sumWhere((t) => t === "operational");
  const totalConfirmedCents = rows.reduce((n, r) => n + (r.amount_cents ?? 0), 0);

  // Overhead is expressed against total confirmed activity. With nothing
  // recorded the honest answer is 0, not NaN or a misleading 100.
  const denom = programSpendCents + overheadCents;
  const overheadPct = denom > 0 ? (overheadCents / denom) * 100 : 0;
  const programPct = denom > 0 ? 100 - overheadPct : 0;

  const promiseRows = (allPromises.data ?? []) as { status: string }[];
  const onTrack = promiseRows.filter((p) =>
    ["active", "in_progress", "fulfilled"].includes(p.status)
  ).length;
  const promisesOnTrackPct =
    promiseRows.length > 0 ? (onTrack / promiseRows.length) * 100 : 0;

  return {
    confirmedGiftsCents,
    vouchersDisbursed: disbursed.count ?? 0,
    promisesKept: promisesKept.count ?? 0,
    programSpendCents,
    overheadCents,
    totalConfirmedCents,
    overheadPct,
    programPct,
    promisesOnTrackPct,
    totalPublicPromises: promiseRows.length,
  };
}

export type LedgerFilters = {
  fund?: string;
  type?: string;
  from?: string;
  page?: number;
  perPage?: number;
};

export async function getPublicLedger(filters: LedgerFilters = {}) {
  const supabase = await createServerClient();
  const perPage = filters.perPage ?? 20;
  const page = Math.max(1, filters.page ?? 1);
  const fromIdx = (page - 1) * perPage;

  let query = supabase
    .from("transactions")
    .select(
      "id, transaction_date, type, fund, amount_cents, description",
      { count: "exact" }
    )
    .eq("status", "confirmed")
    .eq("is_public", true)
    .order("transaction_date", { ascending: false })
    .range(fromIdx, fromIdx + perPage - 1);

  if (filters.fund) query = query.eq("fund", filters.fund);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.from) query = query.gte("transaction_date", filters.from);

  const { data, count, error } = await query;
  return {
    rows: (data ?? []) as Pick<
      Transaction,
      "id" | "transaction_date" | "type" | "fund" | "amount_cents" | "description"
    >[],
    total: count ?? 0,
    page,
    perPage,
    error,
  };
}

/** Every matching row, unpaginated — used for the explorer's summary maths. */
export async function getLedgerTotals(filters: LedgerFilters = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("transactions")
    .select("type, fund, amount_cents, transaction_date")
    .eq("status", "confirmed")
    .eq("is_public", true);

  if (filters.fund) query = query.eq("fund", filters.fund);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.from) query = query.gte("transaction_date", filters.from);

  const { data } = await query;
  return (data ?? []) as {
    type: string;
    fund: string;
    amount_cents: number;
    transaction_date: string;
  }[];
}

export async function getPublicPromises() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("promises")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });
  return (data ?? []) as Promise_[];
}

export async function getPublicDocuments() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("proof_documents")
    .select("*")
    .eq("is_public", true)
    .eq("verified", true)
    .order("created_at", { ascending: false });
  return (data ?? []) as ProofDocument[];
}
