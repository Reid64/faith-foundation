import { redirect } from "next/navigation";
import { getSession } from "@/lib/faithproof/session";

/**
 * Board-only gate.
 *
 * Middleware cannot do this — `src/middleware.ts` only checks that a session
 * cookie resolves to a user and never reads `profiles`, and adding a database
 * round-trip there would run on every matched request.
 *
 * This is the second of three layers, not the only one:
 *   1. middleware  — is there a session at all
 *   2. this layout — is the role admin or board (clear redirect if not)
 *   3. RLS         — the actual boundary; a staff user querying the tables
 *                    directly gets nothing back regardless of the UI
 */
export default async function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = session.profile?.role;
  if (role !== "admin" && role !== "board") {
    redirect("/admin?denied=board");
  }

  return <>{children}</>;
}
