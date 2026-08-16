import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "./actions";

export const metadata: Metadata = {
  title: "FaithProof Admin | FAITH Foundation",
  description:
    "Sign in to the FAITH Foundation FaithProof accountability system. Internal staff and board access only.",
  // Internal tool: keep it out of the index and out of Google Ad Grants crawls.
  robots: { index: false, follow: false, nocache: true },
};

const ERRORS: Record<string, string> = {
  missing: "Enter both an email address and a password.",
  invalid: "Those credentials were not accepted. Please try again.",
};

// Kept local rather than imported from the admin theme module: /login is the
// only page outside src/app/admin/ that uses this palette, and a shared import
// would couple a public-routable page to the admin component tree.
const CONTROL =
  "w-full rounded-lg border border-[rgba(255,239,179,0.2)] bg-[rgba(1,62,55,0.6)] px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[rgba(255,239,179,0.35)] outline-none transition focus:border-[#ffefb3] focus:ring-1 focus:ring-[#ffefb3]";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; email?: string };
}) {
  const message = searchParams?.error ? ERRORS[searchParams.error] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e293b] px-6 py-16">
      <div className="w-full max-w-md">
        <div
          style={{
            backgroundColor: "#013e37",
            borderTop: "1px solid rgba(255,239,179,0.2)",
            boxShadow:
              "0 4px 24px rgba(1,62,55,0.4), 0 1px 4px rgba(0,0,0,0.3)",
          }}
          className="rounded-xl border border-[rgba(255,239,179,0.15)] p-8"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(255,239,179,0.6)]">
            FAITH FOUNDATION
          </p>
          <h1 className="mt-1.5 text-2xl font-bold text-[#ffefb3]">
            FaithProof Admin
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[rgba(255,239,179,0.7)]">
            Internal access for FAITH Foundation staff and board members. If you
            need an account, contact an administrator.
          </p>

          <form action={signIn} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[rgba(255,239,179,0.8)]"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={searchParams?.email ?? ""}
                placeholder="you@faithfoundationsf.org"
                className={`mt-1.5 ${CONTROL}`}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[rgba(255,239,179,0.8)]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className={`mt-1.5 ${CONTROL}`}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#ffefb3] px-5 py-2.5 text-sm font-semibold text-[#013e37] transition hover:bg-[#fff5cc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffefb3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#013e37]"
            >
              Sign In
            </button>

            {message ? (
              <p role="alert" className="text-sm text-[#f87171]">
                {message}
              </p>
            ) : null}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[rgba(255,239,179,0.5)]">
          <Link
            href="/"
            className="underline underline-offset-4 transition hover:text-[#ffefb3]"
          >
            Return to faithfoundationsf.org
          </Link>
        </p>
      </div>
    </div>
  );
}
