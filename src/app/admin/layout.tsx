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
 * Role pill tones — these sit on the dark sidebar, so they are the one place in
 * the UI that is not part of the light pastel badge system.
 */
const ROLE_TONES: Record<string, string> = {
  admin: "bg-[rgba(255,239,179,0.15)] text-[#ffefb3] border-[rgba(255,239,179,0.25)]",
  board: "bg-[rgba(147,197,253,0.15)] text-[#bfdbfe] border-[rgba(147,197,253,0.25)]",
  staff:
    "bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)] border-[rgba(255,255,255,0.2)]",
  public:
    "bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)] border-[rgba(255,255,255,0.2)]",
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
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* The sidebar is the ONLY dark surface in the admin UI. */}
      <aside
        style={{ borderRight: "1px solid rgba(255,239,179,0.15)" }}
        className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[#013e37]"
      >
        <div className="px-5 py-5">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest text-[#ffefb3]"
            style={{ opacity: 0.7 }}
          >
            FAITH FOUNDATION
          </p>
          <p className="mt-1 text-xl font-semibold text-white">FaithProof</p>
        </div>

        <AdminNav />

        <div
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          className="px-5 py-4"
        >
          <p
            className="truncate text-xs text-[rgba(255,255,255,0.45)]"
            title={email}
          >
            {email}
          </p>

          <div className="mt-2">
            {role ? (
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
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
                className="inline-flex items-center rounded-full border border-[rgba(252,165,165,0.3)] bg-[rgba(252,165,165,0.15)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#fca5a5]"
                title="No row in profiles for this user — every table will read as empty until one exists."
              >
                no profile
              </span>
            )}
          </div>

          <form action={signOut} className="mt-4">
            <button
              type="submit"
              className="text-xs font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.45)] transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffefb3]"
            >
              Sign Out
            </button>
          </form>

          <Link
            href="/"
            className="mt-3 block text-xs text-[rgba(255,255,255,0.35)] transition hover:text-[rgba(255,255,255,0.7)]"
          >
            View public site
          </Link>
        </div>
      </aside>

      {/* A <div>, not <main>: the root layout already wraps every route in
          <main id="main-content">, and a document may only have one <main>. */}
      <div className="ml-60 min-h-screen bg-[#f8f7f4] p-8">{children}</div>
    </div>
  );
}
