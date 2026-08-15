"use client";

import { useEffect, useRef, useState } from "react";

type ZeffyEmbedProps = {
  /** Zeffy embed URL. */
  src: string;
  /** Accessible iframe title. */
  title: string;
};

/**
 * Lazy-loaded Zeffy donation form.
 *
 * The Zeffy embed pulls in ~2MB of third-party scripts (Stripe, hCaptcha,
 * PayPal, Amplitude). Rendering the iframe on page load would block the
 * initial render, so instead we render a lightweight, styled placeholder and
 * only mount the iframe when the user is about to reach it (IntersectionObserver
 * with a generous rootMargin) or clicks the button. This keeps the donate page
 * fast to first paint while still having the form ready by the time the visitor
 * scrolls down to give.
 */
export default function ZeffyEmbed({ src, title }: ZeffyEmbedProps) {
  const [load, setLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (load) return;
    const el = containerRef.current;
    if (!el) return;
    // No IntersectionObserver support → fall back to loading immediately.
    if (typeof IntersectionObserver === "undefined") {
      setLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  return (
    <div
      ref={containerRef}
      className="card-surface mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl"
    >
      {load ? (
        <iframe
          src={src}
          title={title}
          allow="payment"
          allowTransparency
          loading="lazy"
          style={{ width: "100%", minHeight: "700px", border: "none" }}
        />
      ) : (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 px-8 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green/10 text-green-dark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <div>
            <p className="text-lg font-bold text-navy">Secure Donation Form</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-charcoal/70">
              Processed securely by Zeffy, which charges nonprofits no platform
              or transaction fee, so your full gift reaches FAITH Foundation.
              Zeffy may separately invite you to add an optional tip that
              supports Zeffy — that tip is not part of your donation to us. The
              form loads on demand to keep this page fast.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLoad(true)}
            className="rounded-full bg-green px-10 py-4 text-base font-bold text-white shadow-green transition-colors hover:bg-green-dark"
          >
            Load Donation Form
          </button>
        </div>
      )}
    </div>
  );
}
