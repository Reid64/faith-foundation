// Server-only by construction: this pulls in @/lib/supabase/server, which uses
// `next/headers`. Next.js already refuses to bundle that into a client
// component, so the `server-only` package would add a dependency for a
// guarantee we already have.
import { createServerClient } from "@/lib/supabase/server";
import type { Profile } from "./types";

export type SupabaseServer = Awaited<ReturnType<typeof createServerClient>>;

export type SessionContext = {
  supabase: SupabaseServer;
  userId: string;
  email: string;
  profile: Profile | null;
  /** Convenience: profile?.role === 'admin'. Writes require this. */
  isAdmin: boolean;
};

/**
 * Resolve the signed-in user and their FaithProof profile.
 *
 * Returns null when there is no session. Callers in layouts redirect; callers
 * in server actions return an error so the form can render it inline rather
 * than bouncing the user to /login and losing their input.
 */
export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return {
    supabase,
    userId: user.id,
    email: user.email ?? profile?.email ?? "",
    profile: profile ?? null,
    isAdmin: profile?.role === "admin",
  };
}

/**
 * Turn a Postgres/PostgREST error into something a person can act on.
 *
 * The raw messages are accurate but unhelpful at the point of failure — the one
 * that matters most here is 42501 / "new row violates row-level security
 * policy", which every non-admin hits on every insert because the schema grants
 * write access only to `role = 'admin'`. Showing that verbatim reads like a
 * bug; naming the actual cause tells the user to ask for a role change.
 */
export function describeDbError(
  error: { code?: string; message?: string; details?: string } | null,
  action: string
): string {
  if (!error) return `Could not ${action}.`;

  const code = error.code ?? "";
  const message = error.message ?? "";

  if (code === "42501" || /row-level security/i.test(message)) {
    return `You do not have permission to ${action}. Writing to FaithProof requires the "admin" role — your account does not have it. Ask an administrator to update your role.`;
  }

  if (code === "23505") {
    return `Could not ${action}: a record with that unique value already exists. Check the reference or voucher number and try again.`;
  }

  if (code === "23514") {
    return `Could not ${action}: a value failed a database constraint. Amounts must be greater than zero.`;
  }

  if (code === "23503") {
    return `Could not ${action}: a referenced record does not exist.`;
  }

  if (code === "22P02") {
    return `Could not ${action}: one of the selected values is not valid for its field.`;
  }

  return `Could not ${action}: ${message || "unknown database error"}.`;
}

/**
 * Append an entry to the audit log.
 *
 * Deliberately NON-FATAL. If the audit write fails, the record that was just
 * created still exists and the user must be told the create succeeded — the
 * alternative is reporting failure for a write that actually happened, which
 * would push them to submit it a second time and duplicate real financial data.
 * The failure is surfaced on the server console instead, and the missing entry
 * is visible as a gap in the Audit Log page.
 *
 * Ordering matters: this is always called AFTER the insert it describes, so a
 * rejected insert never produces an audit entry claiming otherwise.
 */
export async function writeAuditLog(
  supabase: SupabaseServer,
  entry: {
    actorId: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    newValue?: unknown;
    oldValue?: unknown;
  }
): Promise<void> {
  const { error } = await supabase.from("audit_log").insert({
    actor_id: entry.actorId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    new_value: entry.newValue ?? null,
    old_value: entry.oldValue ?? null,
  });

  if (error) {
    console.error(
      `[faithproof] audit_log write failed for ${entry.action} on ${entry.entityType}:`,
      error.message
    );
  }
}
