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

/**
 * Role pill tones.
 *
 * `admin` uses the butter accent specified for the admin badge. The other roles
 * borrow the indicator set rather than the old slate greys, which read as a
 * foreign object against the deep green sidebar.
 */
const ROLE_TONES: Record<string, string> = {
  admin:
    "bg-[rgba(255,239,179,0.15)] text-[#ffefb3] ring-[rgba(255,239,179,0.3)]",
  board: "bg-[rgba(96,165,250,0.15)] text-[#60a5fa] ring-[rgba(96,165,250,0.3)]",
  staff:
    "bg-[rgba(255,239,179,0.1)] text-[rgba(255,239,179,0.7)] ring-[rgba(255,239,179,0.2)]",
  public:
    "bg-[rgba(255,239,179,0.1)] text-[rgba(255,239,179,0.7)] ring-[rgba(255,239,179,0.2)]",
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
    <div className="min-h-screen bg-[#1e293b]">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[rgba(255,239,179,0.15)] bg-[#013e37]">
        <div className="px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(255,239,179,0.6)]">
            FAITH FOUNDATION
          </p>
          <p className="mt-1 text-xl font-semibold text-[#ffefb3]">FaithProof</p>
        </div>

        <AdminNav />

        <div className="border-t border-[rgba(255,239,179,0.15)] px-5 py-4">
          <p
            className="truncate text-xs text-[rgba(255,239,179,0.5)]"
            title={email}
          >
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
                className="inline-flex items-center rounded-full bg-[rgba(248,113,113,0.15)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-[#f87171] ring-1 ring-inset ring-[rgba(248,113,113,0.3)]"
                title="No row in profiles for this user — every table will read as empty until one exists."
              >
                no profile
              </span>
            )}
          </div>

          <form action={signOut} className="mt-4">
            <button
              type="submit"
              className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,239,179,0.5)] transition hover:text-[#ffefb3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffefb3]"
            >
              Sign Out
            </button>
          </form>

          <Link
            href="/"
            className="mt-3 block text-xs text-[rgba(255,239,179,0.5)] transition hover:text-[#ffefb3]"
          >
            View public site
          </Link>
        </div>
      </aside>

      {/* A <div>, not <main>: the root layout already wraps every route in
          <main id="main-content">, and a document may only have one <main>. */}
      <div className="ml-60 min-h-screen bg-[#1e293b] p-8">{children}</div>
    </div>
  );
}
