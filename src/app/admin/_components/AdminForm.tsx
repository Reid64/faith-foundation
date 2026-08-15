"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Shared submit wrapper for every FaithProof "new record" form.
 *
 * WHY THE SERVER ACTION IS CALLED DIRECTLY RATHER THAN VIA `<form action={...}>`:
 *
 * A plain form action navigates on every submit, which throws away everything
 * the user typed the moment the insert is rejected. These forms can be rejected
 * for a reason the user can actually act on — row level security allows INSERT
 * only for `role = 'admin'`, so a `staff` account gets a policy violation after
 * filling in a dozen fields. Losing their input at that moment would be its own
 * defect. Calling the action as a promise re-renders without navigating, so the
 * uncontrolled inputs keep their values and the error appears above the buttons.
 *
 * The action therefore RETURNS `{ error }` or `{ ok: true }` instead of calling
 * `redirect()`; navigation happens here on success. Same destination, but the
 * failure path stays on the page with the data intact.
 *
 * Nothing here reports success on its own. `onDone` runs only after the action
 * has confirmed the write — this codebase has a documented history of forms
 * that showed a success state while discarding the submission, and the site
 * audit encodes that invariant.
 */
export function AdminForm({
  action,
  successHref,
  submitLabel,
  cancelHref,
  children,
}: {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean }>;
  successHref: string;
  submitLabel: string;
  cancelHref: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await action(formData);

      if (result?.error) {
        setError(result.error);
        setPending(false);
        return;
      }

      // Only reached once the server has confirmed the insert.
      router.push(successHref);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong and the record was not saved."
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false} className="space-y-6">
      <fieldset disabled={pending} className="space-y-6">
        {children}
      </fieldset>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#f87171]"
        >
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3 border-t border-[#2d3748] pt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-lg bg-[#4A7C59] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d6b4a] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A7C59] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="text-sm text-[#94a3b8] transition hover:text-[#f1f5f9]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
