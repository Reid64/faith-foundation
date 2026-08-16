"use client";

import { useEffect, useState } from "react";
import { BTN_SUBMIT, CONTROL } from "../../../../_components/theme";
import { contactName, type Contact } from "@/lib/faithproof/crm";
import { renderSubject, renderTemplate } from "@/lib/mergeTemplates";
import type { SendSummary } from "./actions";

type Template = {
  id: string;
  name: string;
  subject: string;
  body_html: string;
};

export function SendForm({
  templates,
  contacts,
  action,
}: {
  templates: Template[];
  contacts: Contact[];
  action: (fd: FormData) => Promise<SendSummary>;
}) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [selected, setSelected] = useState<Set<string>>(
    // Contacts with no email are left unchecked by default — sending to them
    // can only ever be recorded as a failure.
    new Set(contacts.filter((c) => c.email).map((c) => c.id))
  );
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<SendSummary | null>(null);
  useEffect(() => setReady(true), []);

  const template = templates.find((t) => t.id === templateId);
  const previewContact = contacts.find((c) => selected.has(c.id)) ?? contacts[0];

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    if (
      !window.confirm(
        `Send "${template?.name ?? "this template"}" to ${selected.size} contact(s)? This cannot be undone.`
      )
    ) {
      return;
    }
    setPending(true);
    setResult(null);
    const fd = new FormData();
    fd.set("template_id", templateId);
    for (const id of Array.from(selected)) fd.append("contact_ids", id);
    const res = await action(fd);
    setResult(res);
    setPending(false);
  }

  if (templates.length === 0) {
    return (
      <p className="text-sm" style={{ color: "#9ca3af" }}>
        Create an email template first — there is nothing to send yet.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="template"
          className="block text-sm font-medium"
          style={{ color: "#374151" }}
        >
          Template
        </label>
        <select
          id="template"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className={`mt-1.5 ${CONTROL}`}
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium" style={{ color: "#374151" }}>
            Recipients ({selected.size} of {contacts.length})
          </p>
          <div className="flex gap-3 text-sm">
            <button
              type="button"
              onClick={() => setSelected(new Set(contacts.filter((c) => c.email).map((c) => c.id)))}
              style={{ color: "#013e37", fontWeight: 600 }}
            >
              Select all with email
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              style={{ color: "#6b7280" }}
            >
              Clear
            </button>
          </div>
        </div>
        <ul
          className="max-h-64 overflow-y-auto rounded-xl"
          style={{ border: "1px solid #e5e7eb" }}
        >
          {contacts.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 px-4 py-2"
              style={{ borderBottom: "1px solid #f0f0ef" }}
            >
              <input
                type="checkbox"
                id={`c-${c.id}`}
                checked={selected.has(c.id)}
                onChange={() => toggle(c.id)}
                className="h-4 w-4 accent-[#013e37]"
              />
              <label htmlFor={`c-${c.id}`} className="flex-1 text-sm" style={{ color: "#374151" }}>
                {contactName(c)}
                <span className="ml-2 text-xs" style={{ color: c.email ? "#9ca3af" : "#dc2626" }}>
                  {c.email || "no email on file"}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {template && previewContact ? (
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
            Preview — {contactName(previewContact)}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: "#111827" }}>
            {renderSubject(template.subject, previewContact)}
          </p>
          <div
            className="mt-2 text-sm"
            style={{ color: "#374151" }}
            dangerouslySetInnerHTML={{
              __html: renderTemplate(template.body_html, previewContact),
            }}
          />
        </div>
      ) : null}

      {result ? (
        <div
          role="status"
          className="rounded-lg px-4 py-3 text-sm"
          style={
            result.error || (result.failed ?? 0) > 0
              ? { backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }
              : { backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }
          }
        >
          {result.error ? (
            result.error
          ) : (
            <>
              <strong>
                {result.sent} sent, {result.failed} failed
                {result.skipped ? `, ${result.skipped} skipped` : ""}.
              </strong>
              {result.detail ? <span className="block mt-1">{result.detail}</span> : null}
            </>
          )}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending || !ready || selected.size === 0}
        className={BTN_SUBMIT}
      >
        {pending ? "Sending..." : `Send to ${selected.size} contact${selected.size === 1 ? "" : "s"}`}
      </button>
    </form>
  );
}
