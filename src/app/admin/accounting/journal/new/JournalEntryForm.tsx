"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BTN_SECONDARY,
  BTN_SUBMIT,
  CONTROL,
} from "../../../_components/theme";

type Line = { key: number; account_id: string; debit: string; credit: string; memo: string };

const blank = (key: number): Line => ({
  key,
  account_id: "",
  debit: "",
  credit: "",
  memo: "",
});

/** Dollars string → cents, tolerantly. Returns 0 for anything unparseable. */
function toCents(input: string): number {
  const cleaned = input.trim().replace(/[$,\s]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Manual journal entry.
 *
 * The running debit/credit totals are shown live and the submit button stays
 * disabled until they match. The server checks the same thing, and so does the
 * database — this is the layer that stops a person wasting a submit, not the
 * layer that guarantees the ledger balances.
 */
export function JournalEntryForm({
  action,
  accounts,
  today,
}: {
  action: (fd: FormData) => Promise<{ error?: string; ok?: boolean; id?: string }>;
  accounts: { id: string; label: string }[];
  today: string;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([blank(1), blank(2)]);
  const [nextKey, setNextKey] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const totalDebits = lines.reduce((n, l) => n + toCents(l.debit), 0);
  const totalCredits = lines.reduce((n, l) => n + toCents(l.credit), 0);
  const filled = lines.filter((l) => l.account_id && (l.debit || l.credit));
  const balanced =
    filled.length >= 2 && totalDebits > 0 && totalDebits === totalCredits;

  function update(key: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const next = { ...l, ...patch };
        // A line is one-sided. Typing in one column clears the other rather
        // than letting the server reject the row later.
        if (patch.debit) next.credit = "";
        if (patch.credit) next.debit = "";
        return next;
      })
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || !balanced) return;
    setPending(true);
    setError(null);
    try {
      const res = await action(new FormData(e.currentTarget));
      if (res?.error) {
        setError(res.error);
        setPending(false);
        return;
      }
      router.push("/admin/accounting/journal");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "The entry was not saved."
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset disabled={pending} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <label className="block text-sm font-medium" style={{ color: "#374151" }}>
            Date <span style={{ color: "#dc2626" }}>*</span>
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              className={`${CONTROL} mt-1.5`}
            />
          </label>
          <label
            className="block text-sm font-medium sm:col-span-2"
            style={{ color: "#374151" }}
          >
            Description <span style={{ color: "#dc2626" }}>*</span>
            <input name="description" required className={`${CONTROL} mt-1.5`} />
          </label>
        </div>

        <label className="block text-sm font-medium" style={{ color: "#374151" }}>
          Reference
          <span className="ml-2 text-xs font-normal" style={{ color: "#9ca3af" }}>
            optional — must be unique
          </span>
          <input
            name="reference"
            className={`${CONTROL} mt-1.5`}
            placeholder="Deposit slip 4412"
          />
        </label>

        <div>
          <h2 className="mb-3" style={{ color: "#013e37", fontSize: 15, fontWeight: 600 }}>
            Lines
          </h2>
          <div className="space-y-3">
            {lines.map((l, i) => (
              <div key={l.key} className="grid gap-2 sm:grid-cols-12">
                <select
                  name="account_id"
                  value={l.account_id}
                  onChange={(ev) => update(l.key, { account_id: ev.target.value })}
                  aria-label={`Line ${i + 1} account`}
                  className={`${CONTROL} sm:col-span-4`}
                >
                  <option value="">Choose an account…</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <input
                  name="debit"
                  value={l.debit}
                  onChange={(ev) => update(l.key, { debit: ev.target.value })}
                  inputMode="decimal"
                  placeholder="Debit"
                  aria-label={`Line ${i + 1} debit`}
                  className={`${CONTROL} sm:col-span-2`}
                />
                <input
                  name="credit"
                  value={l.credit}
                  onChange={(ev) => update(l.key, { credit: ev.target.value })}
                  inputMode="decimal"
                  placeholder="Credit"
                  aria-label={`Line ${i + 1} credit`}
                  className={`${CONTROL} sm:col-span-2`}
                />
                <input
                  name="memo"
                  value={l.memo}
                  onChange={(ev) => update(l.key, { memo: ev.target.value })}
                  placeholder="Memo"
                  aria-label={`Line ${i + 1} memo`}
                  className={`${CONTROL} sm:col-span-3`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setLines((prev) =>
                      prev.length <= 2 ? prev : prev.filter((x) => x.key !== l.key)
                    )
                  }
                  disabled={lines.length <= 2}
                  aria-label={`Remove line ${i + 1}`}
                  className="rounded-lg text-sm sm:col-span-1"
                  style={{
                    color: lines.length <= 2 ? "#d1d5db" : "#dc2626",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setLines((prev) => [...prev, blank(nextKey)]);
              setNextKey((k) => k + 1);
            }}
            className={`${BTN_SECONDARY} mt-3`}
          >
            Add Line
          </button>
        </div>

        <div
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl px-4 py-3"
          style={{
            backgroundColor: balanced ? "#f0fdf4" : "#fffbeb",
            border: `1px solid ${balanced ? "#bbf7d0" : "#fde68a"}`,
          }}
        >
          <span className="text-sm tabular-nums" style={{ color: "#374151" }}>
            Debits {money(totalDebits)} · Credits {money(totalCredits)}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: balanced ? "#16a34a" : "#d97706" }}
          >
            {balanced
              ? "Balanced"
              : filled.length < 2
                ? "Add at least two lines"
                : `Out of balance by ${money(Math.abs(totalDebits - totalCredits))}`}
          </span>
        </div>
      </fieldset>

      {error ? (
        <p
          role="alert"
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3 border-t border-[#f3f4f6] pt-6">
        <button
          type="submit"
          disabled={pending || !ready || !balanced}
          className={BTN_SUBMIT}
        >
          {pending ? "Saving..." : "Post Entry"}
        </button>
        <Link href="/admin/accounting/journal" className={BTN_SECONDARY}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
