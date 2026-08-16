/** @type {import('next-sitemap').IConfig} */

// Page-level priorities. Keys are normalized (no trailing slash; "" is the home
// page) so the lookup works whether or not `trailingSlash` is on.
const PRIORITY_BY_PATH = {
  "": 1.0,
  "/donate": 0.9,
  "/faithproof": 0.9,
  "/faithproof/explorer": 0.8,
  "/programs": 0.8,
  "/about": 0.8,
  "/contact": 0.8,
  "/impact": 0.8,
  "/financial-transparency": 0.8,
};

const DEFAULT_PRIORITY = 0.7;

module.exports = {
  siteUrl: "https://www.faithfoundationsf.org",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // Was "out" while the project used `output: "export"`. FaithProof Phase 1
  // removed static export, so `out/` no longer exists and writing there would
  // have produced NO sitemap and NO robots.txt — silently, because `postbuild`
  // is guarded with `|| exit 0`. For a server-rendered Next app the generated
  // files belong in `public/`, which is served from the site root.
  //
  // Both generated files are gitignored: they are build artifacts, and a
  // committed copy would recreate the stale dual-source problem that deleting
  // public/sitemap.xml solved on 2026-08-14.
  outDir: "public",
  trailingSlash: true,
  changefreq: "weekly",
  priority: DEFAULT_PRIORITY,
  // Emergency Bridge Housing, Financial Literacy, and Single Parent Stability
  // were retired; those routes only exist to redirect to /programs, so they
  // must stay out of the sitemap. `icon.png` is the app-router icon asset, not
  // a page.
  // The ADMIN tool is internal and must never be crawled. /faithproof is the
  // PUBLIC transparency page and is deliberately indexed at priority 0.9.
  exclude: [
    "/login",
    "/login/",
    "/admin",
    "/admin/*",
    "/icon.png",
    "/icon.png/",
    "/programs/emergency",
    "/programs/emergency/",
    "/programs/financial-literacy",
    "/programs/financial-literacy/",
    "/programs/single-parents",
    "/programs/single-parents/",
  ],
  // /faithproof and /faithproof/explorer render live Supabase data, so they are
  // `force-dynamic` and never appear in the static build manifest that
  // next-sitemap crawls. They are public, indexable pages, so they are listed
  // explicitly here — without this they are silently absent from the sitemap.
  additionalPaths: async (config) => [
    await config.transform(config, "/faithproof/"),
    await config.transform(config, "/faithproof/explorer/"),
  ],
  transform: async (config, path) => {
    const normalized = path.replace(/\/+$/, "");

    return {
      loc: path,
      changefreq: normalized.startsWith("/faithproof") ? "daily" : "weekly",
      priority: PRIORITY_BY_PATH[normalized] ?? DEFAULT_PRIORITY,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login"],
      },
    ],
  },
};
