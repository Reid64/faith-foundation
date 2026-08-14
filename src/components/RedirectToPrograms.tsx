"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client-side fallback for retired program routes.
 *
 * The authoritative redirect is the 308 declared in vercel.json. This exists
 * only for the case where the static page is served directly (local `out/`
 * preview, a non-Vercel host), because `output: "export"` cannot emit a real
 * HTTP redirect — `redirect()` from next/navigation exports an error shell
 * with no content instead.
 */
export default function RedirectToPrograms() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/programs");
  }, [router]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-6 py-24 text-center">
      <div>
        <p className="text-lg leading-relaxed text-charcoal/80">
          Redirecting you to our programs…
        </p>
        <Link
          href="/programs"
          className="mt-6 inline-flex rounded-full bg-green px-8 py-3.5 text-base font-bold text-white shadow-green transition-colors hover:bg-green-dark"
        >
          View All Programs
        </Link>
      </div>
    </section>
  );
}
