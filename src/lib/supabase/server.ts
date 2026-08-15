import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client, bound to the request's cookie jar so the signed-in
 * user's session is carried into every query. Use this in server components,
 * server actions, and route handlers.
 *
 * Like the browser client it uses the anon key, so RLS still applies — this is
 * the correct client for anything acting *as the user*.
 */
export async function createServerClient() {
  const cookieStore = cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component, where the cookie jar is read-only.
            // The middleware refreshes the session cookies on every request, so
            // swallowing this is safe and is the pattern Supabase documents.
          }
        },
      },
    }
  );
}
