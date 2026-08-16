"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import { dollarsToCents } from "@/lib/faithproof/format";
import { FUND_DESIGNATIONS, type FundDesignation } from "@/lib/faithproof/types";
import { ACCOUNT_TYPES, type AccountType } from "@/lib/faithproof/accounting";

type Result = { error?: string; ok?: boolean; id?: string };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function createAccount(formData: FormData): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const code = str(formData, "code");
  const name = str(formData, "name");
  const type = str(formData, "type");
  const fund = str(formData, "fund");
  const parent = str(formData, "parent_id");

  if (!code) return { error: "Enter an account code." };
  if (!name) return { error: "Enter an account name." };
  if (!ACCOUNT_TYPES.includes(type as AccountType)) {
    return { error: "Choose a valid account type." };
  }
  if (fund && !FUND_DESIGNATIONS.includes(fund as FundDesignation)) {
    return { error: "Choose a valid fund." };
  }

  const { data, error } = await session.supabase
    .from("accounts")
    .insert({
      code,
      name,
      type: type as AccountType,
      subtype: str(formData, "subtype") || null,
      is_restricted: formData.get("is_restricted") === "on",
      fund: fund ? (fund as FundDesignation) : null,
      parent_id: parent || null,
      is_active: formData.get("is_active") !== null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: `Account code ${code} is already in use.` };
    }
    return { error: describeDbError(error, "create this account") };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "account.created",
    entityType: "accounts",
    entityId: data.id,
    newValue: { code, name, type },
  });

  revalidatePath("/admin/accounting/accounts");
  revalidatePath("/admin/accounting");
  return { ok: true, id: data.id };
}

export async function toggleAccountActive(
  id: string,
  next: boolean
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const { error } = await session.supabase
    .from("accounts")
    .update({ is_active: next })
    .eq("id", id);

  if (error) return { error: describeDbError(error, "update this account") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: next ? "account.activated" : "account.deactivated",
    entityType: "accounts",
    entityId: id,
    newValue: { is_active: next },
  });

  revalidatePath("/admin/accounting/accounts");
  return { ok: true };
}

/**
 * Create a manual journal entry.
 *
 * Everything goes through the create_journal_entry RPC so the entry and all its
 * lines are written in ONE database transaction. Posting them separately would
 * leave an unbalanced half-entry behind whenever the second call failed — and
 * a ledger that does not balance is worse than no ledger.
 *
 * Balance is checked here too, so the user gets a sentence instead of a
 * Postgres exception; the database check remains the one that actually counts.
 */
export async function createJournalEntry(formData: FormData): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const date = str(formData, "date");
  const description = str(formData, "description");
  const reference = str(formData, "reference");

  if (!date) return { error: "Enter the entry date." };
  if (!description) return { error: "Enter a description." };

  const accountIds = formData.getAll("account_id").map((v) => String(v));
  const debits = formData.getAll("debit").map((v) => String(v));
  const credits = formData.getAll("credit").map((v) => String(v));
  const memos = formData.getAll("memo").map((v) => String(v));

  const lines: {
    account_id: string;
    debit_cents: number;
    credit_cents: number;
    memo: string;
  }[] = [];

  for (let i = 0; i < accountIds.length; i++) {
    const accountId = accountIds[i];
    const debitRaw = (debits[i] ?? "").trim();
    const creditRaw = (credits[i] ?? "").trim();

    // A row with nothing filled in is an unused row, not an error.
    if (!accountId && !debitRaw && !creditRaw) continue;

    if (!accountId) return { error: `Line ${i + 1}: choose an account.` };
    if (debitRaw && creditRaw) {
      return {
        error: `Line ${i + 1}: enter a debit or a credit, not both.`,
      };
    }
    if (!debitRaw && !creditRaw) {
      return { error: `Line ${i + 1}: enter an amount.` };
    }

    const amount = dollarsToCents(debitRaw || creditRaw);
    if (amount === null) {
      return { error: `Line ${i + 1}: enter an amount greater than zero.` };
    }

    lines.push({
      account_id: accountId,
      debit_cents: debitRaw ? amount : 0,
      credit_cents: creditRaw ? amount : 0,
      memo: (memos[i] ?? "").trim(),
    });
  }

  if (lines.length < 2) {
    return { error: "A journal entry needs at least two lines." };
  }

  const totalDebits = lines.reduce((n, l) => n + l.debit_cents, 0);
  const totalCredits = lines.reduce((n, l) => n + l.credit_cents, 0);
  if (totalDebits !== totalCredits) {
    const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;
    return {
      error: `Debits (${fmt(totalDebits)}) do not equal credits (${fmt(totalCredits)}). The entry was not saved.`,
    };
  }

  const { data, error } = await session.supabase.rpc("create_journal_entry", {
    p_date: date,
    p_description: description,
    p_reference: reference || null,
    p_lines: lines,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: `Reference "${reference}" is already used by another entry.` };
    }
    return { error: describeDbError(error, "save this journal entry") };
  }

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "journal_entry.created",
    entityType: "journal_entries",
    entityId: typeof data === "string" ? data : null,
    newValue: { date, description, lines: lines.length, totalDebits },
  });

  revalidatePath("/admin/accounting/journal");
  revalidatePath("/admin/accounting");
  revalidatePath("/admin/accounting/reports");
  return { ok: true, id: typeof data === "string" ? data : undefined };
}
