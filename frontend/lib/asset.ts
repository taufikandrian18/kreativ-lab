// Public files (video, deck pages, logos, panels…) are referenced by absolute path, and
// Next's basePath does not rewrite those strings — it only prefixes <Link> hrefs and its
// own /_next assets. Every public path therefore goes through here, so the site works both
// at a domain root (dev, BASE unset) and under a sub-path such as /kreative-lab on the VPS.
//
// NEXT_PUBLIC_ variables are inlined at build time, so this costs nothing at runtime.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
