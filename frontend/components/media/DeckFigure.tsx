import { deckImage } from '@/lib/deck';

/**
 * The one place a deck derivative becomes an <img>.
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
}: {
  page: number;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const img = deckImage(page);

  return (
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
      className={`h-auto w-full ${className}`}
    />
  );
}
