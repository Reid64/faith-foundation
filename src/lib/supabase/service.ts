import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client.
 *
 * ⚠️ THIS CLIENT BYPASSES ROW LEVEL SECURITY ENTIRELY.
 *
 * It authenticates with the service-role key and can read and write every row in
 * every table regardless of policy. Import it ONLY from server-side code —
 * route handlers, server actions, and scripts. Importing it into a client
 * component would ship the key to the browser and hand any visitor full
 * database access.
 *
 * There is no `NEXT_PUBLIC_` prefix on the key, so Next.js will not inline it
 * into client bundles; the `!` assertions below will throw at import time if it
 * is missing, which is the intended loud failure.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
