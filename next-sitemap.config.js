/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.faithfoundationsf.org",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // This project uses `output: "export"`, so the build output lives in `out/`.
  outDir: "out",
  trailingSlash: true,
  changefreq: "weekly",
  priority: 0.7,
  // Emergency Bridge Housing, Financial Literacy, and Single Parent Stability
  // were retired; those routes only exist to redirect to /programs, so they
  // must stay out of the sitemap.
  exclude: [
    "/programs/emergency",
    "/programs/emergency/",
    "/programs/financial-literacy",
    "/programs/financial-literacy/",
    "/programs/single-parents",
    "/programs/single-parents/",
  ],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
