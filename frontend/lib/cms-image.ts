import { asset } from '@/lib/asset';
import type { ContractImage } from '@/lib/contract';

export interface CmsImage {
  src: string;
  srcSet: string | undefined;
  width: number;
  height: number;
  alt: string | null;
}

// Used only when WordPress did not record a size, which a real upload always has. 4:3 is
// the least wrong guess for a photograph, and the image still scales to its true shape.
const FALLBACK = { width: 1600, height: 1200 };

/**
 * A contract image ready for an <img>, or null when the field is empty — so a caller
 * falls back to the deck artwork with a plain `??`.
 *
 * Contract paths are root-relative; the base path is applied here, at render time, for
 * the same reason lib/asset.ts exists: Next's basePath never rewrites plain strings.
 * A remote URL (content fetched without localising, which fetch-cms.mjs never produces)
 * is passed through untouched rather than mangled into a local path.
 */
export function cmsImage(img: ContractImage | null | undefined): CmsImage | null {
  if (!img?.url) return null;

  const resolve = (url: string) => (/^https?:\/\//.test(url) ? url : asset(url));
  const variants = img.variants ?? [];

  return {
    src: resolve(img.url),
    srcSet:
      variants.length > 1
        ? variants.map((v) => `${resolve(v.url)} ${v.width}w`).join(', ')
        : undefined,
    width: img.width ?? FALLBACK.width,
    height: img.height ?? FALLBACK.height,
    alt: img.alt || null,
  };
}
