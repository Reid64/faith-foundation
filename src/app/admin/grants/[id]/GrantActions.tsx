"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BTN_DANGER,
  BTN_INFO,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_SUCCESS,
  CONTROL,
} from "../../_components/theme";
import type { GrantStatus } from "@/lib/faithproof/grants";

type Result = { error?: string; ok?: boolean };
type Variant = "primary" | "success" | "danger" | "info";

const VARIANTS: Record<Variant, string> = {
  primary: BTN_PRIMARY,
  success: BTN_SUCCESS,
  danger: BTN_DANGER,
  info: BTN_INFO,
};

export type Transition = {
  next: GrantStatus;
  label: string;
  variant: Variant;
  action: (fd: FormData) => Promise<Result>;
};

/**
 * Which transitions need something typed before they can be applied.
 *
 * Everything here is optional on the server too — a grant can be marked awarded
 * before the exact figure is known — so these prompt rather than block.
 */
function fieldsFor(next: GrantStatus): { name: string; label: string; type: string }[] {
  if (next === "applied") {
    return [
      { name: "application_deadline", label: "Application deadline", type: "date" },
    ];
  }
  if (next === "awarded") {
    return [
      { name: "amount", label: "Awarded amount (dollars)", type: "text" },
      { name: "award_date", label: "Award date", type: "date" },
    ];
  }
  if (next === "reporting") {
    return [
      { name: "reporting_deadline", label: "Reporting deadline", type: "date" },
      { name: "reporting_period", label: "Reporting period", type: "text" },
    ];
  }
  return [];
}

export function GrantActions({ transitions }: { transitions: Transition[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<GrantStatus | null>(null);
  const [pending, setPending] = useState<GrantStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function run(t: Transition, fd: FormData) {
    if (pending) return;
    setPending(t.next);
    setError(null);
    try {
      const res = await t.action(fd);
      if (res?.error) {
        setError(res.error);
        setPending(null);
        return;
      }
      setOpen(null);
      router.refresh();
      // `pending` stays set: the refresh replaces this view, and re-enabling
      // first invites a second click on a change that already landed.
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That did not apply.");
      setPending(null);
    }
  }

  if (transitions.length === 0) return null;

  const openTransition = transitions.find((t) => t.next === open);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        {transitions.map((t) => {
          const needsInput = fieldsFor(t.next).length > 0;
          return (
            <button
              key={t.next}
              type="button"
              disabled={!ready || pending !== null}
              className={VARIANTS[t.variant]}
              onClick={() => {
                if (needsInput) {
                  setError(null);
                  setOpen(open === t.next ? null : t.next);
                } else {
                  void run(t, new FormData());
                }
              }}
            >
              {pending === t.next ? "Working..." : t.label}
            </button>
          );
        })}
      </div>

      {openTransition ? (
        <form
          className="mt-4 rounded-xl p-4"
          style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
          onSubmit={(e) => {
            e.preventDefault();
            void run(openTransition, new FormData(e.currentTarget));
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {fieldsFor(openTransition.next).map((f) => (
              <label key={f.name} className="block text-sm" style={{ color: "#374151" }}>
                {f.label}
                <span className="ml-2 text-xs" style={{ color: "#9ca3af" }}>
                  optional
                </span>
                <input
                  name={f.name}
                  type={f.type}
                  className={`${CONTROL} mt-1.5`}
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={pending !== null}
              className={VARIANTS[openTransition.variant]}
            >
              {pending ? "Working..." : openTransition.label}
            </button>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => setOpen(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-lg px-3 py-2 text-sm"
          style={{
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
