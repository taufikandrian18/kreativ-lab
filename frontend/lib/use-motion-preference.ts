'use client';

import { useSyncExternalStore } from 'react';

/**
 * The reduced-motion preference cannot be read during a static prerender — there is no
 * `window`, so any render-time branch resolves to "motion allowed" and bakes the motion
 * branch into the shipped HTML for everyone, including the people who asked for the
 * opposite. Spec §6 requires the hero video to be *swapped for* a still and every
 * marquee stopped; HTML that already carries an autoplaying <video> has downloaded and
 * started it before a single line of JS runs.
 *
 * So the preference is a three-state value. Server and first client render both see
 * 'unknown' and emit the static, motion-free branch — which also makes the two renders
 * identical, so there is no hydration mismatch. The effect resolves it immediately
 * after mount, and re-resolves it if the person changes the setting mid-session.
 */
export type MotionPreference = 'unknown' | 'reduced' | 'full';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getSnapshot(): MotionPreference {
  if (typeof window.matchMedia !== 'function') return 'full';
  return window.matchMedia(QUERY).matches ? 'reduced' : 'full';
}

function getServerSnapshot(): MotionPreference {
  return 'unknown';
}

export function useMotionPreference(): MotionPreference {
  // useSyncExternalStore rather than useState + useEffect: it is the hook designed for
  // this shape, it hands React the server snapshot to hydrate against so the two
  // renders agree by construction, and it re-reads when the person changes the setting.
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
