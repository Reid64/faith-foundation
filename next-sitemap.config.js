/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://faithfoundationsf.org",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // This project uses `output: "export"`, so the build output lives in `out/`.
  outDir: "out",
  trailingSlash: true,
  changefreq: "weekly",
  priority: 0.7,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
