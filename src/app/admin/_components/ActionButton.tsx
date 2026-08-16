"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BTN_DANGER,
  BTN_INFO,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_SUCCESS,
} from "./theme";

const VARIANTS = {
  primary: BTN_PRIMARY,
  success: BTN_SUCCESS,
  danger: BTN_DANGER,
  info: BTN_INFO,
  secondary: BTN_SECONDARY,
} as const;

export type ActionVariant = keyof typeof VARIANTS;

/**
 * A button that runs a bound server action and refreshes the page.
 *
 * Like <AdminForm>, it stays disabled until React has hydrated. These buttons
 * change financial state — confirming a transaction, disbursing a voucher — so
 * a click that lands before the handler exists must not fall through to a
 * native submit.
 *
 * The action RETURNS `{ error }` rather than redirecting, so a refusal (an RLS
 * denial, say) is shown in place instead of bouncing the user somewhere with no
 * explanation. On success the server has already revalidated, so a refresh is
 * enough to show the new status.
 */
export function ActionButton({
  action,
  label,
  variant = "primary",
  confirm,
}: {
  action: () => Promise<{ error?: string; ok?: boolean }>;
  label: string;
  variant?: ActionVariant;
  /** If set, the user must accept this prompt before the action runs. */
  confirm?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setReady(true), []);

  async function run() {
    if (pending) return;
    if (confirm && !window.confirm(confirm)) return;

    setPending(true);
    setError(null);
    try {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        setPending(false);
        return;
      }
      router.refresh();
      // Leave `pending` true: the refresh replaces this view, and re-enabling
      // the button first invites a second click on an already-applied change.
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "The action did not complete."
      );
      setPending(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={run}
        disabled={pending || !ready}
        className={VARIANTS[variant]}
      >
        {pending ? "Working..." : label}
      </button>
      {error ? (
        <span
          role="alert"
          className="max-w-xs text-xs"
          style={{ color: "#dc2626" }}
        >
          {error}
        </span>
      ) : null}
    </span>
  );
}
