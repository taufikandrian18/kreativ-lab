# Stage 3 — Homepage Vertical Slice and Shared Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the homepage to full visual and motion fidelity, and in doing so build the self-hosted fonts, navigation shell, imagery pipeline, GSAP context, and motion primitives that every later route reuses.

**Architecture:** The existing Next.js app's data layer, routing, and tests are retained unchanged. Layered on top: `@fontsource` replaces `next/font/google` (spec §5 correction), the 104 verified deck derivatives and the hero video are copied into `frontend/public/` and addressed through a typed helper, a single GSAP context per route drives ScrollTrigger and ScrollSmoother, and three reusable primitives — marquee, clip-path mask reveal, staggered reveal — express spec §6's vocabulary. Every environment-dependent motion decision is a pure function so it can be tested without fighting jsdom.

**Tech Stack:** Next.js 16.3.5 (App Router, Turbopack), React 19, Tailwind CSS v4, `gsap@3.15.0` (ScrollTrigger + ScrollSmoother, both in the free package), `@fontsource/anton@5.3.0`, `@fontsource-variable/archivo@5.3.0`, Vitest + React Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-18-kreative-studio-lab-design.md` — read §4 (routes), §5 (tokens), §6 (motion), §7 (mobile), §8 (video), §9 (images), §13 (staging, as amended 2026-09-19).

**Branch:** merge `stage2-shell-design-system` into `master` first, then branch `stage3-homepage-foundation` from `master`. Stage 2's data layer is the foundation this builds on.

**Mapping source of truth:** `frontend/content/page-section-mapping.md` — verified page-to-section assignments. Do not re-derive them.

## Global Constraints

Copied verbatim from the spec. Every task's requirements implicitly include this section.

- Three colours only: `--k-red: #F81010`, `--k-black: #000000`, `--k-paper: #FFFFFF`. No CSS greys — greys are image content only.
- Red is restricted to display type at 24px or larger. Never body text, never labels.
- `font-display: swap`, both faces self-hosted as woff2. **No Google Fonts network request.**
- Display type is flush-left, `letter-spacing: -0.02em`, `clamp(3rem, 12vw, 11rem)` for section openers.
- 12-column grid. Gutter 16px mobile, 32px from 768px, 48px from 1280px. Max content width 1680px.
- `100vh` is never used. `100svh` or `100dvh` only.
- Motion animates `transform` and `opacity` only. Anything else is a bug. No layout-triggering property inside a scroll handler.
- All ScrollTriggers registered through a single GSAP context per route so they tear down on navigation.
- ScrollSmoother is disabled below 1024px. Native scroll and momentum are preserved. No pinning below 1024px.
- `prefers-reduced-motion: reduce` disables ScrollSmoother, replaces every scrub with its static end-state, stops all marquees, and swaps the hero video for `hero-still-reduced.jpg`. The site must be fully legible and navigable in this state.
- Video is H.264 MP4 only. No HLS, no WebM. 720p below 768px, 1080p above.
- The LCP element on `/` is the hero poster image.

## Review Focus

Five failure modes the spec implies that no task's happy path exercises. Each line's test is assigned to the task that owns the code.

1. **`prefers-reduced-motion: reduce`** — hero must render the still image instead of the video, marquees must not translate, and no ScrollSmoother instance may be created. Tested in Tasks 5, 6, 7.
2. **Viewport below 1024px** — ScrollSmoother must not be created at all, so native momentum scrolling survives on the spec's stated priority surface. Tested in Task 5.
3. **iOS Safari autoplay** — a video missing any one of `muted`, `playsinline`, `autoplay` silently renders a frozen poster with no error. Tested in Task 7.
4. **A deck image path that does not exist** — a wrong page number or width must fail loudly at build time rather than 404 into a blank section at runtime. This is the exact failure that shipped in Stage 2. Tested in Task 3.
5. **Client-side route navigation** — ScrollTriggers from the previous route must be reverted, or scroll breaks on the next route. Tested in Task 5.

---

### Task 1: Self-hosted fonts (spec §5 correction)

**Files:**
- Modify: `frontend/app/layout.tsx`
- Modify: `frontend/app/globals.css`
- Modify: `frontend/package.json`
- Test: `frontend/lib/fonts.test.ts` (create)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: the CSS custom properties `--font-display` (resolving to `'Anton'`) and `--font-body` (resolving to `'Archivo Variable'`), available to every later task through Tailwind's `font-display` and `font-body` utilities.

- [ ] **Step 1: Install the font packages**

```bash
cd frontend
npm install --legacy-peer-deps @fontsource/anton@5.3.0 @fontsource-variable/archivo@5.3.0
```

`--legacy-peer-deps` is required in this project: the root pins `@types/node@^20` while `vitest@5` peer-wants `@types/node@^22 || >=24`. This flag is already how the lockfile was produced.

- [ ] **Step 2: Write the failing test**

This test pins a spec requirement that has no runtime signal — a Google Fonts fetch failure falls back silently with no error, which is exactly how Stage 2 shipped broken. Asserting on source text is the cheapest honest way to catch a regression.

```ts
// frontend/lib/fonts.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const layout = readFileSync(join(__dirname, '../app/layout.tsx'), 'utf-8');
const globals = readFileSync(join(__dirname, '../app/globals.css'), 'utf-8');

describe('fonts are self-hosted (spec §5)', () => {
  it('makes no Google Fonts network request', () => {
    expect(layout).not.toContain('next/font/google');
    expect(globals).not.toContain('fonts.googleapis.com');
    expect(globals).not.toContain('fonts.gstatic.com');
  });

  it('imports both faces from @fontsource', () => {
    expect(layout).toContain('@fontsource/anton/latin-400.css');
    expect(layout).toContain('@fontsource-variable/archivo/wght.css');
  });

  it('points the display and body tokens at the self-hosted family names', () => {
    expect(globals).toContain("--font-display: 'Anton'");
    expect(globals).toContain("--font-body: 'Archivo Variable'");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd frontend && npx vitest run lib/fonts.test.ts`
Expected: FAIL — `layout` still contains `next/font/google`.

- [ ] **Step 4: Replace the font loading in `app/layout.tsx`**

Remove the `next/font/google` imports, the `Anton(...)` and `Archivo(...)` calls, and the font variable classes on `<html>`. The file becomes:

```tsx
import type { Metadata } from 'next';
import '@fontsource/anton/latin-400.css';
import '@fontsource-variable/archivo/wght.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kreative Studio Lab',
  description: 'Clean in form. Sharp in function.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

The `latin-400` and `wght` entrypoints are the subset builds: `latin-400.css` declares `font-family: 'Anton'` with `font-display: swap` and a woff2 source, and `wght.css` declares `font-family: 'Archivo Variable'` at `font-weight: 100 900` with `unicode-range` per subset, so the browser downloads only the ranges a page actually uses.

- [ ] **Step 5: Point the tokens at the real family names in `app/globals.css`**

Inside the `@theme` block, replace the two font lines:

```css
  --font-display: 'Anton', sans-serif;
  --font-body: 'Archivo Variable', sans-serif;
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd frontend && npx vitest run lib/fonts.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 7: Run the full suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all tests pass, no type errors.

- [ ] **Step 8: Verify the build no longer reaches for Google Fonts**

