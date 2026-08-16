/**
 * CSV generation, shared by every export in FaithProof.
 *
 * Extracted from src/app/admin/settings/actions.ts in Phase 14 so the volunteer
 * exports use the same escaper rather than a second hand-rolled one. A "use
 * server" module can only export async functions, which is why these live here
 * instead of alongside the export actions.
 */

export type ExportResult =
  | { error: string }
  | { filename: string; csv: string; rows: number };

/**
 * Escape one CSV field.
 *
 * Quoting is not cosmetic here: descriptions and notes routinely contain
 * commas, and an unescaped one silently shifts every later column in the row.
 * The leading-character guard blocks CSV injection — a value starting = + - @
 * is executed as a formula when the file is opened in Excel or Sheets.
 */
export function csvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(
  rows: Record<string, unknown>[],
  columns: string[]
): string {
  const head = columns.map(csvField).join(",");
  const body = rows
    .map((row) => columns.map((c) => csvField(row[c])).join(","))
    .join("\r\n");
  return rows.length ? `${head}\r\n${body}` : head;
}
