"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BTN_PRIMARY, BTN_SECONDARY, CONTROL } from "../../_components/theme";

/**
 * One notes field, editable in place.
 *
 * Each editor saves only its own column, so two people working on different
 * sections of the same grant cannot overwrite each other's text.
 */
export function NotesEditor({
  title,
  field,
  value,
  action,
}: {
  title: string;
  field: string;
  value: string | null;
  action: (fd: FormData) => Promise<{ error?: string; ok?: boolean }>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setEditing(false);
      setPending(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Those notes did not save.");
      setPending(false);
    }
  }

  return (
    <section
      className="p-5"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(1,62,55,0.1)",
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 style={{ color: "#013e37", fontSize: 15, fontWeight: 600 }}>{title}</h2>
        {!editing ? (
          <button
            type="button"
            disabled={!ready}
            onClick={() => setEditing(true)}
            className="text-sm font-semibold"
            style={{ color: "#013e37" }}
          >
            {value ? "Edit" : "Add"}
          </button>
        ) : null}
      </div>

      {editing ? (
        <form onSubmit={onSubmit} className="space-y-3">
          <textarea
            name={field}
            rows={6}
            defaultValue={value ?? ""}
            className={`${CONTROL} resize-y`}
          />
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
              {pending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p
          className="whitespace-pre-wrap text-sm leading-relaxed"
          style={{ color: value ? "#374151" : "#9ca3af" }}
        >
          {value || "Nothing recorded yet."}
        </p>
      )}
    </section>
  );
}
