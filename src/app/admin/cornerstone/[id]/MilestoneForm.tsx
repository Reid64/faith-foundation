"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BTN_PRIMARY, BTN_SECONDARY, CONTROL } from "../../_components/theme";

export function MilestoneForm({
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
    try {
      const res = await action(new FormData(e.currentTarget));
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
      <button
        type="button"
        disabled={!ready}
        onClick={() => setOpen(true)}
        className={BTN_PRIMARY}
      >
        Add Milestone
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
          <input
            name="title"
            required
            placeholder="Milestone — e.g. Septic permit approved"
            className={CONTROL}
          />
          <textarea
            name="description"
            rows={2}
            placeholder="Description (optional)"
            className={`${CONTROL} resize-y`}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs" style={{ color: "#6b7280" }}>
              Target date
              <input name="target_date" type="date" className={`${CONTROL} mt-1`} />
            </label>
            <label className="text-xs" style={{ color: "#6b7280" }}>
              Completed date
              <input name="completed_date" type="date" className={`${CONTROL} mt-1`} />
            </label>
          </div>
          <label className="flex items-start gap-3 text-sm" style={{ color: "#374151" }}>
            <input
              name="is_public"
              type="checkbox"
              defaultChecked
              className="mt-0.5 h-4 w-4 rounded border-[#d1d5db] accent-[#013e37]"
            />
            <span>
              Show on the public Cornerstone page
              <span className="mt-0.5 block text-xs" style={{ color: "#6b7280" }}>
                Do not name the modular home partner in a public milestone.
              </span>
            </span>
          </label>
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
            {pending ? "Saving..." : "Save Milestone"}
          </button>
          <button type="button" className={BTN_SECONDARY} onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
