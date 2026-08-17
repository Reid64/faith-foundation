"use client";

import { useRef, useState } from "react";
import FormErrorNotice from "@/components/FormErrorNotice";
import {
  TURNSTILE_ENABLED,
  TurnstileWidget,
  type TurnstileHandle,
} from "@/components/TurnstileWidget";
import { openMailto } from "@/lib/mailto";
import { submitForm } from "@/lib/web3forms";
import { FORM_SUBJECTS } from "@/lib/formSubjects";

/**
 * Impact receipt request.
 *
 * Uses the same Formsubmit path as every other form on the site, and the same
 * rule: success is shown only when the endpoint confirms delivery. On failure
 * the shared notice offers the one-click email fallback so a request is never
 * silently lost — the invariant the 2026-08-14 audit put in place.
 */
export default function ImpactReceiptForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const turnstile = useRef<TurnstileHandle>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const result = await submitForm(
      FORM_SUBJECTS.impactReceipt,
      { email, message: `Impact receipt requested for: ${email}` },
      token
    );

    // Single-use token: reset whether the request landed or not.
    turnstile.current?.reset();
    setToken(null);

    if (result.ok) {
      setSent(true);
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  }

  if (sent) {
    return (
      <p
        role="status"
        className="rounded-xl border border-green/30 bg-white px-6 py-5 text-base font-semibold text-navy"
      >
        Thank you — we will email your impact receipt within 5 business days.
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="receipt-email" className="sr-only">
          Your email address
        </label>
        <input
          id="receipt-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full rounded-lg border border-[#d1d5db] bg-white px-4 py-3 text-base text-charcoal outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
        />
        <button
          type="submit"
          disabled={submitting || (TURNSTILE_ENABLED && !token)}
          className="shrink-0 rounded-lg bg-navy px-6 py-3 font-bold text-gold transition hover:bg-navy-light disabled:opacity-60"
        >
          {submitting
            ? "Sending…"
            : TURNSTILE_ENABLED && !token
              ? "Complete the check"
              : "Request My Receipt"}
        </button>
        </div>
        <TurnstileWidget ref={turnstile} onVerify={setToken} />
      </form>

      {error ? (
        <div className="mt-4">
          <FormErrorNotice
            message={error}
            onEmailFallback={() =>
              openMailto("Impact Receipt Request", [
                ["Email", email],
                ["Message", `Impact receipt requested for: ${email}`],
              ])
            }
          />
        </div>
      ) : null}
    </div>
  );
}
