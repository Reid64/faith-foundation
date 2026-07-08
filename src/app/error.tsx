"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service.
    console.error(error);
  }, [error]);

  return (
    <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden bg-navy-radial px-6 py-24 text-center text-white">
      {/* Decorative gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur">
          Something went wrong
        </span>
        <h1 className="mt-8 font-display text-4xl font-black tracking-tightish sm:text-5xl">
          An unexpected error occurred
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/70">
          We’re sorry for the inconvenience. You can try again, or head back to
          the homepage. If the problem persists, please get in touch with us.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-white/40">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-full bg-gold-gradient px-8 py-4 text-base font-bold text-navy shadow-gold ring-1 ring-gold-light/50 transition-all duration-300 hover:brightness-105 hover:shadow-card-lg"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border-2 border-white/40 px-8 py-4 text-base font-bold text-white backdrop-blur transition-all duration-300 hover:border-gold hover:text-gold"
          >
            Return Home
          </Link>
        </div>
      </div>
    </section>
  );
}