Run: `cd frontend && npm run build 2>&1 | grep -ci "googleapis" || echo "no google font requests"`
Expected: `no google font requests`. The build should now complete rather than failing on font fetches.

- [ ] **Step 9: Commit**

```bash
git add frontend/app/layout.tsx frontend/app/globals.css frontend/lib/fonts.test.ts frontend/package.json frontend/package-lock.json
git commit -m "fix(frontend): self-host Anton and Archivo per spec §5

Stage 2 used next/font/google, which spec §5 explicitly forbids ('No Google
Fonts network request'). The failure mode is silent: a blocked or slow fetch
falls back to a system grotesque with no build error, which destroys the
display identity. Replaced with @fontsource subset woff2 packages, and added
a source-level test so the requirement has a regression gate."
```

---

### Task 2: Deck and video asset pipeline

**Files:**
- Create: `frontend/public/deck/` (104 `.webp` files, copied)
- Create: `frontend/public/video/` (4 files, copied)
- Modify: `frontend/package.json`
- Test: `frontend/tests/assets.test.ts` (create)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: every deck derivative served at `/deck/page-NN-WIDTH.webp`, and the hero media at `/video/hero-1080.mp4`, `/video/hero-720.mp4`, `/video/hero-poster.jpg`, `/video/hero-still-reduced.jpg`.

Assets are copied rather than imported across directories for the same reason the fixture was: Turbopack refuses to resolve module paths that reach outside `frontend/`, and `public/` is path-addressed at runtime, so the files must physically live there.

- [ ] **Step 1: Add the sync script to `frontend/package.json`**

Add to `"scripts"`, beside the existing `sync-fixture`:

```json
    "sync-assets": "mkdir -p public/deck public/video && cp ../assets/web/*.webp public/deck/ && cp ../assets/video/* public/video/",
```

- [ ] **Step 2: Run it**

```bash
cd frontend && npm run sync-assets
```

- [ ] **Step 3: Write the failing test**

```ts
// frontend/tests/assets.test.ts
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const deckDir = join(__dirname, '../public/deck');
const videoDir = join(__dirname, '../public/video');

describe('deck and video assets are present in public/ (spec §9, §8)', () => {
  it('ships all 104 deck derivatives', () => {
    const files = readdirSync(deckDir).filter((f) => f.endsWith('.webp'));
    expect(files).toHaveLength(104);
  });

  it('ships all four widths for every one of the 26 pages', () => {
    for (let page = 1; page <= 26; page++) {
      const nn = String(page).padStart(2, '0');
      for (const width of [420, 768, 1280, 1920]) {
        expect(
          existsSync(join(deckDir, `page-${nn}-${width}.webp`)),
          `missing page-${nn}-${width}.webp`
        ).toBe(true);
      }
    }
  });

  it('ships the hero video, its poster, and the reduced-motion still', () => {
    for (const file of ['hero-1080.mp4', 'hero-720.mp4', 'hero-poster.jpg', 'hero-still-reduced.jpg']) {
      expect(existsSync(join(videoDir, file)), `missing ${file}`).toBe(true);
    }
  });
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend && npx vitest run tests/assets.test.ts`
Expected: PASS, 3 tests. If the count is not 104, the source directory changed — stop and reconcile against spec §9 rather than editing the expected number.

- [ ] **Step 5: Commit**

```bash
git add frontend/public/deck frontend/public/video frontend/package.json frontend/tests/assets.test.ts
git commit -m "feat(frontend): vendor deck derivatives and hero video into public/

Copies the 104 verified WebP derivatives and the four hero media files into
frontend/public/ so they are path-addressable at runtime and frontend/ stays
buildable standalone. Adds npm run sync-assets to re-copy from assets/, and a
test asserting all four widths exist for all 26 pages — a missing derivative
would otherwise 404 into a blank section at runtime, which is precisely how
Stage 2's hero image shipped broken."
```

---

### Task 3: Typed deck image helper

**Files:**
- Create: `frontend/lib/deck.ts`
- Test: `frontend/lib/deck.test.ts` (create)

**Interfaces:**
- Consumes: the `/deck/` paths produced by Task 2.
- Produces:
  - `DECK_WIDTHS: readonly [420, 768, 1280, 1920]`
  - `deckSrc(page: number, width: DeckWidth): string`
  - `deckSrcSet(page: number): string`
  - `deckImage(page: number): { src: string; srcSet: string; width: number; height: number }`
  - `ARCHIVE_OPENER_PAGE: Readonly<Record<string, number>>` — maps `archive_no` to the deck page carrying that case study's opener.

- [ ] **Step 1: Write the failing test**

```ts
// frontend/lib/deck.test.ts
import { describe, it, expect } from 'vitest';
import { deckSrc, deckSrcSet, deckImage, ARCHIVE_OPENER_PAGE, DECK_WIDTHS } from './deck';

describe('deck image helper (spec §9)', () => {
  it('zero-pads the page number and names the width', () => {
    expect(deckSrc(2, 1920)).toBe('/deck/page-02-1920.webp');
    expect(deckSrc(24, 420)).toBe('/deck/page-24-420.webp');
  });

  it('builds a srcSet across all four widths', () => {
    expect(deckSrcSet(4)).toBe(
      '/deck/page-04-420.webp 420w, /deck/page-04-768.webp 768w, /deck/page-04-1280.webp 1280w, /deck/page-04-1920.webp 1920w'
    );
  });

  it('reports the deck aspect ratio at 1920 wide', () => {
    const img = deckImage(2);
    expect(img.width).toBe(1920);
    expect(img.height).toBe(1358);
  });

  it('rejects a page outside 1..26 rather than emitting a 404 path', () => {
    expect(() => deckSrc(0, 1920)).toThrow(/page/i);
    expect(() => deckSrc(27, 1920)).toThrow(/page/i);
  });

  it('maps every archive_no to its verified opener page', () => {
    expect(ARCHIVE_OPENER_PAGE).toEqual({
      '01': 8, '02': 12, '03': 15, '04': 17, '05': 19, '06': 22,
    });
  });

  it('exposes the four derivative widths', () => {
    expect(DECK_WIDTHS).toEqual([420, 768, 1280, 1920]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npx vitest run lib/deck.test.ts`
Expected: FAIL — cannot resolve `./deck`.

- [ ] **Step 3: Implement `frontend/lib/deck.ts`**

