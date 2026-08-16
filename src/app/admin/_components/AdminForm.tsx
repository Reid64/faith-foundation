"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BTN_SECONDARY, BTN_SUBMIT } from "./theme";

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
  action: (
    formData: FormData
  ) => Promise<{ error?: string; ok?: boolean; id?: string }>;
  /**
   * Where to go once the server confirms the write. A function when the
   * destination depends on the new row — grants land on their own detail page,
   * which is only knowable after the insert returns an id.
   */
  successHref: string | ((result: { id?: string }) => string);
  submitLabel: string;
  cancelHref: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  /**
   * False until React has hydrated this component.
   *
   * Before hydration `onSubmit` is not attached, so a click made the browser
   * perform the form's NATIVE GET submit: the field values landed in the query
   * string and the record was silently never created, with no error shown
   * (reproduced against production in Phase 3C). Disabling the button until
   * hydration closes that window — the user can still type, they simply cannot
   * submit into a handler that does not exist yet.
   */
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

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
      router.push(
        typeof successHref === "function"
          ? successHref(result ?? {})
          : successHref
      );
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
          className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#dc2626]"
        >
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3 border-t border-[#f3f4f6] pt-6">
        <button
          type="submit"
          disabled={pending || !ready}
          className={BTN_SUBMIT}
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href={cancelHref} className={BTN_SECONDARY}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
