"use client";

import { useRef, useState } from "react";
import { AdminForm } from "../../_components/AdminForm";
import { Field, Select, TextInput } from "../../_components/fields";
import { CONTROL } from "../../_components/theme";
import { MERGE_TAGS, renderTemplate, renderSubject } from "@/lib/mergeTemplates";

const TYPES = [
  { value: "custom", label: "Custom" },
  { value: "donor_receipt", label: "Donor Receipt" },
  { value: "impact_report", label: "Impact Report" },
  { value: "volunteer_welcome", label: "Volunteer Welcome" },
  { value: "application_update", label: "Application Update" },
  { value: "board_report", label: "Board Report" },
];

const SAMPLE = {
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@example.com",
  phone: "555-0100",
  city: "Burnet",
  state: "TX",
};

export function TemplateEditor({
  action,
  successHref,
  submitLabel,
  template,
}: {
  action: (fd: FormData) => Promise<{ error?: string; ok?: boolean }>;
  successHref: string;
  submitLabel: string;
  template?: {
    id: string;
    name: string;
    subject: string;
    body_html: string;
    type: string;
  };
}) {
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [body, setBody] = useState(template?.body_html ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [showPreview, setShowPreview] = useState(false);

  /** Insert a merge tag at the cursor rather than appending it. */
  function insertTag(tag: string) {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = body.slice(0, start) + tag + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + tag.length;
    });
  }

  return (
    <AdminForm
      action={action}
      successHref={successHref}
      cancelHref={successHref}
      submitLabel={submitLabel}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Template name" htmlFor="name" required>
          <TextInput id="name" name="name" required defaultValue={template?.name ?? ""} />
        </Field>
        <Field label="Type" htmlFor="type" required>
          <Select
            id="type"
            name="type"
            required
            defaultValue={template?.type ?? "custom"}
            options={TYPES}
          />
        </Field>
      </div>

      <Field label="Subject" htmlFor="subject" required>
        <input
          id="subject"
          name="subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={CONTROL}
        />
      </Field>

      <div>
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#6b7280" }}
        >
          Insert merge tag
        </p>
        <div className="mb-3 flex flex-wrap gap-2">
          {MERGE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => insertTag(tag)}
              className="rounded-lg px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                color: "#374151",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        <Field label="Body (HTML)" htmlFor="body_html" required>
          <textarea
            id="body_html"
            name="body_html"
            ref={bodyRef}
            required
            rows={14}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`${CONTROL} resize-y font-mono text-xs`}
          />
        </Field>

        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="mt-3 rounded-lg px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: "#ffffff", border: "1px solid #d1d5db", color: "#374151" }}
        >
          {showPreview ? "Hide preview" : "Preview with sample data"}
        </button>

        {showPreview ? (
          <div
            className="mt-3 rounded-xl p-4"
            style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
              Subject
            </p>
            <p className="mb-3 text-sm" style={{ color: "#111827" }}>
              {renderSubject(subject, SAMPLE)}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
              Body — rendered for Jane Doe
            </p>
            {/* Preview only. Values are HTML-escaped by renderTemplate before
                they reach this markup. */}
            <div
              className="mt-1 text-sm"
              style={{ color: "#374151" }}
              dangerouslySetInnerHTML={{ __html: renderTemplate(body, SAMPLE) }}
            />
          </div>
        ) : null}
      </div>
    </AdminForm>
  );
}
