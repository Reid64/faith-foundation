/**
 * Routes that are internal tooling rather than the public marketing site.
 *
 * The App Router has a single root layout (`src/app/layout.tsx`) which renders
 * SiteHeader and SiteFooter around every route. Escaping it entirely would mean
 * moving all ~25 public routes into a `(site)` route group so the admin area
 * could have its own root layout — a large restructure of a live site for a
 * purely cosmetic gain. Instead the two chrome components consult this helper
 * and render nothing on internal routes, so the FaithProof admin shell is the
 * whole page.
 *
 * Keep this list in step with PROTECTED_PATHS in `src/middleware.ts`.
 */
const INTERNAL_PREFIXES = ["/admin", "/faithproof"];

export function isInternalRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return INTERNAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
