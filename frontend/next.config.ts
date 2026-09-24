import type { NextConfig } from "next";

// Static export: every route on this site is prerendered (the content comes from a
// frozen fixture, and the one dynamic route declares generateStaticParams), so the build
// is plain HTML, JS and assets that nginx serves directly. No Node process runs on the
// VPS, which means there is nothing to crash, restart or keep patched.
//
// trailingSlash writes /about/index.html rather than /about.html, which is what nginx's
// try_files expects for clean URLs.
//
// basePath comes from NEXT_PUBLIC_BASE_PATH so the same code runs at a domain root in dev
// and under a sub-path on the VPS (scripts/deploy-vps.sh sets /kreative-lab). Public files
// referenced by string go through lib/asset.ts, because basePath does not rewrite them.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
};

export default nextConfig;
