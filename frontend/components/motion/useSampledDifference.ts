'use client';

import { useEffect, type RefObject } from 'react';
import { coverPoint, differenceOfWhite, needsBlendFallback } from '@/lib/blend-fallback';

/** Samples per second. Enough to follow the showreel's cuts; cheap on a phone. */
const RATE = 10;

/** The frame is read at 1/8 of its size: a letter covers dozens of these pixels anyway. */
const DOWNSCALE = 8;

/**
 * On iOS only, recreates the hero headline's difference blend by hand (lib/blend-fallback.ts
 * says why). Runs only while the hero is on screen, the tab is visible and the video has a
 * frame to read. Reads every letter's box first and writes every colour after, so a tick
 * costs one layout read, not one per letter. Undoes itself on unmount.
 */
export function useSampledDifference(
  section: RefObject<HTMLElement | null>,
  enabled: boolean
): void {
  useEffect(() => {
    const el = section.current;
    if (!enabled || !el) return;
    if (!needsBlendFallback(navigator.userAgent, navigator.platform, navigator.maxTouchPoints)) {
      return;
    }
    const video = el.querySelector('video');
    const headline = el.querySelector<HTMLElement>('[data-split-headline]');
    if (!video || !headline) return;

    const chars = Array.from(headline.querySelectorAll<HTMLElement>('[data-split-char]'));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    // The blend does nothing on iOS; leaving it on would difference our own colours
    // wherever WebKit does manage to composite, inverting them back.
    headline.classList.remove('mix-blend-difference');
    headline.dataset.blend = 'sampled';

    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(el);

    const tick = () => {
      if (!visible || document.hidden || video.readyState < 2 || !video.videoWidth) return;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const cw = Math.max(1, Math.round(vw / DOWNSCALE));
      const ch = Math.max(1, Math.round(vh / DOWNSCALE));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      try {
        context.drawImage(video, 0, 0, cw, ch);
      } catch {
        return;
      }
      const data = context.getImageData(0, 0, cw, ch).data;
      const box = video.getBoundingClientRect();
      const boxes = chars.map((char) => char.getBoundingClientRect());

      const colours = boxes.map((b) => {
        if (!b.width) return null;
        let r = 0;
        let g = 0;
        let bl = 0;
        let n = 0;
        for (const fx of [0.25, 0.5, 0.75]) {
          for (const fy of [0.35, 0.65]) {
            const p = coverPoint(b.left + b.width * fx, b.top + b.height * fy, box, vw, vh);
            const x = Math.max(0, Math.min(cw - 1, Math.floor(p.x / DOWNSCALE)));
            const y = Math.max(0, Math.min(ch - 1, Math.floor(p.y / DOWNSCALE)));
            const i = (y * cw + x) * 4;
            r += data[i];
            g += data[i + 1];
            bl += data[i + 2];
            n++;
          }
        }
        return differenceOfWhite(r / n, g / n, bl / n);
      });
      colours.forEach((colour, i) => {
        if (colour) chars[i].style.color = colour;
      });
    };

    const timer = window.setInterval(tick, 1000 / RATE);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      headline.classList.add('mix-blend-difference');
      delete headline.dataset.blend;
      for (const char of chars) char.style.color = '';
    };
  }, [section, enabled]);
}
