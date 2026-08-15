import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "./actions";

export const metadata: Metadata = {
  title: "FaithProof Admin Login | FAITH Foundation",
  description:
    "Sign in to the FAITH Foundation FaithProof accountability system. Internal staff and board access only.",
  // Internal tool: keep it out of the index and out of Google Ad Grants crawls.
  robots: { index: false, follow: false, nocache: true },
};

const ERRORS: Record<string, string> = {
  missing: "Enter both an email address and a password.",
  invalid: "Those credentials were not accepted. Please try again.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; email?: string };
}) {
  const message = searchParams?.error ? ERRORS[searchParams.error] : null;

  return (
    <div className="bg-navy py-20 sm:py-28">
      <div className="mx-auto w-full max-w-md px-6">
        <div className="rounded-2xl border border-white/10 bg-navy-dark/60 p-8 shadow-card-lg sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            FaithProof
          </p>
          <h1 className="mt-3 font-display text-3xl text-white">
            FaithProof Admin Login
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Internal access for FAITH Foundation staff and board members. If you
            need an account, contact an administrator.
          </p>

          {message ? (
            <p
              role="alert"
              className="mt-6 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
            >
              {message}
            </p>
          ) : null}

          <form action={signIn} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/90"
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
                className="mt-2 w-full rounded-lg border border-white/15 bg-navy-deep/70 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
                placeholder="you@faithfoundationsf.org"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/90"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-lg border border-white/15 bg-navy-deep/70 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gold px-6 py-3 font-semibold text-navy-dark transition hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-gold/60 focus:ring-offset-2 focus:ring-offset-navy-dark"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-white/50">
          <Link href="/" className="underline underline-offset-4 hover:text-white">
            Return to faithfoundationsf.org
          </Link>
        </p>
      </div>
    </div>
  );
}
