import type { Contact } from "@/lib/faithproof/crm";

/**
 * Merge-tag rendering for email templates.
 *
 * VALUES ARE HTML-ESCAPED. Templates are HTML and the substituted values come
 * from contact records — a name containing `<` or a quote would otherwise break
 * the markup, and a crafted value would be an injection path into every
 * recipient's inbox.
 */

const ORG_NAME = "FAITH Foundation";
const EIN = "33-2640449";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const MERGE_TAGS = [
  "{{first_name}}",
  "{{last_name}}",
  "{{email}}",
  "{{phone}}",
  "{{city}}",
  "{{state}}",
  "{{date}}",
  "{{org_name}}",
  "{{ein}}",
  "{{assigned_to}}",
] as const;

export function renderTemplate(
  html: string,
  contact: Partial<Contact>,
  extra: Record<string, string> = {}
): string {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const values: Record<string, string> = {
    first_name: contact.first_name ?? "",
    last_name: contact.last_name ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    city: contact.city ?? "",
    state: contact.state ?? "",
    date: today,
    org_name: ORG_NAME,
    ein: EIN,
    assigned_to: "",
    ...extra,
  };

  return html.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, key: string) => {
    const value = values[key.toLowerCase()];
    // An unknown tag is left as written rather than blanked, so a typo is
    // visible in the preview instead of silently producing an empty sentence.
    return value === undefined ? match : escapeHtml(value);
  });
}

/** Same substitution for a plain-text field such as the subject line. */
export function renderSubject(
  subject: string,
  contact: Partial<Contact>,
  extra: Record<string, string> = {}
): string {
  const rendered = renderTemplate(subject, contact, extra);
  // Undo escaping — a subject header is not HTML.
  return rendered
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
