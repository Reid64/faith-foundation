"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BTN_PRIMARY, BTN_SECONDARY, CONTROL } from "../../../_components/theme";

type Result = { error?: string; ok?: boolean };
type Action = (fd: FormData) => Promise<Result>;

function useSubmit(onDone: () => void) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function submit(action: Action, form: HTMLFormElement) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await action(new FormData(form));
      if (res?.error) {
        setError(res.error);
        setPending(false);
        return;
      }
      onDone();
      setPending(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That did not save.");
      setPending(false);
    }
  }

  return { error, setError, pending, ready, submit };
}

function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-2 rounded-lg px-3 py-2 text-sm"
      style={{
        backgroundColor: "#fef2f2",
        color: "#dc2626",
        border: "1px solid #fecaca",
      }}
    >
      {message}
    </p>
  );
}

/**
 * Roster a volunteer onto this event.
 *
 * The picker only lists contacts recorded as volunteers, because the server
 * action refuses anything else — offering a name it would reject would be a
 * trap.
 */
export function AddVolunteerForm({
  action,
  volunteers,
}: {
  action: Action;
  volunteers: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const { error, pending, ready, submit } = useSubmit(() => setOpen(false));

  if (volunteers.length === 0) {
    return (
      <p className="text-sm" style={{ color: "#9ca3af" }}>
        No contacts are recorded as volunteers yet. Add one under CRM → Contacts
        with the type set to Volunteer.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        disabled={!ready}
        onClick={() => setOpen(true)}
        className={BTN_PRIMARY}
      >
        Add Volunteer
      </button>
    );
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(action, e.currentTarget);
        }}
      >
        <fieldset disabled={pending} className="grid gap-3 sm:grid-cols-2">
          <select name="contact_id" required defaultValue="" className={CONTROL}>
            <option value="" disabled>
              Choose a volunteer…
            </option>
            {volunteers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
          <input name="notes" placeholder="Notes (optional)" className={CONTROL} />
        </fieldset>
        <ErrorNote message={error} />
        <div className="mt-3 flex gap-2">
          <button type="submit" disabled={pending || !ready} className={BTN_PRIMARY}>
            {pending ? "Adding..." : "Add to Roster"}
          </button>
          <button type="button" className={BTN_SECONDARY} onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/** Hours and notes for one shift, edited in place. */
export function LogHoursForm({
  action,
  hours,
  notes,
}: {
  action: Action;
  hours: number | null;
  notes: string | null;
}) {
  const [open, setOpen] = useState(false);
  const { error, pending, ready, submit } = useSubmit(() => setOpen(false));

  if (!open) {
    return (
      <button
        type="button"
        disabled={!ready}
        onClick={() => setOpen(true)}
        className="text-sm font-semibold"
        style={{ color: "#013e37" }}
      >
        {hours === null ? "Log hours" : "Edit"}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit(action, e.currentTarget);
      }}
    >
      <fieldset disabled={pending} className="flex flex-wrap items-center gap-2">
        <input
          name="hours_logged"
          type="number"
          step="0.25"
          min="0"
          max="999.99"
          defaultValue={hours ?? ""}
          aria-label="Hours logged"
          className="w-24 rounded-lg border border-[#d1d5db] bg-white px-2 py-1 text-sm"
        />
        <input
          name="notes"
          defaultValue={notes ?? ""}
          placeholder="Notes"
          aria-label="Shift notes"
          className="w-40 rounded-lg border border-[#d1d5db] bg-white px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={pending || !ready}
          className="rounded-lg px-3 py-1 text-sm font-semibold"
          style={{ backgroundColor: "#013e37", color: "#ffefb3" }}
        >
          {pending ? "..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm"
          style={{ color: "#6b7280" }}
        >
          Cancel
        </button>
      </fieldset>
      <ErrorNote message={error} />
    </form>
  );
}
