"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BTN_PRIMARY, BTN_SECONDARY, CONTROL } from "../../../_components/theme";
import { VOTE_RESULTS, VOTE_RESULT_LABELS } from "@/lib/faithproof/board";

/**
 * Inline "record a vote" form.
 *
 * Same contract as <AdminForm>: disabled until hydrated so a pre-hydration
 * click cannot fall through to a native GET, and nothing closes or reports
 * success until the server confirms the insert.
 */
export function AddVoteForm({
  action,
}: {
  action: (fd: FormData) => Promise<{ error?: string; ok?: boolean }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await action(fd);
      if (res?.error) {
        setError(res.error);
        setPending(false);
        return;
      }
      setOpen(false);
      setPending(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That did not save.");
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={BTN_PRIMARY}>
        Record Vote
      </button>
    );
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <fieldset disabled={pending} className="space-y-3">
          <textarea
            name="motion"
            rows={2}
            required
            placeholder="Motion — e.g. Approve the FY2027 operating budget"
            className={`${CONTROL} resize-y`}
          />
          <div className="grid gap-3 sm:grid-cols-4">
            <select name="result" defaultValue="passed" className={CONTROL}>
              {VOTE_RESULTS.map((r) => (
                <option key={r} value={r}>
                  {VOTE_RESULT_LABELS[r]}
                </option>
              ))}
            </select>
            <input
              name="votes_for"
              type="number"
              min="0"
              defaultValue="0"
              aria-label="Votes for"
              placeholder="For"
              className={CONTROL}
            />
            <input
              name="votes_against"
              type="number"
              min="0"
              defaultValue="0"
              aria-label="Votes against"
              placeholder="Against"
              className={CONTROL}
            />
            <input
              name="votes_abstain"
              type="number"
              min="0"
              defaultValue="0"
              aria-label="Abstentions"
              placeholder="Abstain"
              className={CONTROL}
            />
          </div>
          <textarea
            name="notes"
            rows={2}
            placeholder="Notes (optional)"
            className={`${CONTROL} resize-y`}
          />
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

        <div className="flex gap-2">
          <button type="submit" disabled={pending || !ready} className={BTN_PRIMARY}>
            {pending ? "Saving..." : "Save Vote"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className={BTN_SECONDARY}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
