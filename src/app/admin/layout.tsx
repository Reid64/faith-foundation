import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/login/actions";
import { getSession } from "@/lib/faithproof/session";
import { AdminNav } from "./_components/AdminNav";

export const metadata: Metadata = {
  title: "FaithProof | FAITH Foundation",
  description: "Internal accountability system for FAITH Foundation.",
  robots: { index: false, follow: false, nocache: true },
};

// Auth state is per-request; nothing under /admin may be cached or prerendered.
export const dynamic = "force-dynamic";

const ROLE_TONES: Record<string, string> = {
  admin: "bg-[#22c55e]/15 text-[#4ade80] ring-[#22c55e]/30",
  board: "bg-[#3b82f6]/15 text-[#60a5fa] ring-[#3b82f6]/30",
  staff: "bg-[#475569]/25 text-[#94a3b8] ring-[#475569]/40",
  public: "bg-[#475569]/25 text-[#94a3b8] ring-[#475569]/40",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // The middleware already gates /admin, but it only sees the cookie. This
  // check runs against Supabase itself and is the one that actually protects
  // the data — never rely on middleware alone for authorisation.
  if (!session) redirect("/login");

  const { email, profile } = session;
  const role = profile?.role ?? null;

  return (
    <div className="min-h-screen bg-[#111827]">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[#2d3748] bg-[#0f1623]">
        <div className="px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A7C59]">
            FAITH FOUNDATION
          </p>
          <p className="mt-1 text-xl font-semibold text-white">FaithProof</p>
        </div>

        <AdminNav />

        <div className="border-t border-[#2d3748] px-5 py-4">
          <p className="truncate text-xs text-[#475569]" title={email}>
            {email}
          </p>

          <div className="mt-2">
            {role ? (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ring-1 ring-inset ${
                  ROLE_TONES[role] ?? ROLE_TONES.staff
                }`}
              >
                {role}
              </span>
            ) : (
              // A signed-in user with no profile row means the handle_new_user
              // trigger did not fire for them. Say so plainly — every RLS
              // policy resolves the caller's role from this row, so without it
              // every query returns empty and the tool looks merely idle.
              <span
                className="inline-flex items-center rounded-full bg-[#ef4444]/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-[#f87171] ring-1 ring-inset ring-[#ef4444]/30"
                title="No row in profiles for this user — every table will read as empty until one exists."
              >
                no profile
              </span>
            )}
          </div>

          <form action={signOut} className="mt-4">
            <button
              type="submit"
              className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A7C59]"
            >
              Sign Out
            </button>
          </form>

          <Link
            href="/"
            className="mt-3 block text-xs text-[#475569] transition hover:text-[#94a3b8]"
          >
            View public site
          </Link>
        </div>
      </aside>

      {/* A <div>, not <main>: the root layout already wraps every route in
          <main id="main-content">, and a document may only have one <main>. */}
      <div className="ml-60 min-h-screen bg-[#111827] p-8">{children}</div>
    </div>
  );
}