```ts
// Addresses the deck derivatives vendored into public/deck by `npm run sync-assets`.
// Page-to-section assignments are recorded and verified in
// frontend/content/page-section-mapping.md — consult that file before using a page
// number here; do not re-derive the mapping.

export const DECK_WIDTHS = [420, 768, 1280, 1920] as const;
export type DeckWidth = (typeof DECK_WIDTHS)[number];

// Source pages are 2048x1448 (spec §9). At 1920 wide: 1920 * 1448 / 2048 = 1357.5.
const DECK_ASPECT = 1448 / 2048;
const DECK_PAGE_COUNT = 26;

function assertPage(page: number): void {
  if (!Number.isInteger(page) || page < 1 || page > DECK_PAGE_COUNT) {
    throw new RangeError(
      `deck page must be an integer in 1..${DECK_PAGE_COUNT}, received ${page}`
    );
  }
}

export function deckSrc(page: number, width: DeckWidth): string {
  assertPage(page);
  return `/deck/page-${String(page).padStart(2, '0')}-${width}.webp`;
}

export function deckSrcSet(page: number): string {
  assertPage(page);
  return DECK_WIDTHS.map((w) => `${deckSrc(page, w)} ${w}w`).join(', ');
}

export function deckImage(page: number): {
  src: string;
  srcSet: string;
  width: number;
  height: number;
} {
  assertPage(page);
  return {
    src: deckSrc(page, 1920),
    srcSet: deckSrcSet(page),
    width: 1920,
    height: Math.round(1920 * DECK_ASPECT),
  };
}

// Verified in frontend/content/page-section-mapping.md: each case study's opener page.
export const ARCHIVE_OPENER_PAGE: Readonly<Record<string, number>> = Object.freeze({
  '01': 8,
  '02': 12,
  '03': 15,
  '04': 17,
  '05': 19,
  '06': 22,
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend && npx vitest run lib/deck.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/deck.ts frontend/lib/deck.test.ts
git commit -m "feat(frontend): typed deck image helper with range validation

deckSrc/deckSrcSet/deckImage address the vendored derivatives, and an
out-of-range page throws instead of emitting a path that 404s into a blank
section. ARCHIVE_OPENER_PAGE carries the verified archive_no to deck page
assignments from content/page-section-mapping.md."
```

---

### Task 4: Navigation shell and footer

**Files:**
- Create: `frontend/components/chrome/SiteHeader.tsx`
- Create: `frontend/components/chrome/SiteFooter.tsx`
- Modify: `frontend/app/layout.tsx`
- Test: `frontend/components/chrome/SiteHeader.test.tsx` (create)
- Test: `frontend/components/chrome/SiteFooter.test.tsx` (create)

**Interfaces:**
- Consumes: `getSiteSetting()` from `@/lib/contract`.
- Produces: `<SiteHeader />` and `<SiteFooter />`, mounted in the root layout so every route inherits them.

The wordmark is set in Anton as live text rather than an image: spec §14 open question 5 records that vector artwork for the crossed-K mark does not exist yet, only raster.

The footer reads contact details from the fixture and renders nothing for empty fields. The fixture's `site_setting` values are currently empty even though deck page 26 carries real ones — populating them is a content-layer task recorded in `content/page-section-mapping.md`, not a front-end hardcode. The footer must degrade cleanly until then.

- [ ] **Step 1: Write the failing tests**

```tsx
// frontend/components/chrome/SiteHeader.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  it('links to all five non-home routes plus the wordmark home link', () => {
    render(<SiteHeader />);
    for (const [name, href] of [
      ['About', '/about'],
      ['Product Lab', '/product-lab'],
      ['Creative Lab', '/creative-lab'],
      ['Archive', '/archive'],
      ['Contact', '/contact'],
    ] as const) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    }
    expect(screen.getByRole('link', { name: /K STUDIOLAB/i })).toHaveAttribute('href', '/');
  });

  it('exposes the nav as a landmark for assistive technology', () => {
    render(<SiteHeader />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
```

```tsx
// frontend/components/chrome/SiteFooter.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  it('renders the wordmark', () => {
    render(<SiteFooter />);
    expect(screen.getAllByText(/K STUDIOLAB/i).length).toBeGreaterThan(0);
  });

  it('omits contact rows entirely while the fixture fields are empty', () => {
    render(<SiteFooter />);
    expect(screen.queryByText(/undefined|null/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd frontend && npx vitest run components/chrome`
Expected: FAIL — cannot resolve `./SiteHeader`.

- [ ] **Step 3: Implement `SiteHeader.tsx`**

```tsx
import Link from 'next/link';

const NAV = [
  { name: 'About', href: '/about' },
  { name: 'Product Lab', href: '/product-lab' },
  { name: 'Creative Lab', href: '/creative-lab' },
  { name: 'Archive', href: '/archive' },
  { name: 'Contact', href: '/contact' },
] as const;

export function SiteHeader() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 mix-blend-difference">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="font-display text-k-paper text-xl tracking-tight">
          K STUDIOLAB
        </Link>
        <nav aria-label="Primary">
          <ul className="flex gap-4 sm:gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-body text-k-paper text-xs tracking-widest uppercase"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
```

`mix-blend-difference` keeps the header legible over both the black hero and the white sections below without introducing a grey scrim, which the three-colour constraint forbids.

- [ ] **Step 4: Implement `SiteFooter.tsx`**

```tsx
import Link from 'next/link';
import { getSiteSetting } from '@/lib/contract';

export function SiteFooter() {
  const settings = getSiteSetting();
  const phones = [settings.phone_primary, settings.phone_secondary].filter(Boolean);

  return (
    <footer className="bg-k-black text-k-paper">
      <div className="mx-auto w-full px-4 py-16 sm:px-8 lg:px-12">
        <p className="font-display text-3xl tracking-tight">K STUDIOLAB</p>

        {settings.email ? (
          <p className="font-body mt-6 text-sm">
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </p>
        ) : null}

        {phones.length > 0 ? (
          <ul className="font-body mt-2 text-sm">
            {phones.map((phone) => (
              <li key={phone}>{phone}</li>
            ))}
          </ul>
        ) : null}

        {settings.address ? <p className="font-body mt-2 text-sm">{settings.address}</p> : null}

        <nav aria-label="Footer" className="mt-10">
          <ul className="font-body flex flex-wrap gap-6 text-xs tracking-widest uppercase">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/product-lab">Product Lab</Link></li>
            <li><Link href="/creative-lab">Creative Lab</Link></li>
            <li><Link href="/archive">Archive</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Mount both in `app/layout.tsx`**

Add the imports:

```tsx
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { SiteFooter } from '@/components/chrome/SiteFooter';
```

and wrap `{children}` so every route inherits the chrome:

```tsx
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `cd frontend && npx vitest run components/chrome`
Expected: PASS, 4 tests.

- [ ] **Step 7: Run the full suite**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all pass. If an existing route test now finds duplicate nav text, fix that test to scope its query with `within(...)` rather than weakening the assertion.

- [ ] **Step 8: Commit**

```bash
git add frontend/components/chrome frontend/app/layout.tsx
git commit -m "feat(frontend): site header and footer chrome

Adds the primary nav and footer to the root layout so every route carries
them. Wordmark is Anton live text, since spec §14 records that no vector
crossed-K artwork exists yet. Footer reads site_setting and omits empty
rows rather than hardcoding the contact details visible on deck page 26 —
populating that singleton is a content-layer task."
```

---

### Task 5: GSAP foundation and motion environment

**Files:**
- Create: `frontend/lib/motion-env.ts`
- Create: `frontend/components/motion/MotionProvider.tsx`
- Modify: `frontend/app/layout.tsx`
- Modify: `frontend/package.json`
- Test: `frontend/lib/motion-env.test.ts` (create)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `SMOOTHER_MIN_WIDTH: number`
  - `shouldEnableSmoother({ width, reducedMotion }: MotionEnv): boolean`
  - `prefersReducedMotion(): boolean`
  - `<MotionProvider>{children}</MotionProvider>` — establishes the ScrollSmoother wrapper markup and the single per-route GSAP context.

Every environment decision lives in `motion-env.ts` as a pure function. ScrollSmoother itself cannot be meaningfully exercised in jsdom — there is no layout — so the decision is tested exhaustively and the provider is a thin caller.

