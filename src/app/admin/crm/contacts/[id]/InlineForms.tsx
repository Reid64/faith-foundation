"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BTN_PRIMARY, BTN_SECONDARY, CONTROL } from "../../../_components/theme";
import {
  INTERACTION_TYPES,
  INTERACTION_TYPE_LABELS,
  PIPELINE_STAGES,
  TASK_PRIORITIES,
  stageLabel,
  type ContactType,
} from "@/lib/faithproof/crm";

type Action = (fd: FormData) => Promise<{ error?: string; ok?: boolean }>;

/**
 * Shared inline-form shell.
 *
 * Same contract as <AdminForm>: disabled until hydrated so a click cannot fall
 * through to a native GET, errors render in place, and nothing reports success
 * until the server confirms the write.
 */
function InlineForm({
  action,
  submitLabel,
  onDone,
  children,
}: {
  action: Action;
  submitLabel: string;
  onDone: () => void;
  children: React.ReactNode;
}) {
  const router = useRouter();
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
      onDone();
      router.refresh();
      setPending(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That did not save.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <fieldset disabled={pending} className="space-y-3">
        {children}
      </fieldset>
      {error ? (
        <p
          role="alert"
          className="rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
        >
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button type="submit" disabled={pending || !ready} className={BTN_PRIMARY}>
          {pending ? "Saving..." : submitLabel}
        </button>
        <button type="button" onClick={onDone} className={BTN_SECONDARY}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Toggle({
  label,
  open,
  setOpen,
}: {
  label: string;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  if (open) return null;
  return (
    <button type="button" onClick={() => setOpen(true)} className={BTN_PRIMARY}>
      {label}
    </button>
  );
}

export function LogInteractionForm({ action }: { action: Action }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5">
      <Toggle label="Log Interaction" open={open} setOpen={setOpen} />
      {open ? (
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
        >
          <InlineForm action={action} submitLabel="Save Interaction" onDone={() => setOpen(false)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <select name="type" defaultValue="note" className={CONTROL}>
                {INTERACTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {INTERACTION_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                name="occurred_at"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className={CONTROL}
              />
            </div>
            <input name="subject" placeholder="Subject" className={CONTROL} />
            <textarea name="body" rows={3} placeholder="Notes" className={`${CONTROL} resize-y`} />
          </InlineForm>
        </div>
      ) : null}
    </div>
  );
}

export function AddTaskForm({
  action,
  assignees,
}: {
  action: Action;
  assignees: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5">
      <Toggle label="Add Task" open={open} setOpen={setOpen} />
      {open ? (
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
        >
          <InlineForm action={action} submitLabel="Save Task" onDone={() => setOpen(false)}>
            <input name="title" placeholder="Task title" required className={CONTROL} />
            <textarea name="description" rows={2} placeholder="Description" className={`${CONTROL} resize-y`} />
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="date" name="due_date" className={CONTROL} />
              <select name="priority" defaultValue="medium" className={CONTROL}>
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select name="assigned_to" defaultValue="" className={CONTROL}>
                <option value="">— unassigned —</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </InlineForm>
        </div>
      ) : null}
    </div>
  );
}

export function LinkTransactionForm({ action }: { action: Action }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5">
      <Toggle label="Link Transaction" open={open} setOpen={setOpen} />
      {open ? (
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
        >
          <InlineForm action={action} submitLabel="Link" onDone={() => setOpen(false)}>
            <input
              name="transaction_id"
              placeholder="Transaction UUID"
              required
              className={CONTROL}
            />
          </InlineForm>
        </div>
      ) : null}
    </div>
  );
}

export function AddCampaignTagForm({ action }: { action: Action }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5">
      <Toggle label="Add Tag" open={open} setOpen={setOpen} />
      {open ? (
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
        >
          <InlineForm action={action} submitLabel="Add Tag" onDone={() => setOpen(false)}>
            <input name="campaign" placeholder="Campaign name" required className={CONTROL} />
          </InlineForm>
        </div>
      ) : null}
    </div>
  );
}

/** Pipeline stage picker that saves the moment it changes. */
export function StageSelector({
  contactType,
  current,
  save,
}: {
  contactType: ContactType;
  current: string | null;
  save: (stage: string) => Promise<{ error?: string; ok?: boolean }>;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stages = PIPELINE_STAGES[contactType] ?? [];

  async function onChange(next: string) {
    const previous = value;
    setValue(next);
    setBusy(true);
    setError(null);
    const res = await save(next);
    if (res?.error) {
      setValue(previous);
      setError(res.error);
    } else {
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="mt-3">
      <label
        htmlFor="stage-select"
        className="block text-xs font-semibold uppercase tracking-wider"
        style={{ color: "#6b7280" }}
      >
        Pipeline stage
      </label>
      <select
        id="stage-select"
        value={value}
        disabled={busy}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 ${CONTROL}`}
      >
        <option value="">— none —</option>
        {stages.map((s) => (
          <option key={s} value={s}>
            {stageLabel(s)}
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert" className="mt-1 text-xs" style={{ color: "#dc2626" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CompleteTaskButton({
  taskId,
  complete,
}: {
  taskId: string;
  complete: (id: string) => Promise<{ error?: string; ok?: boolean }>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setReady(true), []);

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        disabled={busy || !ready}
        onClick={async () => {
          setBusy(true);
          const res = await complete(taskId);
          if (res?.error) {
            setError(res.error);
            setBusy(false);
            return;
          }
          router.refresh();
        }}
        className="rounded-lg px-3 py-1.5 text-xs font-semibold"
        style={{ backgroundColor: "#16a34a", color: "#ffffff", opacity: busy ? 0.6 : 1 }}
      >
        {busy ? "..." : "Complete"}
      </button>
      {error ? (
        <span className="text-xs" style={{ color: "#dc2626" }}>
          {error}
        </span>
      ) : null}
    </span>
  );
}
