"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BTN_SECONDARY } from "../_components/theme";

/** Toggle switch that saves the moment it is flipped. */
export function SettingToggle({
  settingKey,
  label,
  description,
  initial,
  save,
}: {
  settingKey: string;
  label: string;
  description: string;
  initial: boolean;
  save: (key: string, value: boolean) => Promise<{ error?: string; ok?: boolean }>;
}) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function flip() {
    if (busy) return;
    const next = !on;
    setBusy(true);
    setError(null);
    // Optimistic, then reverted on failure — a toggle that silently snaps back
    // with no explanation is how people end up thinking a section is published
    // when it is not.
    setOn(next);
    const result = await save(settingKey, next);
    if (result?.error) {
      setOn(!next);
      setError(result.error);
    }
    setBusy(false);
  }

  return (
    <div
      className="flex items-start justify-between gap-4 py-3"
      style={{ borderBottom: "1px solid #f0f0ef" }}
    >
      <div className="min-w-0">
        <p style={{ color: "#374151", fontSize: 14, fontWeight: 500 }}>
          {label}
        </p>
        <p className="mt-0.5" style={{ color: "#6b7280", fontSize: 13 }}>
          {description}
        </p>
        {error ? (
          <p role="alert" className="mt-1 text-xs" style={{ color: "#dc2626" }}>
            {error}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={busy}
        onClick={flip}
        className="relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-60"
        style={{ backgroundColor: on ? "#013e37" : "#d1d5db" }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
          style={{ left: on ? 22 : 2 }}
        />
      </button>
    </div>
  );
}

/** Password reset — sends Supabase's own reset email to the signed-in address. */
export function ResetPasswordButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function send() {
    setState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }
    setState("sent");
    setMessage(`Password reset email sent to ${email}`);
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={send}
        disabled={state === "sending" || state === "sent"}
        className={BTN_SECONDARY}
      >
        {state === "sending" ? "Sending..." : "Reset Password"}
      </button>
      {message ? (
        <p
          role="status"
          className="mt-2 text-sm"
          style={{ color: state === "error" ? "#dc2626" : "#16a34a" }}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

// ExportButton moved to ../_components/ExportButton in Phase 14: importing it
// from here dragged the supabase browser client into every page that only
// wanted a download button. Re-exported so existing imports keep working.
export { ExportButton } from "../_components/ExportButton";