- [ ] **Step 1: Install GSAP**

```bash
cd frontend && npm install --legacy-peer-deps gsap@3.15.0
```

ScrollTrigger and ScrollSmoother both ship in the public package under GSAP's standard no-charge license — verified, no Club membership required.

- [ ] **Step 2: Write the failing test**

```ts
// frontend/lib/motion-env.test.ts
import { describe, it, expect } from 'vitest';
import { shouldEnableSmoother, SMOOTHER_MIN_WIDTH } from './motion-env';

describe('shouldEnableSmoother (spec §6 reduced motion, §7 mobile)', () => {
  it('enables on desktop with motion allowed', () => {
    expect(shouldEnableSmoother({ width: 1440, reducedMotion: false })).toBe(true);
  });

  it('disables below the 1024px breakpoint so native momentum scroll survives', () => {
    expect(shouldEnableSmoother({ width: 1023, reducedMotion: false })).toBe(false);
    expect(shouldEnableSmoother({ width: 390, reducedMotion: false })).toBe(false);
  });

  it('enables exactly at the breakpoint', () => {
    expect(shouldEnableSmoother({ width: SMOOTHER_MIN_WIDTH, reducedMotion: false })).toBe(true);
  });

  it('disables whenever reduced motion is requested, at any width', () => {
    expect(shouldEnableSmoother({ width: 1920, reducedMotion: true })).toBe(false);
    expect(shouldEnableSmoother({ width: 390, reducedMotion: true })).toBe(false);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `cd frontend && npx vitest run lib/motion-env.test.ts`
Expected: FAIL — cannot resolve `./motion-env`.

- [ ] **Step 4: Implement `frontend/lib/motion-env.ts`**

```ts
// Spec §7: ScrollSmoother is disabled below 1024px so native scroll and momentum are
// preserved — mobile is the priority surface, not the fallback.
// Spec §6: prefers-reduced-motion disables ScrollSmoother entirely.
export const SMOOTHER_MIN_WIDTH = 1024;

export interface MotionEnv {
  width: number;
  reducedMotion: boolean;
}

export function shouldEnableSmoother({ width, reducedMotion }: MotionEnv): boolean {
  if (reducedMotion) return false;
  return width >= SMOOTHER_MIN_WIDTH;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `cd frontend && npx vitest run lib/motion-env.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Make jsdom deterministic by defaulting tests to reduced motion**

jsdom does not implement `matchMedia` at all. `prefersReducedMotion()` guards against that and returns `false`, which means every component test would take the GSAP branch and run ScrollTrigger against a document that has no layout — slow, noisy, and non-deterministic. Defaulting the test environment to reduced motion makes components take their static branch, so tests assert on rendered output rather than on animation. Tests that specifically exercise motion override this themselves, as Tasks 6 and 7 do.

Append to `frontend/vitest.setup.ts`:

```ts
// jsdom has no matchMedia. Default every test to prefers-reduced-motion: reduce so
// components render their static end state and GSAP stays out of a layout-less
// document. Tests that assert on motion stub matchMedia themselves.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});
```

- [ ] **Step 7: Implement `frontend/components/motion/MotionProvider.tsx`**

```tsx
'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { prefersReducedMotion, shouldEnableSmoother } from '@/lib/motion-env';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // One context per route. Reverting it on pathname change tears down every
  // ScrollTrigger and the smoother together, per spec §6 — leaked triggers from a
  // previous route break scrolling on the next one.
  useLayoutEffect(() => {
    const enabled = shouldEnableSmoother({
      width: window.innerWidth,
      reducedMotion: prefersReducedMotion(),
    });
    if (!enabled) return;

    const ctx = gsap.context(() => {
      ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.1,
        effects: true,
      });
    }, wrapper);

    return () => ctx.revert();
  }, [pathname]);

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}
```

- [ ] **Step 8: Mount it in `app/layout.tsx`**

`MotionProvider` wraps the page content but not the fixed header, which must stay outside the smoothed content to remain fixed. Add `import { MotionProvider } from '@/components/motion/MotionProvider';` and change the body to:

```tsx
      <body>
        <SiteHeader />
        <MotionProvider>
          {children}
          <SiteFooter />
        </MotionProvider>
      </body>
```

- [ ] **Step 9: Run the full suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 10: Verify teardown manually in the browser**

Run `npm run dev`, open `/`, then in the DevTools console evaluate `ScrollTrigger.getAll().length` (exposed via `window.ScrollTrigger` after `gsap.registerPlugin`, or read the count from the GSAP devtools). Navigate to `/about` and back via the nav, and re-evaluate.

Expected: the count returns to the same value after a round trip. A growing count means the context is not reverting.

- [ ] **Step 11: Commit**

```bash
git add frontend/lib/motion-env.ts frontend/lib/motion-env.test.ts frontend/components/motion/MotionProvider.tsx frontend/vitest.setup.ts frontend/app/layout.tsx frontend/package.json frontend/package-lock.json
git commit -m "feat(frontend): GSAP context, ScrollSmoother, motion environment gating

One gsap.context() per route, reverted on pathname change so ScrollTriggers
tear down on navigation per spec §6. ScrollSmoother is created only at
1024px and above with reduced motion unset, per §7 and §6 — those decisions
live in lib/motion-env.ts as a pure function so they are exhaustively tested
without fighting jsdom's absent layout."
```

---

### Task 6: Motion primitives

**Files:**
- Create: `frontend/components/motion/Marquee.tsx`
- Create: `frontend/components/motion/MaskReveal.tsx`
- Create: `frontend/components/motion/StaggerReveal.tsx`
- Modify: `frontend/app/globals.css`
- Test: `frontend/components/motion/primitives.test.tsx` (create)

**Interfaces:**
- Consumes: `prefersReducedMotion` from `@/lib/motion-env`.
- Produces:
  - `<Marquee text={string} className?={string} />` — CSS transform loop, halts under reduced motion.
  - `<MaskReveal as?={'h1'|'h2'|'p'} className?={string}>{children}</MaskReveal>` — clip-path wipe on scroll, renders its end state under reduced motion.
  - `<StaggerReveal className?={string} stagger?={number}>{children}</StaggerReveal>` — children rise and fade in sequence, static under reduced motion.

Spec §7 requires marquees to keep running on mobile, so the marquee is a CSS animation rather than a ScrollTrigger — cheap, and unaffected by ScrollSmoother being disabled.

- [ ] **Step 1: Write the failing tests**

```tsx
// frontend/components/motion/primitives.test.tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Marquee } from './Marquee';
import { MaskReveal } from './MaskReveal';
import { StaggerReveal } from './StaggerReveal';

function setReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduce : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe('Marquee', () => {
  beforeEach(() => setReducedMotion(false));

  it('repeats the text enough times to fill a wide viewport', () => {
    render(<Marquee text="KREATE LIVE" />);
    expect(screen.getAllByText('KREATE LIVE').length).toBeGreaterThan(1);
  });

  it('hides the repeated copies from assistive technology', () => {
    const { container } = render(<Marquee text="KREATE LIVE" />);
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('stops moving under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<Marquee text="KREATE LIVE" />);
    const track = container.querySelector('[data-marquee-track]') as HTMLElement;
    expect(track.dataset.animated).toBe('false');
  });
});

describe('MaskReveal', () => {
  it('renders its children as real text so content is never animation-dependent', () => {
    setReducedMotion(false);
    render(<MaskReveal as="h2">WHO WE ARE</MaskReveal>);
    expect(screen.getByRole('heading', { name: 'WHO WE ARE' })).toBeInTheDocument();
  });

  it('renders fully visible under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<MaskReveal as="h2">WHO WE ARE</MaskReveal>);
    const el = container.querySelector('[data-mask-reveal]') as HTMLElement;
    expect(el.dataset.revealed).toBe('true');
  });
});

