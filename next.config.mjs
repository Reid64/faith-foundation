/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Use the SWC minifier (default in Next 14, set explicitly) — smaller output
  // and fewer legacy JS polyfills than the old Terser path.
  swcMinify: true,
  async redirects() {
    return [
      { source: '/programs/emergency', destination: '/programs', permanent: true },
      { source: '/programs/emergency/', destination: '/programs', permanent: true },
      { source: '/programs/financial-literacy', destination: '/programs', permanent: true },
      { source: '/programs/financial-literacy/', destination: '/programs', permanent: true },
      { source: '/programs/single-parents', destination: '/programs', permanent: true },
      { source: '/programs/single-parents/', destination: '/programs', permanent: true },
    ];
  },
};

export default nextConfig;
