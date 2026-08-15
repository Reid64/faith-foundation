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

const CONTROL =
  "w-full rounded-lg border border-[#2d3748] bg-[#111827] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59]";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; email?: string };
}) {
  const message = searchParams?.error ? ERRORS[searchParams.error] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1623] px-6 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-[#2d3748] bg-[#1e293b] p-8 shadow-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A7C59]">
            FAITH FOUNDATION
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold text-white">
            FaithProof Admin
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">
            Internal access for FAITH Foundation staff and board members. If you
            need an account, contact an administrator.
          </p>

          <form action={signIn} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#f1f5f9]"
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
                className="block text-sm font-medium text-[#f1f5f9]"
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
              className="w-full rounded-lg bg-[#4A7C59] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d6b4a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A7C59] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e293b]"
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

        <p className="mt-6 text-center text-xs text-[#475569]">
          <Link
            href="/"
            className="underline underline-offset-4 transition hover:text-[#94a3b8]"
          >
            Return to faithfoundationsf.org
          </Link>
        </p>
      </div>
    </div>
  );
}