describe('StaggerReveal', () => {
  it('renders every child', () => {
    setReducedMotion(false);
    render(
      <StaggerReveal>
        <p>THINK</p>
        <p>DESIGN</p>
      </StaggerReveal>
    );
    expect(screen.getByText('THINK')).toBeInTheDocument();
    expect(screen.getByText('DESIGN')).toBeInTheDocument();
  });

  it('renders children in their end state under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(
      <StaggerReveal>
        <p>THINK</p>
      </StaggerReveal>
    );
    const el = container.querySelector('[data-stagger-reveal]') as HTMLElement;
    expect(el.dataset.revealed).toBe('true');
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd frontend && npx vitest run components/motion/primitives.test.tsx`
Expected: FAIL — cannot resolve `./Marquee`.

- [ ] **Step 3: Add the marquee keyframes to `app/globals.css`**

Append:

```css
@keyframes k-marquee {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(-50%, 0, 0); }
}

.k-marquee-track {
  display: flex;
  width: max-content;
  will-change: transform;
  animation: k-marquee 18s linear infinite;
}

.k-marquee-track[data-animated='false'] {
  animation: none;
}
```

- [ ] **Step 4: Implement `Marquee.tsx`**

```tsx
'use client';

import { prefersReducedMotion } from '@/lib/motion-env';

const REPEATS = 8;

export function Marquee({ text, className = '' }: { text: string; className?: string }) {
  const animated = !prefersReducedMotion();

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="k-marquee-track" data-marquee-track data-animated={String(animated)}>
        {Array.from({ length: REPEATS }, (_, i) => (
          <span
            key={i}
            className="font-display shrink-0 px-6 text-[clamp(3rem,10vw,9rem)] leading-none tracking-tight"
            aria-hidden={i > 0 ? 'true' : undefined}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
```

The track holds an even number of copies and translates by exactly `-50%`, so the loop is seamless. Only the first copy is exposed to assistive technology.

- [ ] **Step 5: Implement `MaskReveal.tsx`**

```tsx
'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/motion-env';

gsap.registerPlugin(ScrollTrigger);

export function MaskReveal({
  as: Tag = 'h2',
  className = '',
  children,
}: {
  as?: 'h1' | 'h2' | 'p';
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onComplete: () => setRevealed(true),
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-mask-reveal
      data-revealed={String(revealed)}
      className={className}
    >
      {children}
    </Tag>
  );
}
```

`clipPath` and `opacity` are both compositor properties; neither triggers layout.

- [ ] **Step 6: Implement `StaggerReveal.tsx`**

```tsx
'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/motion-env';

gsap.registerPlugin(ScrollTrigger);

export function StaggerReveal({
  className = '',
  stagger = 0.06,
  children,
}: {
  className?: string;
  stagger?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from(Array.from(el.children), {
        yPercent: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onComplete: () => setRevealed(true),
      });
    }, el);

    return () => ctx.revert();
  }, [stagger]);

  return (
    <div ref={ref} data-stagger-reveal data-revealed={String(revealed)} className={className}>
      {children}
    </div>
  );
}
```

The 0.06s default is spec §6's 60ms manifesto stagger; the client wall passes `stagger={0.04}` for its 40ms interval when individual logo artwork exists.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `cd frontend && npx vitest run components/motion/primitives.test.tsx`
Expected: PASS, 7 tests.

- [ ] **Step 8: Commit**

```bash
git add frontend/components/motion frontend/app/globals.css
git commit -m "feat(frontend): marquee, mask-reveal and stagger-reveal primitives

Three reusable expressions of spec §6's motion vocabulary. Marquee is a CSS
transform loop rather than a ScrollTrigger because §7 requires marquees to
keep running on mobile where ScrollSmoother is off. All three animate only
transform, opacity and clip-path, and all three render their end state
under prefers-reduced-motion so content is never animation-dependent."
```

---

### Task 7: Hero section

**Files:**
- Create: `frontend/components/sections/Hero.tsx`
- Test: `frontend/components/sections/Hero.test.tsx` (create)

**Interfaces:**
- Consumes: `Marquee`, `MaskReveal`, `prefersReducedMotion`.
- Produces: `<Hero />`, consumed by `app/page.tsx` in Task 10.

Spec §8 specifies `<video muted loop playsinline preload="metadata">` with a poster, and omits `autoplay`. That omission is a spec defect, not an instruction: without `autoplay` a decorative loop never starts and the hero is a frozen poster. All three of `muted`, `playsInline`, `autoPlay` are required together for iOS Safari to play inline without a gesture. This task implements all four attributes and the omission is recorded here.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/components/sections/Hero.test.tsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

function setReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduce : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe('Hero (spec §8)', () => {
  it('carries every attribute iOS Safari needs to autoplay inline', () => {
    setReducedMotion(false);
    const { container } = render(<Hero />);
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toBeTruthy();
    expect(video.hasAttribute('muted') || video.muted).toBe(true);
    expect(video.hasAttribute('playsinline')).toBe(true);
    expect(video.hasAttribute('autoplay')).toBe(true);
    expect(video.hasAttribute('loop')).toBe(true);
    expect(video.getAttribute('poster')).toBe('/video/hero-poster.jpg');
    expect(video.getAttribute('preload')).toBe('metadata');
  });

  it('serves 1080p above 768px and 720p below, per spec §8', () => {
    setReducedMotion(false);
    const { container } = render(<Hero />);
    const sources = Array.from(container.querySelectorAll('source'));
    const wide = sources.find((s) => s.getAttribute('media')?.includes('768'));
    expect(wide?.getAttribute('src')).toBe('/video/hero-1080.mp4');
    expect(sources.at(-1)?.getAttribute('src')).toBe('/video/hero-720.mp4');
  });

  it('swaps the video for the reduced-motion still', () => {
    setReducedMotion(true);
    const { container } = render(<Hero />);
    expect(container.querySelector('video')).toBeNull();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/video/hero-still-reduced.jpg');
  });

  it('renders the headline as real text', () => {
    setReducedMotion(false);
    render(<Hero />);
    expect(
      screen.getByRole('heading', { name: /CLEAN IN FORM\. SHARP IN FUNCTION\./i })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npx vitest run components/sections/Hero.test.tsx`
Expected: FAIL — cannot resolve `./Hero`.

- [ ] **Step 3: Implement `Hero.tsx`**

```tsx
'use client';

import { Marquee } from '@/components/motion/Marquee';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { prefersReducedMotion } from '@/lib/motion-env';

export function Hero() {
  const reduced = prefersReducedMotion();

  return (
    <section className="bg-k-black text-k-paper relative min-h-[100svh] overflow-hidden">
      {reduced ? (
        <img
          src="/video/hero-still-reduced.jpg"
          alt="Kreative Studio Lab"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <video
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          poster="/video/hero-poster.jpg"
          aria-label="Kreative Studio Lab showreel"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source media="(min-width: 768px)" src="/video/hero-1080.mp4" type="video/mp4" />
          <source src="/video/hero-720.mp4" type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-x-0 top-1/3 opacity-90">
        <Marquee text="KREATE LIVE" className="text-k-red" />
      </div>

      <div className="relative flex min-h-[100svh] items-end px-4 pb-20 sm:px-8 lg:px-12">
        <MaskReveal as="h1" className="display-type max-w-[16ch]">
          CLEAN IN FORM. SHARP IN FUNCTION.
        </MaskReveal>
      </div>
    </section>
  );
}
```

The marquee sits in red at display scale, which satisfies the "red only at 24px and above on display type" constraint.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend && npx vitest run components/sections/Hero.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/sections/Hero.tsx frontend/components/sections/Hero.test.tsx
git commit -m "feat(frontend): hero with autoplaying video loop and marquee band

Implements spec §8's delivery: MP4 only, 1080p above 768px and 720p below,
muted/loop/playsinline with a poster. Adds autoplay, which §8 omits — without
it a decorative loop never starts, and iOS Safari needs muted, playsinline
and autoplay together to play inline without a gesture. Under reduced motion
the video is replaced by hero-still-reduced.jpg per §6."
```

---

### Task 8: Manifesto and Who We Are sections

**Files:**
- Create: `frontend/components/sections/Manifesto.tsx`
- Create: `frontend/components/sections/WhoWeAre.tsx`
- Test: `frontend/components/sections/Manifesto.test.tsx` (create)
- Test: `frontend/components/sections/WhoWeAre.test.tsx` (create)

**Interfaces:**
- Consumes: `deckImage` from `@/lib/deck`, `MaskReveal`, `StaggerReveal`.
- Produces: `<Manifesto />` and `<WhoWeAre />`, consumed in Task 10.

Deck page 02 carries the manifesto statement as part of the artwork. Its full copy has not been transcribed, so this section renders the page as imagery with the statement as its alt text, plus the one verified line — "WE CREATE LIVE." — as live display text. Do not invent the untranscribed sentences.

- [ ] **Step 1: Write the failing tests**

```tsx
// frontend/components/sections/Manifesto.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Manifesto } from './Manifesto';

describe('Manifesto', () => {
  it('renders deck page 02 at all four widths', () => {
    render(<Manifesto />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/deck/page-02-1920.webp');
    expect(img.getAttribute('srcset')).toContain('/deck/page-02-420.webp 420w');
    expect(img.getAttribute('srcset')).toContain('/deck/page-02-1920.webp 1920w');
  });

  it('renders the verified statement line as live text, not only as image content', () => {
    render(<Manifesto />);
    expect(screen.getByRole('heading', { name: /WE CREATE LIVE\./i })).toBeInTheDocument();
  });

  it('gives the image descriptive alt text', () => {
    render(<Manifesto />);
    expect(screen.getByRole('img').getAttribute('alt')).toMatch(/more than creativity/i);
  });
});
```

```tsx
// frontend/components/sections/WhoWeAre.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhoWeAre } from './WhoWeAre';

describe('WhoWeAre', () => {
  it('renders the four pillars', () => {
    render(<WhoWeAre />);
    for (const word of ['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE']) {
      expect(screen.getByText(word)).toBeInTheDocument();
    }
  });

  it('renders the section heading', () => {
    render(<WhoWeAre />);
    expect(screen.getByRole('heading', { name: 'WHO WE ARE' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd frontend && npx vitest run components/sections`
Expected: FAIL on the two new files — cannot resolve `./Manifesto`.

- [ ] **Step 3: Implement `Manifesto.tsx`**

```tsx
import { deckImage } from '@/lib/deck';
import { MaskReveal } from '@/components/motion/MaskReveal';

// Deck page 02 per content/page-section-mapping.md: the KREATE LIVE halftone marquee
// panel carrying the studio statement. The full statement copy has not been
// transcribed from the deck; it travels as alt text, and the one verified line is
// set as live display type.
const PAGE = 2;

export function Manifesto() {
  const img = deckImage(PAGE);

  return (
    <section className="bg-k-black text-k-paper relative">
      <img
        src={img.src}
        srcSet={img.srcSet}
        sizes="100vw"
        width={img.width}
        height={img.height}
        alt="More than creativity — the Kreative Studio Lab statement: We Create Live."
        className="h-auto w-full"
      />
      <div className="px-4 py-20 sm:px-8 lg:px-12">
        <MaskReveal as="h2" className="display-type">
          WE CREATE <span className="text-k-red">LIVE.</span>
        </MaskReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `WhoWeAre.tsx`**

```tsx
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';

const PILLARS = ['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE'] as const;

export function WhoWeAre() {
  return (
    <section className="bg-k-paper text-k-black">
      <div className="px-4 py-24 sm:px-8 lg:px-12">
        <MaskReveal as="h2" className="display-type">
          WHO WE ARE
        </MaskReveal>
        <StaggerReveal className="mt-12 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
          {PILLARS.map((word) => (
            <div key={word} className="col-span-12 sm:col-span-6 lg:col-span-3">
              <p className="font-display border-k-black border-t-2 pt-4 text-4xl tracking-tight">
                {word}
              </p>
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd frontend && npx vitest run components/sections`
Expected: PASS — the Manifesto and WhoWeAre tests plus Task 7's Hero tests.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/sections/Manifesto.tsx frontend/components/sections/Manifesto.test.tsx frontend/components/sections/WhoWeAre.tsx frontend/components/sections/WhoWeAre.test.tsx
git commit -m "feat(frontend): manifesto and who-we-are sections

Manifesto renders verified deck page 02 responsively with the untranscribed
statement carried as alt text and the one verified line set as live display
type — no invented copy. Who We Are sets the four pillars on a staggered
reveal per spec §6."
```

---

### Task 9: Two Labs and Archive Teaser sections

**Files:**
- Create: `frontend/components/sections/TwoLabs.tsx`
- Create: `frontend/components/sections/ArchiveTeaser.tsx`
- Test: `frontend/components/sections/TwoLabs.test.tsx` (create)
- Test: `frontend/components/sections/ArchiveTeaser.test.tsx` (create)

**Interfaces:**
- Consumes: `deckImage`, `ARCHIVE_OPENER_PAGE` from `@/lib/deck`; `getArchiveProjects` from `@/lib/contract`; `slugify` from `@/lib/slugify`; `MaskReveal`, `StaggerReveal`.
- Produces: `<TwoLabs />` and `<ArchiveTeaser />`, consumed in Task 10.

Spec §6 specifies the Two Labs section as pinned, with two circles converging into the Venn on scrub. Pinning is Stage 5's expensive tail. This task ships the static composition — deck page 04 plus the two lab links — which reads correctly without pinning and is what Stage 5 later animates.

- [ ] **Step 1: Write the failing tests**

```tsx
// frontend/components/sections/TwoLabs.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TwoLabs } from './TwoLabs';

describe('TwoLabs', () => {
  it('renders deck page 04', () => {
    render(<TwoLabs />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/deck/page-04-1920.webp');
  });

  it('links to both lab routes', () => {
    render(<TwoLabs />);
    expect(screen.getByRole('link', { name: /PRODUCT LAB/i })).toHaveAttribute('href', '/product-lab');
    expect(screen.getByRole('link', { name: /CREATIVE LAB/i })).toHaveAttribute('href', '/creative-lab');
  });

  it('renders the verified headline', () => {
    render(<TwoLabs />);
    expect(screen.getByRole('heading', { name: /One Studio\. Two Labs\./i })).toBeInTheDocument();
  });
});
```

```tsx
// frontend/components/sections/ArchiveTeaser.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArchiveTeaser } from './ArchiveTeaser';

describe('ArchiveTeaser', () => {
  it('previews exactly three entries', () => {
    render(<ArchiveTeaser />);
    expect(screen.getAllByTestId('teaser-entry')).toHaveLength(3);
  });

  it('previews 01, 02 and 03 in ascending order', () => {
    render(<ArchiveTeaser />);
    const numbers = screen.getAllByTestId('teaser-no').map((el) => el.textContent);
    expect(numbers).toEqual(['01', '02', '03']);
  });

  it('pairs each entry with its verified opener page image', () => {
    render(<ArchiveTeaser />);
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', '/deck/page-08-1920.webp');
    expect(images[1]).toHaveAttribute('src', '/deck/page-12-1920.webp');
    expect(images[2]).toHaveAttribute('src', '/deck/page-15-1920.webp');
  });

  it('links each entry to its case study', () => {
    render(<ArchiveTeaser />);
    expect(screen.getByRole('link', { name: /Nathan Tjoe A On/i })).toHaveAttribute(
      'href',
      '/archive/n8n-collective'
    );
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd frontend && npx vitest run components/sections`
Expected: FAIL — cannot resolve `./TwoLabs`.

- [ ] **Step 3: Implement `TwoLabs.tsx`**

```tsx
import Link from 'next/link';
import { deckImage } from '@/lib/deck';
import { MaskReveal } from '@/components/motion/MaskReveal';

// Deck page 04 per content/page-section-mapping.md: the two overlapping PRODUCT LAB /
// CREATIVE LAB circles merging into the K-mark.
// Spec §6 specifies this section pinned with the circles converging on scrub. Pinning
// is Stage 5's severable tail; this static composition is what Stage 5 animates.
const PAGE = 4;

export function TwoLabs() {
  const img = deckImage(PAGE);

  return (
    <section className="bg-k-paper text-k-black">
      <div className="px-4 py-24 sm:px-8 lg:px-12">
        <MaskReveal as="h2" className="display-type max-w-[14ch]">
          One Studio. Two Labs.
        </MaskReveal>
        <p className="font-body mt-6 max-w-[48ch] text-lg">
          Different disciplines. One creative ecosystem.
        </p>

        <img
          src={img.src}
          srcSet={img.srcSet}
          sizes="(min-width: 1024px) 60vw, 100vw"
          width={img.width}
          height={img.height}
          alt="Product Lab and Creative Lab as two overlapping circles merging into the studio mark"
          className="mt-12 h-auto w-full"
        />

        <div className="mt-12 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
          <Link
            href="/product-lab"
            className="font-display border-k-black col-span-12 border-t-2 pt-4 text-4xl tracking-tight sm:col-span-6"
          >
            PRODUCT LAB
          </Link>
          <Link
            href="/creative-lab"
            className="font-display border-k-black col-span-12 border-t-2 pt-4 text-4xl tracking-tight sm:col-span-6"
          >
            CREATIVE LAB
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `ArchiveTeaser.tsx`**

```tsx
import Link from 'next/link';
import { getArchiveProjects } from '@/lib/contract';
import { slugify } from '@/lib/slugify';
import { ARCHIVE_OPENER_PAGE, deckImage } from '@/lib/deck';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';

export function ArchiveTeaser() {
  // getArchiveProjects() is sorted ascending by archive_no; the teaser previews 01-03.
  const preview = getArchiveProjects().slice(0, 3);

  return (
    <section className="bg-k-black text-k-paper">
      <div className="px-4 py-24 sm:px-8 lg:px-12">
        <MaskReveal as="h2" className="display-type">
          LAB ARCHIVE
        </MaskReveal>

        <StaggerReveal className="mt-12 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
          {preview.map((project) => {
            const img = deckImage(ARCHIVE_OPENER_PAGE[project.archive_no]);
            return (
              <article
                key={project.archive_no}
                data-testid="teaser-entry"
                className="col-span-12 sm:col-span-4"
              >
                <Link href={`/archive/${slugify(project.title)}`}>
                  <img
                    src={img.src}
                    srcSet={img.srcSet}
                    sizes="(min-width: 640px) 33vw, 100vw"
                    width={img.width}
                    height={img.height}
                    alt={`${project.client} — ${project.industry}`}
                    className="h-auto w-full"
                  />
                  <p
                    data-testid="teaser-no"
                    className="font-display text-k-red mt-4 text-3xl tracking-tight"
                  >
                    {project.archive_no}
                  </p>
                  <p className="font-body mt-1 text-xl">{project.client}</p>
                  <p className="font-body mt-1 text-sm">{project.industry}</p>
                </Link>
              </article>
            );
          })}
        </StaggerReveal>

        <Link
          href="/archive"
          className="font-body mt-16 inline-block text-xs tracking-widest uppercase"
        >
          View all six
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd frontend && npx vitest run components/sections`
Expected: PASS, all section tests.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/sections/TwoLabs.tsx frontend/components/sections/TwoLabs.test.tsx frontend/components/sections/ArchiveTeaser.tsx frontend/components/sections/ArchiveTeaser.test.tsx
git commit -m "feat(frontend): two-labs and archive-teaser sections

Two Labs ships the static composition of deck page 04 plus both lab links;
spec §6's pinned circle convergence is Stage 5's severable tail and will
animate this same markup. Archive Teaser pairs entries 01-03 with their
verified opener pages (08, 12, 15) from the page-to-section mapping."
```

---

### Task 10: Client wall, closing, and homepage assembly

**Files:**
- Create: `frontend/components/sections/ClientWall.tsx`
- Create: `frontend/components/sections/Closing.tsx`
- Modify: `frontend/app/page.tsx`
- Modify: `frontend/app/page.test.tsx`
- Modify: `frontend/app/globals.css`
- Test: `frontend/components/sections/ClientWall.test.tsx` (create)

**Interfaces:**
- Consumes: every section component from Tasks 7-9, plus `getClientLogos` and `deckImage`.
- Produces: the assembled homepage.

**Known deviation from spec §6.** §6 specifies the client wall as "logo grid, opacity stagger on a 40ms interval." Individual logo files do not exist — deck page 24 is a single raster containing all 25 marks, and the fixture's `client_logo` entries carry null image URLs. A per-logo stagger is therefore impossible without artwork that has not been supplied. This task renders page 24 as one image with a single reveal, and keeps the fixture logo names in a visually-hidden list so the names remain available to search engines and screen readers. When individual logo artwork is supplied, this component becomes the grid §6 describes.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/components/sections/ClientWall.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientWall } from './ClientWall';
import { getClientLogos } from '@/lib/contract';

describe('ClientWall', () => {
  it('renders deck page 24 as the logo wall', () => {
    render(<ClientWall />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/deck/page-24-1920.webp');
  });

  it('keeps every fixture logo name in the accessibility tree', () => {
    render(<ClientWall />);
    for (const logo of getClientLogos()) {
      expect(screen.getByText(logo.name)).toBeInTheDocument();
    }
  });

  it('renders the section heading', () => {
    render(<ClientWall />);
    expect(screen.getByRole('heading', { name: /OUR CLIENT/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npx vitest run components/sections/ClientWall.test.tsx`
Expected: FAIL — cannot resolve `./ClientWall`.

- [ ] **Step 3: Add the visually-hidden utility to `app/globals.css`**

Append:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}
```

- [ ] **Step 4: Implement `ClientWall.tsx`**

```tsx
import { getClientLogos } from '@/lib/contract';
import { deckImage } from '@/lib/deck';
import { MaskReveal } from '@/components/motion/MaskReveal';

// Deck page 24 per content/page-section-mapping.md: the OUR CLIENT wall, a single
// raster carrying all 25 marks.
//
// Deviation from spec §6, which specifies "logo grid, opacity stagger on a 40ms
// interval": individual logo artwork does not exist. The fixture's client_logo entries
// carry null image URLs and the deck supplies only this composite. A per-logo stagger
// is impossible without that artwork, so this renders one image with a single reveal
// and keeps the names in the accessibility tree. When individual marks are supplied,
// this becomes the grid §6 describes.
const PAGE = 24;

export function ClientWall() {
  const img = deckImage(PAGE);
  const logos = getClientLogos();

  return (
    <section className="bg-k-paper text-k-black">
      <div className="px-4 py-24 sm:px-8 lg:px-12">
        <MaskReveal as="h2" className="display-type">
          OUR CLIENT
        </MaskReveal>

        <img
          src={img.src}
          srcSet={img.srcSet}
          sizes="100vw"
          width={img.width}
          height={img.height}
          alt={`Client wall: ${logos.map((l) => l.name).join(', ')}`}
          className="mt-12 h-auto w-full"
        />

        <ul className="sr-only">
          {logos.map((logo) => (
            <li key={logo.name}>{logo.name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Implement `Closing.tsx`**

```tsx
import Link from 'next/link';
import { MaskReveal } from '@/components/motion/MaskReveal';

export function Closing() {
  return (
    <section className="bg-k-black text-k-paper">
      <div className="flex min-h-[80svh] flex-col justify-center px-4 py-24 sm:px-8 lg:px-12">
        <MaskReveal as="p" className="display-type">
          LET&apos;S <span className="text-k-red">CREATE</span> SOMETHING THAT{' '}
          <span className="text-k-red">LIVES.</span>
        </MaskReveal>
        <Link
          href="/contact"
          className="font-body mt-12 inline-block self-start text-xs tracking-widest uppercase"
        >
          Start a project
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Assemble `app/page.tsx`**

```tsx
import { Hero } from '@/components/sections/Hero';
import { Manifesto } from '@/components/sections/Manifesto';
import { WhoWeAre } from '@/components/sections/WhoWeAre';
import { TwoLabs } from '@/components/sections/TwoLabs';
import { ArchiveTeaser } from '@/components/sections/ArchiveTeaser';
import { ClientWall } from '@/components/sections/ClientWall';
import { Closing } from '@/components/sections/Closing';

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <WhoWeAre />
      <TwoLabs />
      <ArchiveTeaser />
      <ClientWall />
      <Closing />
    </main>
  );
}
```

This is spec §4's section order for `/` exactly: hero, manifesto, who we are, two labs, archive teaser, client wall, closing.

- [ ] **Step 7: Rewrite `app/page.test.tsx` for the assembled page**

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

afterEach(() => vi.unstubAllGlobals());

describe('/ (spec §4 section order)', () => {
  it('renders all seven sections', () => {
    const { container } = render(<Home />);
    expect(container.querySelectorAll('section')).toHaveLength(7);
  });

  it('leads with the hero headline', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: /CLEAN IN FORM\. SHARP IN FUNCTION\./i, level: 1 })
    ).toBeInTheDocument();
  });

  it('previews three archive entries and links to the full index', () => {
    render(<Home />);
    expect(screen.getAllByTestId('teaser-entry')).toHaveLength(3);
    expect(screen.getByRole('link', { name: /View all six/i })).toHaveAttribute('href', '/archive');
  });

  it('closes with the call to action', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /Start a project/i })).toHaveAttribute('href', '/contact');
  });
});
```

- [ ] **Step 8: Run the full suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 9: Build and verify**

Run: `cd frontend && npm run build`
Expected: a clean build with no errors. The Google Fonts failures from Stage 2 must be gone — Task 1 removed that dependency.

- [ ] **Step 10: Verify in the browser**

Run `npm run dev` and check, at desktop width and at 390px:
- The hero video autoplays and loops; the KREATE LIVE marquee scrolls.
- Every deck image loads — open DevTools Network, filter to `webp`, and confirm zero 404s.
- Headlines render in Anton, not a system sans.
- Scroll reveals fire once per section as they enter.
- At 390px, scrolling keeps native momentum and nothing is pinned.
- With "Reduce motion" enabled in the OS, the hero shows the still image and the marquee does not move.

- [ ] **Step 11: Commit**

```bash
git add frontend/components/sections frontend/app/page.tsx frontend/app/page.test.tsx frontend/app/globals.css
git commit -m "feat(frontend): client wall, closing, and homepage assembly

Assembles the seven sections in spec §4's order for /. Client wall renders
deck page 24 as a single reveal rather than §6's per-logo 40ms stagger,
because individual logo artwork does not exist — the fixture carries null
image URLs and the deck supplies only the composite. Logo names are kept in
a visually-hidden list so they stay available to search and assistive tech;
the component becomes §6's grid once artwork is supplied."
```

---

## Stage 3 exit criteria

- `npm test` green, `npx tsc --noEmit` clean, `npm run build` succeeds with no errors.
- `npx playwright test` passes, including zero console errors on `/`.
- Headlines render in Anton with no network request to any Google domain.
- Zero 404s in the Network panel on `/`.
- The hero autoplays on desktop Chrome and on an iOS device or simulator.
- At 390px, scrolling retains native momentum and nothing is pinned.
- With OS "Reduce motion" on, the hero is a still image, marquees are static, and every section is legible.
- `ScrollTrigger.getAll().length` returns to its starting value after navigating `/` → `/about` → `/`. A growing count means the per-route context is not reverting, which breaks scroll on the second visit. This is verified in the browser because ScrollTrigger cannot be meaningfully exercised in jsdom, where there is no layout.

## Deferred to Stage 4

The other six routes, composed from these primitives and the remaining deck pages per `content/page-section-mapping.md`.

## Deferred to Stage 5

Pinned Two Labs circle convergence (§6), pinned case-study spread (§6), mobile pin-to-stack conversion (§7), the performance budget pass (§10), and the accessibility pass (§11).

## Open items carried forward

- `site_setting` in the frozen fixture has empty contact fields, while deck page 26 shows two phone numbers and an email. Populating the singleton is a content-layer task; the footer degrades cleanly until then.
- Deck page 07 remains unassigned to any section, per the mapping document's note. It is not used on the homepage.
- Individual client logo artwork does not exist, which is what forces the Task 10 deviation.
- Spec §14's open questions are unchanged: exact brand red, the Nippon Paint mark absent from the seed list, hosting target, deck spelling corrections, and vector artwork for the crossed-K mark.
