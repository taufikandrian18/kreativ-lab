import type { NextConfig } from "next";

// Static export: every route on this site is prerendered (the content comes from a
// frozen fixture, and the one dynamic route declares generateStaticParams), so the build
// is plain HTML, JS and assets that nginx serves directly. No Node process runs on the
// VPS, which means there is nothing to crash, restart or keep patched.
//
// trailingSlash writes /about/index.html rather than /about.html, which is what nginx's
// try_files expects for clean URLs.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
