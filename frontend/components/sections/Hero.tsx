import { asset } from '@/lib/asset';
import { sitePage } from '@/lib/site-content';
import { HeroView } from '@/components/sections/HeroView';

/** Home → Hero in WordPress; each empty field keeps the studio's current showreel. */
export function Hero() {
  const home = sitePage('home');
  const videoWide = home.file('hero_video_wide') ?? asset('/video/hero-1080.mp4');

  return (
    <HeroView
      content={{
        headline: home.text('hero_headline'),
        marquee: home.text('hero_marquee'),
        videoWide,
        videoNarrow: home.file('hero_video_narrow') ?? (home.file('hero_video_wide') ? videoWide : asset('/video/hero-720.mp4')),
        poster: home.image('hero_poster')?.src ?? asset('/video/hero-poster.jpg'),
        still: home.image('hero_still')?.src ?? asset('/video/hero-still-reduced.jpg'),
        videoLabel: home.text('hero_video_label'),
      }}
    />
  );
}
