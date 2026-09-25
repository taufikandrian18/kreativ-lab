import { asset } from '@/lib/asset';
import { sitePage } from '@/lib/site-content';
import { HeroView } from '@/components/sections/HeroView';

/**
 * Home → Hero in WordPress; each empty field keeps the studio's current showreel.
 *
 * 720p above 768px and 480p below, not the 1080p/720p pair spec §8 named: the 1080p file
 * was truncated mid-encode (no moov index, unplayable), so every desktop visitor
 * downloaded 1.3MB of it and then fell back to 720p anyway. Nobody has ever seen 1080p
 * here; 720p is what desktop always actually played, now re-encoded 36% smaller.
 */
export function Hero() {
  const home = sitePage('home');
  const videoWide = home.file('hero_video_wide') ?? asset('/video/hero-720.mp4');

  return (
    <HeroView
      content={{
        headline: home.text('hero_headline'),
        marquee: home.text('hero_marquee'),
        videoWide,
        videoNarrow: home.file('hero_video_narrow') ?? (home.file('hero_video_wide') ? videoWide : asset('/video/hero-480.mp4')),
        poster: home.image('hero_poster')?.src ?? asset('/video/hero-poster.webp'),
        still: home.image('hero_still')?.src ?? asset('/video/hero-still-reduced.webp'),
        videoLabel: home.text('hero_video_label'),
      }}
    />
  );
}
