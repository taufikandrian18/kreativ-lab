import { Parallax } from '@/components/motion/Parallax';
import { deckImage } from '@/lib/deck';

/**
 * The one place a deck derivative becomes an <img>.
 *
 * `parallax` takes a speed relative to the page and wraps the figure in a drift, which
 * is how the site gets depth without a second image layer. The wrapper carries the
 * caller's className — margins belong to the outer box, not to the image inside it.
 *
 * `alt` is required and has no default on purpose. Spec §11 wants descriptive alt text,
 * but an image whose alt repeats visible text beside it is announced twice — so each
 * caller decides: a description when the image carries content the page does not, or
 * `alt=""` when those words are already on the page as text.
 */
export function DeckFigure({
  page,
  alt,
  sizes = '100vw',
  className = '',
  priority = false,
  parallax,
}: {
  page: number;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  parallax?: number;
}) {
  const img = deckImage(page);

  const figure = (
    <img
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      width={img.width}
      height={img.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' as const } : {})}
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
