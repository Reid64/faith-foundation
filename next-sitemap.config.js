/** @type {import('next-sitemap').IConfig} */

// Page-level priorities. Keys are normalized (no trailing slash; "" is the home
// page) so the lookup works whether or not `trailingSlash` is on.
const PRIORITY_BY_PATH = {
  "": 1.0,
  "/donate": 0.9,
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
  // This project uses `output: "export"`, so the build output lives in `out/`.
  outDir: "out",
  trailingSlash: true,
  changefreq: "weekly",
  priority: DEFAULT_PRIORITY,
  // Emergency Bridge Housing, Financial Literacy, and Single Parent Stability
  // were retired; those routes only exist to redirect to /programs, so they
  // must stay out of the sitemap. `icon.png` is the app-router icon asset, not
  // a page.
  exclude: [
    "/icon.png",
    "/icon.png/",
    "/programs/emergency",
    "/programs/emergency/",
    "/programs/financial-literacy",
    "/programs/financial-literacy/",
    "/programs/single-parents",
    "/programs/single-parents/",
  ],
  transform: async (config, path) => {
    const normalized = path.replace(/\/+$/, "");

    return {
      loc: path,
      changefreq: "weekly",
      priority: PRIORITY_BY_PATH[normalized] ?? DEFAULT_PRIORITY,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
