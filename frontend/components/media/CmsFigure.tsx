import { Parallax } from '@/components/motion/Parallax';
import type { CmsImage } from '@/lib/cms-image';

/**
 * DeckFigure's counterpart for an image uploaded to WordPress. Same contract: `alt` is
 * the caller's decision, `parallax` wraps it in a drift, and the className belongs to the
 * outer box.
 */
export function CmsFigure({
  image,
  alt,
  sizes = '100vw',
  className = '',
  priority = false,
  parallax,
}: {
  image: CmsImage;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  parallax?: number;
}) {
  const figure = (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.srcSet ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      // Eager, never fetchPriority="high": see DeckFigure — the hint leaks into every
      // linking page's prefetch.
      className={parallax === undefined ? `h-auto w-full ${className}` : 'h-auto w-full'}
    />
  );

  if (parallax === undefined) return figure;

  return (
    <Parallax speed={parallax} className={className}>
      {figure}
    </Parallax>
  );
}
