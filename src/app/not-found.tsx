import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — FAITH Foundation",
  description: "The page you’re looking for could not be found.",
};

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden bg-navy-radial px-6 py-24 text-center text-white">
      {/* Decorative gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur">
          Error 404
        </span>
        <p className="mt-8 font-display text-7xl font-black tracking-tightish text-gold sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tightish sm:text-4xl">
          This page could not be found
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/70">
          The page you’re looking for may have moved, been renamed, or never
          existed. Let’s help you find your way back home.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-gold-gradient px-8 py-4 text-base font-bold text-navy shadow-gold ring-1 ring-gold-light/50 transition-all duration-300 hover:brightness-105 hover:shadow-card-lg"
          >
            Return Home
          </Link>
          <Link
            href="/contact"
            className="rounded-full border-2 border-white/40 px-8 py-4 text-base font-bold text-white backdrop-blur transition-all duration-300 hover:border-gold hover:text-gold"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}


