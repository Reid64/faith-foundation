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
  "w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#9ca3af] outline-none transition focus:border-[#013e37] focus:ring-[3px] focus:ring-[rgba(1,62,55,0.08)] focus:ring-offset-0";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; email?: string };
}) {
  const message = searchParams?.error ? ERRORS[searchParams.error] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 py-16">
      <div className="w-full max-w-md">
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            boxShadow:
              "0 4px 6px rgba(0,0,0,0.05), 0 20px 40px rgba(1,62,55,0.1)",
          }}
          className="p-10"
        >
          {/* The one green block on the page — the brand mark, not a fill. */}
          <div className="inline-block rounded-xl bg-[#013e37] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ffefb3]">
              FAITH FOUNDATION
            </p>
            <p className="mt-0.5 text-[18px] font-semibold leading-tight text-white">
              FaithProof
            </p>
          </div>

          <h1 className="mt-6 text-[22px] font-bold text-[#013e37]">
            Sign in to your account
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-[#6b7280]">
            Internal access for FAITH Foundation staff and board members. If you
            need an account, contact an administrator.
          </p>

          <form action={signIn} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#374151]"
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
                className="block text-sm font-medium text-[#374151]"
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
              className="w-full rounded-lg bg-[#013e37] py-2.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition hover:bg-[#025a50] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#013e37] focus-visible:ring-offset-2"
            >
              Sign In
            </button>

            {message ? (
              <p
                role="alert"
                className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#dc2626]"
              >
                {message}
              </p>
            ) : null}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#9ca3af]">
          <Link
            href="/"
            className="underline underline-offset-4 transition hover:text-[#013e37]"
          >
            Return to faithfoundationsf.org
          </Link>
        </p>
      </div>
    </div>
  );
}
