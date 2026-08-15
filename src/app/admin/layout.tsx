import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "FaithProof | FAITH Foundation",
  description: "Internal accountability system for FAITH Foundation.",
  robots: { index: false, follow: false, nocache: true },
};

// Auth state is per-request; nothing here may be cached or prerendered.
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/transactions", label: "Transactions" },
  { href: "/admin/vouchers", label: "Vouchers" },
  { href: "/admin/promises", label: "Promises" },
  { href: "/admin/proof-vault", label: "Proof Vault" },
  { href: "/admin/audit-log", label: "Audit Log" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The middleware already gates /admin, but it can only see the cookie. This
  // check runs against Supabase itself and is the one that actually protects
  // the data — never rely on middleware alone for authorisation.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col bg-white text-charcoal lg:flex-row">
      <aside className="flex w-full flex-col bg-[#1a1a2e] text-white lg:min-h-screen lg:w-64 lg:shrink-0">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold">
            FAITH Foundation
          </p>
          <p className="mt-1 font-display text-xl leading-tight text-white">
            FaithProof
          </p>
        </div>

        <nav aria-label="FaithProof sections" className="flex-1 px-3 py-5">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-gold/60"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-6 py-5">
          <p className="truncate text-sm font-medium text-white">
            {profile?.full_name || user.email}
          </p>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-white/50">
            {profile?.role ?? "no profile"}
          </p>
          <form action={signOut} className="mt-4">
            <button
              type="submit"
              className="text-xs font-semibold uppercase tracking-wider text-gold transition hover:text-gold-light focus:outline-none focus:ring-2 focus:ring-gold/60"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-3 block text-xs text-white/40 transition hover:text-white/70"
          >
            View public site
          </Link>
        </div>
      </aside>

      {/* A <div>, not <main>: the root layout already wraps every route in
          <main id="main-content">, and a document may only have one <main>. */}
      <div className="min-w-0 flex-1 bg-white px-6 py-10 lg:px-10">
        {children}
      </div>
    </div>
  );
}
