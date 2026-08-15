import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client.
 *
 * Safe to import from `"use client"` components. It carries only the anon key,
 * so every query it makes is subject to Row Level Security. Never reach for the
 * service-role client from the browser — see `service.ts`.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
