/**
 * Public-section setting keys.
 *
 * Kept out of actions.ts because a "use server" module may only export async
 * functions — exporting this array from there fails the build with
 * "A 'use server' file can only export async functions, found object."
 */
export const PUBLIC_SECTION_KEYS = [
  "show_accountability_pulse",
  "show_open_ledger",
  "show_promises",
  "show_proof_vault",
  "show_nothing_hidden",
] as const;

export type SettingKey = (typeof PUBLIC_SECTION_KEYS)[number];
