# Stage 4 — Route Fan-Out

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the remaining six routes to the same visual and motion fidelity the homepage reached in Stage 3, composed from Stage 3's primitives and the verified deck imagery.

**Architecture:** Nothing new is invented. Stage 3 built the vocabulary — `MaskReveal`, `StaggerReveal`, `Marquee`, `deckImage`, `.section-shell`, the header/footer chrome, and the per-route GSAP context. Stage 4 adds three shared pieces (a deck figure, a capability list, a case-study composition), extends `lib/deck.ts` with the remaining page constants, and replaces six Stage 2 stub routes whose placeholder copy was invented. The deck copy for `/about`, `/product-lab` and `/creative-lab` was transcribed from `assets/web/page-03|05|06-1920.webp` on 2026-09-19 and is reproduced verbatim in the tasks below, so those three routes ship live text rather than alt text.

**Tech Stack:** Next.js 16.3.5 (App Router, Turbopack), React 19, Tailwind CSS v4, `gsap@3.15.0` (ScrollTrigger + ScrollSmoother), `@fontsource/anton@5.3.0`, `@fontsource-variable/archivo@5.3.0`, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-18-kreative-studio-lab-design.md` — read §4 (routes), §5 (tokens), §6 (motion), §7 (mobile), §9 (images), §11 (accessibility), §13 (staging, as amended 2026-09-19).

**Branch:** branch `stage4-route-fan-out` from `master`. Stage 3 merged at `c1b1e91`.

**Mapping source of truth:** `frontend/content/page-section-mapping.md` — verified page-to-section assignments. Do not re-derive them.

## Global Constraints

Copied verbatim from the spec. Every task's requirements implicitly include this section.

- Three colours only: `--k-red: #F81010`, `--k-black: #000000`, `--k-paper: #FFFFFF`. No CSS greys — greys are image content only. **An alpha-composited black (`text-k-black/60`) is a grey.** Two Stage 2 stubs carry one each; the tasks that rewrite those files remove them.
- Red is restricted to display type at 24px or larger. Never body text, never labels.
- `font-display: swap`, both faces self-hosted as woff2, preloaded. **No Google Fonts network request.**
- Display type is flush-left, `letter-spacing: -0.02em`, `clamp(3rem, 12vw, 11rem)` for section openers.
- 12-column grid. Gutter 16px mobile, 32px from 768px, 48px from 1280px, max content width 1680px — all of which `.section-shell` already applies. Every section's inner container uses it; no route hand-rolls `px-4 sm:px-8 lg:px-12`.
- `100vh` is never used. `100svh` or `100dvh` only.
- Motion animates `transform` and `opacity` only (plus the `clip-path` §6 prescribes by name). No layout-triggering property inside a scroll handler.
- All ScrollTriggers registered through a GSAP context that reverts on unmount, so they tear down on navigation.
- ScrollSmoother is disabled below 1024px. No pinning below 1024px. No pinning at all in Stage 4 — §6's pinned case-study spread is Stage 5's severable tail.
- `prefers-reduced-motion: reduce` replaces every scrub with its static end-state and stops all marquees. The site must be fully legible and navigable in this state. Components decide this through `useMotionPreference()`, never through a render-time `matchMedia` read — a render-time read resolves to "motion allowed" during the static prerender and ships the motion branch to everyone.
- Every image below the fold is lazy (`loading="lazy" decoding="async"`).
- No contact form in v1 (spec §4).

## Review Focus

Five failure modes the spec implies that no task's happy path exercises. Each line's test is assigned to the task that owns the code.

1. **A slug that does not exist** — `/archive/not-a-real-project` must render the 404, not throw on an `undefined.archive_no`. `generateStaticParams` prerenders six paths; anything else must be handled rather than crash. Tested in Task 8.
2. **A project with no gallery mapping** — a seventh `archive_project` added to the fixture with no entry in `ARCHIVE_GALLERY_PAGES` must fail loudly at build time, not render a case study with a missing gallery. This is the Stage 2 failure class that `lib/deck.ts` exists to prevent, extended to the new map. Tested in Task 1.
3. **Reduced motion on the capability keyline** — the new red keyline wipe must render its static end state, like every other primitive. A new motion primitive is the likeliest place for the Stage 3 Critical to recur. Tested in Task 3.
4. **Empty fixture fields** — `scope` is `[]` on all six projects and every `site_setting` field is `""`. No route may print an empty list container, a bare separator, or the string "undefined". Tested in Tasks 8 and 9.
5. **The three-colour constraint under rewrite** — the two Stage 2 stubs being replaced each carry a `text-k-black/60`, which composites to grey. The replacements must carry none, and nothing may reintroduce one. Tested in Task 10.

## Content gaps carried forward

Neither is resolved here; both are content-layer tasks, and Stage 4 degrades cleanly without them.

- **`scope` is `[]` for all six archive projects**, while every case-study opener page in the deck shows a "SCOPE OF WORK" list. The opener page image carries that list visually; no case study renders a live scope list until the CPT is populated.
- **`site_setting` is empty on every field**, while deck page 26 shows two phone numbers and an email. `/contact` renders page 26 as the visual and sets the three verified values as live `tel:`/`mailto:` links from a cited constant — the footer continues to read the fixture and render nothing.

---

### Task 1: Deck page constants for the remaining routes

**Files:**
- Modify: `frontend/lib/deck.ts`
- Modify: `frontend/lib/deck.test.ts`
- Modify: `frontend/content/page-section-mapping.md`

**Interfaces:**
- Consumes: `deckImage`, `deckSrc`, `ARCHIVE_OPENER_PAGE` from `@/lib/deck` (Stage 3); `getArchiveProjects` from `@/lib/contract`.
- Produces:
  - `ABOUT_PAGE: number` (3)
  - `PRODUCT_LAB_PAGE: number` (5)
  - `CREATIVE_LAB_PAGE: number` (6)
  - `PROCESS_STATEMENT_PAGE: number` (7)
  - `CONTACT_PAGE: number` (26)
  - `ARCHIVE_GALLERY_PAGES: Readonly<Record<string, readonly number[]>>`
  - `archiveGalleryPages(archiveNo: string): readonly number[]` — throws if the archive number has no mapping.

Page 07 is assigned here for the first time. `content/page-section-mapping.md` records it as ambiguous and explicitly declines to assign it; the studio's call on 2026-09-19 was to use it as the `/archive` index opener, which is the one route in spec §4 with no source page of its own. The mapping document is updated in the same commit so the two do not drift.

- [ ] **Step 1: Write the failing test**

Append to `frontend/lib/deck.test.ts`, and add `getArchiveProjects` to the file's imports from `./contract` if it is not already imported:

```ts
import {
  ABOUT_PAGE,
  PRODUCT_LAB_PAGE,
  CREATIVE_LAB_PAGE,
  PROCESS_STATEMENT_PAGE,
  CONTACT_PAGE,
  ARCHIVE_GALLERY_PAGES,
  archiveGalleryPages,
} from './deck';
import { getArchiveProjects } from './contract';

describe('route page constants (content/page-section-mapping.md)', () => {
  it('names the verified page for each single-page route', () => {
    expect(ABOUT_PAGE).toBe(3);
    expect(PRODUCT_LAB_PAGE).toBe(5);
    expect(CREATIVE_LAB_PAGE).toBe(6);
    expect(PROCESS_STATEMENT_PAGE).toBe(7);
    expect(CONTACT_PAGE).toBe(26);
  });

  it('maps every case study to its verified gallery pages', () => {
    expect(ARCHIVE_GALLERY_PAGES).toEqual({
      '01': [9, 10, 11],
      '02': [13, 14],
      '03': [16],
      '04': [18],
      '05': [20, 21],
      '06': [23],
    });
  });

  it('covers every project the fixture carries, so a new one cannot ship unmapped', () => {
    for (const project of getArchiveProjects()) {
      expect(archiveGalleryPages(project.archive_no).length).toBeGreaterThan(0);
    }
  });

  it('throws rather than returning empty for an unmapped archive number', () => {
    expect(() => archiveGalleryPages('07')).toThrow(/no gallery mapping/i);
  });

  it('emits a resolvable path for every gallery page', () => {
    for (const pages of Object.values(ARCHIVE_GALLERY_PAGES)) {
      for (const page of pages) {
        expect(deckImage(page).src).toMatch(/^\/deck\/page-\d{2}-1920\.webp$/);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npx vitest run lib/deck.test.ts`
Expected: FAIL — `ABOUT_PAGE` is not exported from `./deck`.

- [ ] **Step 3: Implement the constants in `lib/deck.ts`**

Append, below the existing `ARCHIVE_OPENER_PAGE`:

```ts
// Single-page routes, verified in frontend/content/page-section-mapping.md.
export const ABOUT_PAGE = 3;
export const PRODUCT_LAB_PAGE = 5;
export const CREATIVE_LAB_PAGE = 6;
export const CONTACT_PAGE = 26;

// Page 07 ("Every great outcome starts with a thoughtful process.") is recorded as
// ambiguous in the mapping document, which declined to assign it. Assigned here by the
// studio's call of 2026-09-19 as the /archive index opener — /archive is the only route
// in spec §4 with no deck page of its own, and page 07 sits immediately before the first
// case study in the deck. The mapping document's page 07 row is updated to match.
export const PROCESS_STATEMENT_PAGE = 7;

// Each case study's gallery pages, in deck order, verified in the mapping document.
export const ARCHIVE_GALLERY_PAGES: Readonly<Record<string, readonly number[]>> =
  Object.freeze({
    '01': Object.freeze([9, 10, 11]),
    '02': Object.freeze([13, 14]),
    '03': Object.freeze([16]),
    '04': Object.freeze([18]),
    '05': Object.freeze([20, 21]),
    '06': Object.freeze([23]),
  });

export function archiveGalleryPages(archiveNo: string): readonly number[] {
  const pages = ARCHIVE_GALLERY_PAGES[archiveNo];
  if (!pages) {
    throw new RangeError(
      `no gallery mapping for archive_no ${archiveNo} — add it to ARCHIVE_GALLERY_PAGES ` +
        `in lib/deck.ts, verified against content/page-section-mapping.md`
    );
  }
  // Not decoration: this runs assertPage over every mapped page at call time, so a
  // typo'd page number throws during the static render rather than 404ing into a
  // blank gallery at runtime — the Stage 2 failure this module exists to prevent.
  pages.forEach((page) => deckSrc(page, 1920));
  return pages;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend && npx vitest run lib/deck.test.ts`
Expected: PASS.

- [ ] **Step 5: Update the mapping document's page 07 row**

In `frontend/content/page-section-mapping.md`, change the page 07 table row's Route cell from `ambiguous — needs studio confirmation` to `/archive` and its Section cell to `index opener`. Replace the "Page 07 is genuinely ambiguous" bullet in the Notes section with:

```markdown
- **Page 07 was ambiguous and was assigned by decision, not by evidence.** It is a
  standalone statement ("Every great outcome starts with a thoughtful process.") that no
  spec §4 route and no spec §6 motion section names. On 2026-09-19 the studio assigned it
  as the `/archive` index opener, because `/archive` is the only route in §4 with no deck
  page of its own and page 07 sits immediately before the first case study in the deck.
  Recorded here as a decision so a later reader does not mistake it for a verified match.
```

- [ ] **Step 6: Run the whole suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all tests pass, no type errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/lib/deck.ts frontend/lib/deck.test.ts frontend/content/page-section-mapping.md
git commit -m "feat(frontend): deck page constants for the remaining six routes

Extends lib/deck.ts with the single-page route constants and the per-case-study
gallery map, both validated through the same assertPage gate that catches a bad
page number at build time rather than at runtime. Assigns deck page 07 to the
/archive index — the mapping document recorded it as ambiguous and declined to
assign it, so the mapping document is updated in the same commit to record that
this was a decision rather than a verified match."
```

---

### Task 2: Shared deck figure

**Files:**
- Create: `frontend/components/media/DeckFigure.tsx`
- Create: `frontend/components/media/DeckFigure.test.tsx`
- Modify: `frontend/components/sections/Manifesto.tsx`
- Modify: `frontend/components/sections/TwoLabs.tsx`
- Modify: `frontend/components/sections/ArchiveTeaser.tsx`
- Modify: `frontend/components/sections/ClientWall.tsx`

**Interfaces:**
- Consumes: `deckImage` from `@/lib/deck`.
- Produces: `<DeckFigure page={number} alt={string} sizes?={string} className?={string} priority?={boolean} />`.

Six routes would otherwise repeat the same seven-attribute `<img>`. Worse, the Stage 3 review found the repetition carried a defect: an image whose `alt` duplicates visible text immediately beside it makes a screen reader announce the same words twice, and inside a link it bloats the link's accessible name. `DeckFigure` takes `alt` explicitly with no default, so each caller states which case it is.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/components/media/DeckFigure.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DeckFigure } from './DeckFigure';

describe('DeckFigure', () => {
  it('renders the deck page responsively at all four widths', () => {
    const { container } = render(<DeckFigure page={5} alt="Product Lab capabilities" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/deck/page-05-1920.webp');
    expect(img.getAttribute('srcset')).toContain('/deck/page-05-420.webp 420w');
    expect(img.getAttribute('srcset')).toContain('/deck/page-05-1920.webp 1920w');
  });

  it('carries the intrinsic dimensions so nothing reflows on decode', () => {
    const { container } = render(<DeckFigure page={5} alt="Product Lab capabilities" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('width')).toBe('1920');
    expect(img.getAttribute('height')).toBe('1358');
  });

  it('lazy-loads by default, per spec §10', () => {
    const { container } = render(<DeckFigure page={5} alt="Product Lab capabilities" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
  });

  it('loads eagerly at high priority when it is the route opener', () => {
    const { container } = render(<DeckFigure page={3} alt="Who we are" priority />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('fetchpriority')).toBe('high');
  });

  it('accepts an empty alt for an image whose content is already visible text', () => {
    const { container } = render(<DeckFigure page={9} alt="" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('alt')).toBe('');
  });

  it('throws on a page number outside the deck', () => {
    expect(() => render(<DeckFigure page={99} alt="nope" />)).toThrow(/1\.\.26/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npx vitest run components/media/DeckFigure.test.tsx`
Expected: FAIL — cannot resolve `./DeckFigure`.

- [ ] **Step 3: Implement `DeckFigure.tsx`**

```tsx
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
```

- [ ] **Step 4: Run it to verify it passes**

Run: `cd frontend && npx vitest run components/media/DeckFigure.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 5: Adopt it in the four homepage sections that hand-roll the same img**

In `Manifesto.tsx`, `TwoLabs.tsx`, `ArchiveTeaser.tsx` and `ClientWall.tsx`, delete the `const img = deckImage(PAGE);` line and replace the inline `<img …>` with `<DeckFigure … />`, keeping each existing `sizes` value, `className` and `alt` text. Two exceptions:

- `ArchiveTeaser.tsx` — the image sits inside a link whose visible text already states the client and the industry, so its alt becomes `""`. That is the Stage 3 review's M5, fixed here because this task rewrites the line.
- `Manifesto.tsx` — its figure is the first thing below the hero, so it keeps its descriptive alt (the statement copy is untranscribed and travels there) and gains nothing else.

- [ ] **Step 6: Run the whole suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all pass. `components/sections/images.test.tsx` passes unchanged — it asserts on rendered attributes, which are identical.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/media frontend/components/sections
git commit -m "feat(frontend): shared DeckFigure for every deck derivative

One component owns the seven-attribute deck <img>, including the lazy/async
defaults spec §10 requires and an eager high-priority mode for a route opener.
alt is required with no default so each caller states whether the image carries
content or repeats text already on the page — which fixes the archive teaser's
duplicated accessible name found in the Stage 3 review."
```

---

### Task 3: Capability list with the red keyline wipe

**Files:**
- Create: `frontend/components/sections/CapabilityList.tsx`
- Create: `frontend/components/sections/CapabilityList.test.tsx`
- Modify: `frontend/app/globals.css`

**Interfaces:**
- Consumes: `useMotionPreference` from `@/lib/use-motion-preference`; `gsap`, `gsap/ScrollTrigger`.
- Produces: `export interface CapabilityGroup { name: string; items: readonly string[] }` and `<CapabilityList groups={readonly CapabilityGroup[]} />`.

Spec §6: "Lab capability lists — reveal per line, red keyline wipe left to right." One component serves both labs: Product Lab's list is four named groups with items under each; Creative Lab's is a flat list of twelve, expressed as a single group whose `name` is `''`.

The keyline is a `::after` pseudo-element scaled on the X axis — `transform` only. A pseudo-element cannot be targeted from JavaScript, so GSAP animates the items and the CSS rule keyed on `data-revealed` drives the keyline through a transition. Under anything but a resolved `'full'` preference, including the server render, it starts at its end state.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/components/sections/CapabilityList.test.tsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { CapabilityList } from './CapabilityList';

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

const GROUPS = [
  { name: 'Print & Packaging', items: ['Packaging Design & Production', 'Premium Gift Sets'] },
  { name: 'Brand Products', items: ['Brand Merchandise'] },
];

describe('CapabilityList (spec §6)', () => {
  it('renders every group name and every item', () => {
    setReducedMotion(false);
    render(<CapabilityList groups={GROUPS} />);
    expect(screen.getByText('Print & Packaging')).toBeInTheDocument();
    expect(screen.getByText('Packaging Design & Production')).toBeInTheDocument();
    expect(screen.getByText('Premium Gift Sets')).toBeInTheDocument();
    expect(screen.getByText('Brand Merchandise')).toBeInTheDocument();
  });

  it('renders a flat list when the single group has no name', () => {
    setReducedMotion(false);
    const { container } = render(
      <CapabilityList groups={[{ name: '', items: ['Creative Direction', 'Brand Film'] }]} />
    );
    expect(screen.getByText('Creative Direction')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-capability-group-name]')).toHaveLength(0);
  });

  it('renders the keyline at its end state under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<CapabilityList groups={GROUPS} />);
    const list = container.querySelector('[data-capability-list]') as HTMLElement;
    expect(list.dataset.revealed).toBe('true');
  });

  it('renders every item as real text under reduced motion', () => {
    setReducedMotion(true);
    render(<CapabilityList groups={GROUPS} />);
    expect(screen.getByText('Packaging Design & Production')).toBeInTheDocument();
  });

  it('leaves no live tweens behind when it unmounts', () => {
    setReducedMotion(false);
    const baseline = gsap.globalTimeline.getChildren().length;
    const { unmount } = render(<CapabilityList groups={GROUPS} />);
    unmount();
    expect(gsap.globalTimeline.getChildren().length).toBe(baseline);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npx vitest run components/sections/CapabilityList.test.tsx`
Expected: FAIL — cannot resolve `./CapabilityList`.

- [ ] **Step 3: Add the keyline CSS to `app/globals.css`**

Append:

```css
/* Spec §6: capability lists reveal per line with a red keyline wiping left to right.
   The keyline is a scaled pseudo-element rather than an animated width, so it stays on
   the compositor. A pseudo-element cannot be targeted from JS, so the component flips
   data-revealed and this transition carries the wipe. */
.k-keyline {
  position: relative;
  padding-top: 0.75rem;
}

.k-keyline::after {
  content: '';
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  height: 2px;
  background: var(--k-red);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

[data-capability-list][data-revealed='true'] .k-keyline::after {
  transform: scaleX(1);
}

@media (prefers-reduced-motion: reduce) {
  .k-keyline::after {
    transition: none;
  }
}
```

- [ ] **Step 4: Implement `CapabilityList.tsx`**

```tsx
'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/lib/use-motion-preference';

gsap.registerPlugin(ScrollTrigger);

export interface CapabilityGroup {
  name: string;
  items: readonly string[];
}

export function CapabilityList({ groups }: { groups: readonly CapabilityGroup[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const preference = useMotionPreference();
  const [revealed, setRevealed] = useState(false);

  useLayoutEffect(() => {
    // 'unknown' is the server render and the first client render; 'reduced' is the
    // stated preference. Both render the end state, so the list is never
    // animation-dependent and the two renders agree.
    if (preference !== 'full') {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const items = el.querySelectorAll('[data-capability-item]');
    if (items.length === 0) {
      setRevealed(true);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(Array.from(items), {
        yPercent: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.04,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        // onStart, not onComplete: the keyline wipes in as the lines rise, which is
        // what "reveal per line, red keyline wipe left to right" describes.
        onStart: () => setRevealed(true),
      });
    }, el);

    return () => ctx.revert();
  }, [preference]);

  return (
    <div ref={ref} data-capability-list data-revealed={String(revealed)}>
      {groups.map((group, index) => (
        <div key={group.name || `group-${index}`} className="k-keyline mt-10">
          {group.name ? (
            <p data-capability-group-name className="font-display text-2xl tracking-tight">
              {group.name}
            </p>
          ) : null}
          <ul className={group.name ? 'mt-2' : ''}>
            {group.items.map((item) => (
              <li key={item} data-capability-item className="font-body text-lg">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `cd frontend && npx vitest run components/sections/CapabilityList.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 6: Run the whole suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/sections/CapabilityList.tsx frontend/components/sections/CapabilityList.test.tsx frontend/app/globals.css
git commit -m "feat(frontend): capability list with the red keyline wipe

Spec §6's 'reveal per line, red keyline wipe left to right', serving both labs:
Product Lab's four named groups and Creative Lab's flat twelve, the latter as a
single unnamed group. The keyline is a scaled pseudo-element rather than an
animated width, so it stays on the compositor, and it renders at its end state
whenever the motion preference is anything but 'full' — which includes the
server render, so the list is never animation-dependent."
```

---

### Task 4: `/about`

**Files:**
- Modify: `frontend/app/about/page.tsx`
- Modify: `frontend/app/about/page.test.tsx`

**Interfaces:**
- Consumes: `DeckFigure`, `MaskReveal`, `StaggerReveal`, `ABOUT_PAGE`.
- Produces: nothing later tasks depend on.

The Stage 2 stub invents its body copy ("Kreative Studio Lab is a creative production studio. Clean in form. Sharp in function."). Deck page 03's copy was transcribed on 2026-09-19 and is reproduced verbatim below; the invented line is deleted, not edited.

Page 03 sets "WHO WE ARE" in red at display scale, which satisfies the red-on-display-type-only constraint. The four pillars are photographic cards in the deck, and that card imagery is part of page 03's single raster — so the pillars render as display type and the page carries the images, rather than four separate files that do not exist.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/app/about/page.test.tsx — replaces the Stage 2 file
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from './page';

describe('/about (spec §4)', () => {
  it('leads with the WHO WE ARE headline', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: 'WHO WE ARE', level: 1 })).toBeInTheDocument();
  });

  it('renders the studio description transcribed from deck page 03, not invented copy', () => {
    render(<About />);
    expect(
      screen.getByText(/specializing in Product Development and Creative Production/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/We don't separate creativity from production/i)).toBeInTheDocument();
    expect(screen.queryByText(/Clean in form\. Sharp in function\./i)).not.toBeInTheDocument();
  });

  it('renders the four pillars', () => {
    render(<About />);
    for (const word of ['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE']) {
      expect(screen.getByText(word)).toBeInTheDocument();
    }
  });

  it('renders deck page 03 as the route opener', () => {
    const { container } = render(<About />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/deck/page-03-1920.webp');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npx vitest run app/about`
Expected: FAIL — the invented "Clean in form. Sharp in function." line is still rendered and the transcribed copy is absent.

- [ ] **Step 3: Implement `app/about/page.tsx`**

```tsx
import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { ABOUT_PAGE } from '@/lib/deck';

// Transcribed verbatim from assets/web/page-03-1920.webp on 2026-09-19. Do not
// paraphrase: spec §3 treats deck copy as the studio's own words.
const PARAGRAPHS = [
  'KREATIVE STUDIO LAB is a Creative Production Studio specializing in Product Development and Creative Production.',
  'We collaborate with brands, corporations, organizations, and communities to develop products, visual content, and brand experiences that create meaningful connections. By combining strategic thinking, creative exploration, and production expertise, we transform ideas into tangible experiences from the first concept to the final execution.',
  "We don't separate creativity from production. We believe they belong together.",
] as const;

const PILLARS = ['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE'] as const;

export default function About() {
  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell py-24">
          <MaskReveal as="h1" className="display-type text-k-red">
            WHO WE ARE
          </MaskReveal>

          <div className="mt-12 max-w-[60ch]">
            {PARAGRAPHS.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="font-body mt-6 text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* alt="": every word page 03 carries — the headline, all three paragraphs and
              the four pillar labels — is live text directly above and below it. A
              description would announce the same copy a second time. */}
          <DeckFigure
            page={ABOUT_PAGE}
            alt=""
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="mt-16"
            priority
          />

          <StaggerReveal className="mt-16 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
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
    </main>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `cd frontend && npx vitest run app/about`
Expected: PASS, 4 tests.

- [ ] **Step 5: Run the whole suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/about
git commit -m "feat(frontend): /about from deck page 03

Replaces the Stage 2 stub's invented description with the copy transcribed from
deck page 03 — three paragraphs, verbatim — plus the four pillars on a staggered
reveal and the page itself as the route opener. The figure takes an empty alt
because every word it contains is on the page as live text."
```

---

### Task 5: `/product-lab`

**Files:**
- Modify: `frontend/app/product-lab/page.tsx`
- Create: `frontend/app/product-lab/page.test.tsx`

**Interfaces:**
- Consumes: `DeckFigure`, `MaskReveal`, `CapabilityList`, `CapabilityGroup`, `PRODUCT_LAB_PAGE`.
- Produces: nothing later tasks depend on.

Transcribed from `assets/web/page-05-1920.webp` on 2026-09-19. The capability list is nested — four named groups holding twelve items — where `content/page-section-mapping.md` recorded only the group names.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/app/product-lab/page.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductLab from './page';

const ITEMS = [
  'Packaging Design & Production',
  'Premium Gift Sets',
  'Printing Production',
  'Publications',
  'Brand Merchandise',
  'Corporate Merchandise',
  'Event Merchandise',
  'Apparel Development',
  'Uniform Development',
  'Retail Display',
  'Exhibition Production',
  'Custom Product Development',
];

describe('/product-lab (spec §4)', () => {
  it('leads with the headline and the positioning line', () => {
    render(<ProductLab />);
    expect(screen.getByRole('heading', { name: /PRODUCT LAB/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Where Ideas Become Products\./i)).toBeInTheDocument();
  });

  it('renders all four capability groups', () => {
    render(<ProductLab />);
    for (const group of [
      'Print & Packaging',
      'Brand Products',
      'Spatial Experience',
      'Custom Solutions',
    ]) {
      expect(screen.getByText(group)).toBeInTheDocument();
    }
  });

  it('renders every capability item, not just the group names', () => {
    render(<ProductLab />);
    for (const item of ITEMS) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it('renders deck page 05 as the process imagery', () => {
    const { container } = render(<ProductLab />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/deck/page-05-1920.webp');
  });

  it('drops the Stage 2 stub placeholder line', () => {
    render(<ProductLab />);
    expect(screen.queryByText(/Capability list and process imagery/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npx vitest run app/product-lab`
Expected: FAIL — the invented placeholder still renders and no capability items exist.

- [ ] **Step 3: Implement `app/product-lab/page.tsx`**

```tsx
import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CapabilityList, type CapabilityGroup } from '@/components/sections/CapabilityList';
import { PRODUCT_LAB_PAGE } from '@/lib/deck';

// Transcribed verbatim from assets/web/page-05-1920.webp on 2026-09-19.
const BODY = [
  "We transform ideas into products that embody a brand's identity and purpose. From material exploration and design development to prototyping, production, and final finishing, every stage is approached with precision and intention.",
  'We believe exceptional products are created through thoughtful craftsmanship, meticulous attention to detail, and a commitment to quality.',
] as const;

const CAPABILITIES: readonly CapabilityGroup[] = [
  {
    name: 'Print & Packaging',
    items: [
      'Packaging Design & Production',
      'Premium Gift Sets',
      'Printing Production',
      'Publications',
    ],
  },
  {
    name: 'Brand Products',
    items: [
      'Brand Merchandise',
      'Corporate Merchandise',
      'Event Merchandise',
      'Apparel Development',
      'Uniform Development',
    ],
  },
  { name: 'Spatial Experience', items: ['Retail Display', 'Exhibition Production'] },
  { name: 'Custom Solutions', items: ['Custom Product Development'] },
];

export default function ProductLab() {
  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell py-24">
          <MaskReveal as="h1" className="display-type">
            PRODUCT <span className="text-k-red">LAB</span>
          </MaskReveal>

          <p className="font-display mt-12 text-3xl tracking-tight">
            Where Ideas Become Products.
          </p>
          <div className="mt-6 max-w-[60ch]">
            {BODY.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="font-body mt-4 text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          <h2 className="font-display mt-20 text-4xl tracking-tight">Capabilities</h2>
          <CapabilityList groups={CAPABILITIES} />

          {/* A description, not alt="": page 05's right half is production photography —
              sewing, pattern drafting, keyring and pouch prototypes, cap construction
              sketches — whose content appears nowhere on this page as text. */}
          <DeckFigure
            page={PRODUCT_LAB_PAGE}
            alt="Product Lab process: pattern cutting, material sampling, and packaging and merchandise prototyping"
            sizes="100vw"
            className="mt-20"
          />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `cd frontend && npx vitest run app/product-lab`
Expected: PASS, 5 tests.

- [ ] **Step 5: Run the whole suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/product-lab
git commit -m "feat(frontend): /product-lab from deck page 05

Body copy and the full nested capability list transcribed verbatim from the
deck — four groups and twelve items, where the page-section mapping had
recorded only the group names. Replaces the Stage 2 stub's invented line."
```

---

### Task 6: `/creative-lab`

**Files:**
- Modify: `frontend/app/creative-lab/page.tsx`
- Create: `frontend/app/creative-lab/page.test.tsx`

**Interfaces:**
- Consumes: `DeckFigure`, `MaskReveal`, `CapabilityList`, `CapabilityGroup`, `CREATIVE_LAB_PAGE`.
- Produces: nothing later tasks depend on.

Transcribed from `assets/web/page-06-1920.webp` on 2026-09-19. `content/page-section-mapping.md` recorded this list as "Creative Direction, Photography, Film, etc." — the "etc." is resolved here: twelve items, flat, no groups.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/app/creative-lab/page.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreativeLab from './page';

const CAPABILITIES = [
  'Creative Direction',
  'Product Photography',
  'Campaign Photography',
  'Editorial',
  'Lookbook',
  'Lifestyle Photography',
  'Brand Film',
  'Video Campaign',
  'TV Commercial',
  'Motion Graphics',
  'Content Production',
  'Social Media Assets',
];

describe('/creative-lab (spec §4)', () => {
  it('leads with the headline and the positioning line', () => {
    render(<CreativeLab />);
    expect(screen.getByRole('heading', { name: /CREATIVE LAB/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Where Products Become Stories/i)).toBeInTheDocument();
  });

  it('renders all twelve capabilities', () => {
    render(<CreativeLab />);
    for (const item of CAPABILITIES) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it('renders the list flat, with no group headings', () => {
    const { container } = render(<CreativeLab />);
    expect(container.querySelectorAll('[data-capability-group-name]')).toHaveLength(0);
  });

  it('renders deck page 06 as the production imagery', () => {
    const { container } = render(<CreativeLab />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/deck/page-06-1920.webp');
  });

  it('drops the Stage 2 stub placeholder line', () => {
    render(<CreativeLab />);
    expect(screen.queryByText(/Capability list and production imagery/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npx vitest run app/creative-lab`
Expected: FAIL — the invented placeholder still renders.

- [ ] **Step 3: Implement `app/creative-lab/page.tsx`**

```tsx
import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CapabilityList, type CapabilityGroup } from '@/components/sections/CapabilityList';
import { CREATIVE_LAB_PAGE } from '@/lib/deck';

// Transcribed verbatim from assets/web/page-06-1920.webp on 2026-09-19. The mapping
// document had this list as "Creative Direction, Photography, Film, etc." — these are
// the twelve the deck actually names.
const BODY = [
  'Powerful products deserve meaningful stories. Through Creative Lab, we transform products into visual experiences that strengthen brand perception and create emotional connections.',
  'From creative direction to campaign execution, we produce visual content that communicates not only what a product is, but why it matters.',
  'Because every product deserves a story worth remembering.',
] as const;

const CAPABILITIES: readonly CapabilityGroup[] = [
  {
    name: '',
    items: [
      'Creative Direction',
      'Product Photography',
      'Campaign Photography',
      'Editorial',
      'Lookbook',
      'Lifestyle Photography',
      'Brand Film',
      'Video Campaign',
      'TV Commercial',
      'Motion Graphics',
      'Content Production',
      'Social Media Assets',
    ],
  },
];

export default function CreativeLab() {
  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell py-24">
          <MaskReveal as="h1" className="display-type">
            CREATIVE <span className="text-k-red">LAB</span>
          </MaskReveal>

          <p className="font-display mt-12 text-3xl tracking-tight">
            Where Products Become Stories
          </p>
          <div className="mt-6 max-w-[60ch]">
            {BODY.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="font-body mt-4 text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          <h2 className="font-display mt-20 text-4xl tracking-tight">Capabilities</h2>
          <CapabilityList groups={CAPABILITIES} />

          <DeckFigure
            page={CREATIVE_LAB_PAGE}
            alt="Creative Lab production: mood boards, camera rigs on set, and a lit studio floor"
            sizes="100vw"
            className="mt-20"
          />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `cd frontend && npx vitest run app/creative-lab`
Expected: PASS, 5 tests.

- [ ] **Step 5: Run the whole suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/creative-lab
git commit -m "feat(frontend): /creative-lab from deck page 06

Resolves the 'etc.' the page-section mapping left in this list: twelve named
capabilities, flat, transcribed from the deck along with all three paragraphs
of body copy. Replaces the Stage 2 stub's invented line."
```

---

### Task 7: `/archive` index

**Files:**
- Modify: `frontend/app/archive/page.tsx`
- Modify: `frontend/app/archive/page.test.tsx`

**Interfaces:**
- Consumes: `getArchiveProjects`, `slugify`, `DeckFigure`, `MaskReveal`, `StaggerReveal`, `PROCESS_STATEMENT_PAGE`.
- Produces: nothing later tasks depend on.

Spec §6: "Archive index — six rows; `01`–`06` counter increments in the fixed corner." The fixed-corner counter is scroll-driven and belongs to Stage 5's tail; this task ships the six rows with their numbers set as display type per row, which is what such a counter increments through. Deck page 07 opens the route, per Task 1's assignment.

The Stage 2 stub carries `text-k-black/60` on the industry line — an alpha-composited grey, which the three-colour constraint forbids. It is removed here rather than carried.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/app/archive/page.test.tsx — replaces the Stage 2 file
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArchiveIndex from './page';

describe('/archive (spec §4, §6)', () => {
  it('lists all six entries', () => {
    render(<ArchiveIndex />);
    expect(screen.getAllByTestId('archive-row')).toHaveLength(6);
  });

  it('numbers them 01 through 06 in ascending order', () => {
    render(<ArchiveIndex />);
    expect(screen.getAllByTestId('archive-no').map((el) => el.textContent)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
    ]);
  });

  it('links every row to its case study', () => {
    render(<ArchiveIndex />);
    expect(screen.getByRole('link', { name: /Nathan Tjoe A On/i })).toHaveAttribute(
      'href',
      '/archive/n8n-collective'
    );
    expect(screen.getByRole('link', { name: /Kemenpora/i })).toHaveAttribute(
      'href',
      '/archive/kemenpora'
    );
  });

  it('opens with deck page 07', () => {
    const { container } = render(<ArchiveIndex />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/deck/page-07-1920.webp');
  });

  it('uses no alpha-composited grey, which spec §5 forbids', () => {
    const { container } = render(<ArchiveIndex />);
    expect(container.innerHTML).not.toMatch(/k-black\/\d/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npx vitest run app/archive/page.test.tsx`
Expected: FAIL — no `archive-row` test ids, no deck image, and the grey is still present.

- [ ] **Step 3: Implement `app/archive/page.tsx`**

```tsx
import Link from 'next/link';
import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { getArchiveProjects } from '@/lib/contract';
import { PROCESS_STATEMENT_PAGE } from '@/lib/deck';
import { slugify } from '@/lib/slugify';

export default function ArchiveIndex() {
  const projects = getArchiveProjects();

  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell py-24">
          <MaskReveal as="h1" className="display-type">
            LAB ARCHIVE
          </MaskReveal>

          <DeckFigure
            page={PROCESS_STATEMENT_PAGE}
            alt="Every great outcome starts with a thoughtful process."
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="mt-12"
            priority
          />

          <StaggerReveal className="mt-20">
            {projects.map((project) => (
              <article
                key={project.archive_no}
                data-testid="archive-row"
                className="border-k-black border-t-2"
              >
                <Link
                  href={`/archive/${slugify(project.title)}`}
                  className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-6"
                >
                  <span
                    data-testid="archive-no"
                    className="font-display text-k-red text-3xl tracking-tight"
                  >
                    {project.archive_no}
                  </span>
                  <span className="font-display text-3xl tracking-tight">{project.client}</span>
                  {/* Uppercase letterspacing rather than the Stage 2 stub's
                      text-k-black/60: the same de-emphasis without compositing a grey. */}
                  <span className="font-body text-sm tracking-widest uppercase">
                    {project.industry}
                  </span>
                  <span className="font-body text-sm">{project.year_range}</span>
                </Link>
              </article>
            ))}
          </StaggerReveal>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `cd frontend && npx vitest run app/archive/page.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Run the whole suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/archive/page.tsx frontend/app/archive/page.test.tsx
git commit -m "feat(frontend): /archive index

Six numbered rows built from the fixture, since no deck page shows the six
entries together — the index is the one route in spec §4 with no captured
source. Deck page 07 opens it, per the studio's assignment of that previously
ambiguous page. Drops the Stage 2 stub's alpha-composited grey, which spec §5
forbids, in favour of uppercase letterspacing for the same de-emphasis."
```

---

### Task 8: `/archive/[slug]` case studies

**Files:**
- Modify: `frontend/app/archive/[slug]/page.tsx`
- Modify: `frontend/app/archive/[slug]/page.test.tsx`

**Interfaces:**
- Consumes: `getArchiveProject`, `getArchiveProjects`, `slugify`, `DeckFigure`, `MaskReveal`, `StaggerReveal`, `ARCHIVE_OPENER_PAGE`, `archiveGalleryPages`.
- Produces: nothing later tasks depend on.

Spec §6 describes this section as "pinned left hero, scrolling right gallery — mirrors the deck spread." Pinning is Stage 5's severable tail. This task ships the static composition Stage 5 will animate: the opener page, the project's metadata as live text, then the gallery pages stacked.

`scope` is `[]` on all six projects. The opener page image carries each study's SCOPE OF WORK list as artwork; no live scope list renders until the CPT is populated, and the empty array must not produce a bare `<ul>`. The Stage 2 stub's "Hero image not yet supplied" placeholder and its `text-k-black/60` go away with the rewrite.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/app/archive/[slug]/page.test.tsx — replaces the Stage 2 file
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArchiveCaseStudy, { generateStaticParams } from './page';

async function renderSlug(slug: string) {
  const ui = await ArchiveCaseStudy({ params: Promise.resolve({ slug }) });
  return render(ui);
}

describe('/archive/[slug] (spec §4, §6)', () => {
  it('prerenders exactly the six case studies', async () => {
    const params = await generateStaticParams();
    expect(params.map((p) => p.slug)).toEqual([
      'n8n-collective',
      'drx-wear',
      'howard-smith',
      'cargloss-helmet',
      'xl-smart-axiata',
      'kemenpora',
    ]);
  });

  it('renders the opener page and every gallery page for the study', async () => {
    const { container } = await renderSlug('n8n-collective');
    const sources = Array.from(container.querySelectorAll('img')).map((img) =>
      img.getAttribute('src')
    );
    expect(sources).toEqual([
      '/deck/page-08-1920.webp',
      '/deck/page-09-1920.webp',
      '/deck/page-10-1920.webp',
      '/deck/page-11-1920.webp',
    ]);
  });

  it('renders the project metadata as live text', async () => {
    await renderSlug('drx-wear');
    expect(screen.getByRole('heading', { name: /DRX Wear/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText(/Sport Brand Apparel/i)).toBeInTheDocument();
  });

  it('renders no scope list while the fixture carries none, and no empty container', async () => {
    const { container } = await renderSlug('kemenpora');
    expect(container.querySelector('[data-scope-list]')).toBeNull();
    expect(screen.queryByText(/undefined|null/i)).not.toBeInTheDocument();
  });

  it('404s on a slug that is not a case study', async () => {
    await expect(renderSlug('not-a-real-project')).rejects.toThrow();
  });

  it('uses no alpha-composited grey, which spec §5 forbids', async () => {
    const { container } = await renderSlug('howard-smith');
    expect(container.innerHTML).not.toMatch(/k-black\/\d/);
  });
});
```

`notFound()` throws Next's `NEXT_HTTP_ERROR_FALLBACK;404` digest error, which is what the rejection assertion catches — the framework's 404 path working, not a crash.

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npx vitest run "app/archive/[slug]"`
Expected: FAIL — no deck images render; the stub shows the "Hero image not yet supplied" placeholder.

- [ ] **Step 3: Implement `app/archive/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { StaggerReveal } from '@/components/motion/StaggerReveal';
import { getArchiveProject, getArchiveProjects } from '@/lib/contract';
import { ARCHIVE_OPENER_PAGE, archiveGalleryPages } from '@/lib/deck';
import { slugify } from '@/lib/slugify';

export async function generateStaticParams() {
  return getArchiveProjects().map((p) => ({ slug: slugify(p.title) }));
}

export default async function ArchiveCaseStudy({ params }: PageProps<'/archive/[slug]'>) {
  const { slug } = await params;
  const project = getArchiveProject(slug);
  if (!project) {
    notFound();
  }

  const openerPage = ARCHIVE_OPENER_PAGE[project.archive_no];
  const galleryPages = archiveGalleryPages(project.archive_no);

  return (
    <main>
      <section className="bg-k-paper text-k-black">
        <div className="section-shell py-24">
          <p className="font-display text-k-red text-3xl tracking-tight">{project.archive_no}</p>
          <MaskReveal as="h1" className="display-type mt-2">
            {project.client}
          </MaskReveal>
          <p className="font-body mt-6 text-sm tracking-widest uppercase">
            {project.industry} · {project.year_range}
          </p>

          {/* The opener page carries this study's SCOPE OF WORK list as artwork. The
              fixture's `scope` array is empty for all six projects — populating the CPT
              is a content-layer task — so the alt text describes it rather than the page
              duplicating a list it does not have. */}
          <DeckFigure
            page={openerPage}
            alt={`${project.title} case study opener: scope of work and campaign photography`}
            sizes="100vw"
            className="mt-12"
            priority
          />

          {project.scope.length > 0 ? (
            <ul data-scope-list className="mt-12">
              {project.scope.map((item) => (
                <li key={item} className="font-body border-k-black border-t-2 py-3 text-lg">
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="bg-k-black text-k-paper">
        <div className="section-shell py-24">
          {/* alt="" on each gallery page: they are further views of the work the opener
              already describes, and repeating the client name on each adds noise. */}
          <StaggerReveal className="flex flex-col gap-8">
            {galleryPages.map((page) => (
              <DeckFigure key={page} page={page} alt="" sizes="100vw" />
            ))}
          </StaggerReveal>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `cd frontend && npx vitest run "app/archive/[slug]"`
Expected: PASS, 6 tests.

- [ ] **Step 5: Run the whole suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add "frontend/app/archive/[slug]"
git commit -m "feat(frontend): case study route from the deck spreads

Each of the six studies renders its verified opener page plus its gallery
pages, with the project metadata as live text. Spec §6's pinned left hero is
Stage 5's severable tail; this is the static composition it will animate.

The fixture's scope array is empty for all six projects, so no scope list
renders — the opener page carries that content as artwork and its alt text
says so. Replaces the Stage 2 stub's placeholder note and its
alpha-composited grey."
```

---

### Task 9: `/contact`

**Files:**
- Create: `frontend/lib/studio-contact.ts`
- Create: `frontend/lib/studio-contact.test.ts`
- Modify: `frontend/app/contact/page.tsx`
- Modify: `frontend/app/contact/page.test.tsx`

**Interfaces:**
- Consumes: `DeckFigure`, `MaskReveal`, `CONTACT_PAGE`, `getSiteSetting`.
- Produces: `STUDIO_CONTACT: { readonly phones: readonly string[]; readonly email: string }` and `telHref(phone: string): string`.

`site_setting` is empty on every field. Deck page 26 shows two phone numbers and an email, all legible and already transcribed in `content/page-section-mapping.md`. The route renders that page as the visual **and** the three values as live `tel:`/`mailto:` links.

This is deliberate and narrow. Spec §1 measures success by a prospective client making contact; a phone number that cannot be tapped on a phone fails that on the one route whose whole job is contact. The constant is not a substitute for the CPT: `SiteFooter` continues to read `getSiteSetting()` and render nothing, so populating the singleton later lights up the footer and makes this file the thing to delete.

Spec §4: no contact form in v1.

- [ ] **Step 1: Write the failing test for the constant**

```ts
// frontend/lib/studio-contact.test.ts
import { describe, it, expect } from 'vitest';
import { STUDIO_CONTACT, telHref } from './studio-contact';
import { getSiteSetting } from './contract';

describe('STUDIO_CONTACT', () => {
  it('carries the two numbers and the email transcribed from deck page 26', () => {
    expect(STUDIO_CONTACT.phones).toEqual(['+62 813 1131 9739', '+62 812 7230 0977']);
    expect(STUDIO_CONTACT.email).toBe('kreativestudiolab@gmail.com');
  });

  it('strips spaces for the tel: href and leaves the visible text alone', () => {
    expect(telHref('+62 813 1131 9739')).toBe('tel:+6281311319739');
  });

  it('exists only because the CMS singleton is empty — delete it once that is populated', () => {
    // A tripwire, and it is meant to fail one day: the moment someone populates
    // site_setting, this goes red and points at the file to delete. A comment would not.
    const settings = getSiteSetting();
    expect(Boolean(settings.phone_primary || settings.email)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd frontend && npx vitest run lib/studio-contact.test.ts`
Expected: FAIL — cannot resolve `./studio-contact`.

- [ ] **Step 3: Implement `lib/studio-contact.ts`**

```ts
/**
 * Transcribed from deck page 26 (`assets/web/page-26-1920.webp`) and recorded in
 * frontend/content/page-section-mapping.md, which flags that spec §3's claim these were
 * "never transcribed from the deck" is wrong — they are legible at 1920px.
 *
 * This exists because the `site_setting` CPT is empty on every field. It is a narrow
 * exception, not a pattern: /contact is the one route whose job is to be acted on, and a
 * phone number rendered only inside a raster cannot be tapped, selected, or crawled.
 * Everything else, including SiteFooter, still reads the fixture and degrades to nothing.
 *
 * Delete this file when the singleton is populated. `studio-contact.test.ts` fails the
 * moment that happens.
 */
export const STUDIO_CONTACT = {
  phones: ['+62 813 1131 9739', '+62 812 7230 0977'],
  email: 'kreativestudiolab@gmail.com',
} as const;

/** Strips spaces for the `tel:` href; the visible text keeps its formatting. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `cd frontend && npx vitest run lib/studio-contact.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing route test**

```tsx
// frontend/app/contact/page.test.tsx — replaces the Stage 2 file
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Contact from './page';

describe('/contact (spec §4)', () => {
  it('renders deck page 26 as the contact card', () => {
    const { container } = render(<Contact />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/deck/page-26-1920.webp');
  });

  it('makes both numbers dialable', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: '+62 813 1131 9739' })).toHaveAttribute(
      'href',
      'tel:+6281311319739'
    );
    expect(screen.getByRole('link', { name: '+62 812 7230 0977' })).toHaveAttribute(
      'href',
      'tel:+6281272300977'
    );
  });

  it('makes the email a mailto link', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: 'kreativestudiolab@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:kreativestudiolab@gmail.com'
    );
  });

  it('ships no contact form, per spec §4', () => {
    const { container } = render(<Contact />);
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelectorAll('input')).toHaveLength(0);
  });

  it('drops the Stage 2 stub placeholder and its grey', () => {
    const { container } = render(<Contact />);
    expect(screen.queryByText(/pending/i)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/k-black\/\d/);
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `cd frontend && npx vitest run app/contact`
Expected: FAIL — the stub renders "Contact details pending" and no links.

- [ ] **Step 7: Implement `app/contact/page.tsx`**

```tsx
import { DeckFigure } from '@/components/media/DeckFigure';
import { MaskReveal } from '@/components/motion/MaskReveal';
import { CONTACT_PAGE } from '@/lib/deck';
import { STUDIO_CONTACT, telHref } from '@/lib/studio-contact';

export default function Contact() {
  return (
    <main>
      <section className="bg-k-black text-k-paper">
        <div className="section-shell flex min-h-[70svh] flex-col justify-center py-24">
          <MaskReveal as="h1" className="display-type">
            LET&apos;S <span className="text-k-red">TALK</span>
          </MaskReveal>

          <ul className="mt-12">
            {STUDIO_CONTACT.phones.map((phone) => (
              <li key={phone}>
                <a
                  href={telHref(phone)}
                  className="font-display inline-block py-3 text-3xl tracking-tight"
                >
                  {phone}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${STUDIO_CONTACT.email}`}
                className="font-display inline-block py-3 text-3xl tracking-tight break-all"
              >
                {STUDIO_CONTACT.email}
              </a>
            </li>
          </ul>

          {/* alt="": the numbers and the email are directly above as live text, so a
              description would announce them a second time. */}
          <DeckFigure
            page={CONTACT_PAGE}
            alt=""
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="mt-16"
          />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `cd frontend && npx vitest run app/contact`
Expected: PASS, 5 tests.

- [ ] **Step 9: Run the whole suite and typecheck**

Run: `cd frontend && npm test && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add frontend/app/contact frontend/lib/studio-contact.ts frontend/lib/studio-contact.test.ts
git commit -m "feat(frontend): /contact with dialable numbers and deck page 26

Renders the deck's contact card as the visual and the same three values as
live tel:/mailto: links. Spec §1 measures success by a prospective client
making contact, and a number that exists only inside a raster cannot be
tapped, selected or crawled — so this one route gets a cited constant while
SiteFooter keeps reading the empty CPT and rendering nothing. A tripwire test
fails the moment the singleton is populated, pointing at the file to delete.

No form, per spec §4."
```

---

### Task 10: Sitewide sweep and route coverage

**Files:**
- Create: `frontend/tests/no-greys.test.ts`
- Create: `frontend/tests/routes.test.tsx`
- Modify: `frontend/app/globals.css`

**Interfaces:**
- Consumes: every route component.
- Produces: nothing.

Two sitewide properties that no single route's test can assert, plus the Stage 3 review's M10 — `<body>` lost `min-h-full flex flex-col` in Stage 3, so a short route leaves the footer mid-viewport, and `/contact` is the route that exposes it.

- [ ] **Step 1: Write the failing tests**

```ts
// frontend/tests/no-greys.test.ts
// Spec §5: three colours only, and greys are image content. An alpha-composited black
// (`text-k-black/60`) renders as a grey, which is how two Stage 2 stubs violated this
// without naming a grey anywhere. Source-level, because the composite only exists at
// paint time — there is no runtime signal to assert on.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      sourceFiles(path, acc);
    } else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
      acc.push(path);
    }
  }
  return acc;
}

describe('three-colour constraint (spec §5)', () => {
  it('composites no brand colour against an alpha', () => {
    const offenders: string[] = [];
    for (const path of [
      ...sourceFiles(join(__dirname, '../app')),
      ...sourceFiles(join(__dirname, '../components')),
    ]) {
      const matches = readFileSync(path, 'utf-8').match(/k-(?:black|paper|red)\/\d+/g);
      if (matches) offenders.push(`${path}: ${matches.join(', ')}`);
    }
    expect(offenders).toEqual([]);
  });
});
```

```tsx
// frontend/tests/routes.test.tsx
// Every static route renders without throwing and puts exactly one h1 on the page.
// Cheap, and it catches the breakage a per-route suite misses when a shared component
// changes underneath all six at once.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';
import About from '../app/about/page';
import ProductLab from '../app/product-lab/page';
import CreativeLab from '../app/creative-lab/page';
import ArchiveIndex from '../app/archive/page';
import Contact from '../app/contact/page';

const ROUTES = [
  ['/', <Home key="/" />],
  ['/about', <About key="/about" />],
  ['/product-lab', <ProductLab key="/product-lab" />],
  ['/creative-lab', <CreativeLab key="/creative-lab" />],
  ['/archive', <ArchiveIndex key="/archive" />],
  ['/contact', <Contact key="/contact" />],
] as const;

describe('every route (spec §4)', () => {
  for (const [name, node] of ROUTES) {
    it(`${name} renders with exactly one level-1 heading`, () => {
      render(node);
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });
  }

  it('every route lays out on the shared shell', () => {
    for (const [, node] of ROUTES) {
      const { container, unmount } = render(node);
      expect(container.querySelector('.section-shell')).not.toBeNull();
      unmount();
    }
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd frontend && npx vitest run tests/no-greys.test.ts tests/routes.test.tsx`
Expected: `routes.test.tsx` FAILs on any route whose opener is not an `h1`. `no-greys.test.ts` passes if Tasks 7–9 removed both offenders — if so, record in the ledger that it passed on first run because the fixes preceded it, and keep it as the regression gate.

- [ ] **Step 3: Fix whatever the tests found**

A route reporting zero `h1` has an opener `MaskReveal` left at the default `as="h2"` — pass `as="h1"`. A route reporting two has a section duplicating the page title.

- [ ] **Step 4: Restore the sticky footer in `app/globals.css`**

Stage 3 removed `min-h-full flex flex-col` from `<body>` because ScrollSmoother needs `#smooth-wrapper` and `#smooth-content` to be plain blocks. The footer sits inside the smoothed content, so the fix belongs on the content wrapper. Append:

```css
/* A short route (/contact is the shortest) must not leave the footer mid-viewport.
   The flex column lives on the smoothed content rather than on <body>, because
   ScrollSmoother requires its wrapper to stay a plain block. */
#smooth-content {
  display: flex;
  min-height: 100svh;
  flex-direction: column;
}

#smooth-content > main {
  flex: 1 0 auto;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd frontend && npx vitest run tests/no-greys.test.ts tests/routes.test.tsx`
Expected: PASS.

- [ ] **Step 6: Run the whole suite, typecheck, lint and build**

Run: `cd frontend && npm test && npx tsc --noEmit && npx eslint . && npm run build`
Expected: all tests pass, no type errors, no new eslint errors beyond the two pre-existing `react-hooks/set-state-in-effect` in `MaskReveal` and `StaggerReveal`, and a clean build.

- [ ] **Step 7: Verify the emitted HTML for the new routes**

```bash
cd frontend
for route in about product-lab creative-lab archive contact; do
  f=".next/server/app/$route.html"
  echo "$route: video=$(grep -c '<video' $f) greys=$(grep -c 'k-black/' $f) lazy=$(grep -o 'loading="lazy"' $f | wc -l)"
done
```

Expected: `video=0` on every route (only `/` has one), `greys=0` on every route, and `lazy` greater than zero on every route that renders a non-opener image.

- [ ] **Step 8: Commit**

```bash
git add frontend/tests/no-greys.test.ts frontend/tests/routes.test.tsx frontend/app/globals.css
git commit -m "test(frontend): sitewide gates for the three-colour rule and route health

A source-level scan for alpha-composited brand colours, which is how two Stage 2
stubs rendered greys without naming one, and a render pass over all six static
routes asserting a single h1 and the shared shell on each. Also restores the
sticky footer Stage 3 dropped from <body>, on #smooth-content where ScrollSmoother
tolerates it — /contact is the short route that exposes it."
```

---

## Stage 4 exit criteria

- `npm test` green, `npx tsc --noEmit` clean, `npm run build` succeeds, `npx eslint .` reports no new errors.
- All seven routes render their deck imagery with zero 404s in the Network panel.
- `/about`, `/product-lab` and `/creative-lab` show transcribed deck copy; no invented placeholder copy survives anywhere.
- All six case studies reachable from `/archive`, each showing its opener and its gallery pages.
- `/archive/not-a-real-project` returns the 404 page.
- `/contact` numbers dial from a phone and the email opens a mail client.
- No alpha-composited greys anywhere in `app/` or `components/`.
- With OS "Reduce motion" on, every route is legible, the capability keylines sit at their end state, and nothing translates.
- At 390px, every route scrolls with native momentum and nothing is pinned.

## Carried forward from Stage 3, still unverified

These need a real browser and device and could not be closed in the sandbox. They gate the Stage 5 performance and accessibility passes.

- iOS Safari hero autoplay and the 720p source selection below 768px.
- The header at 390px, now that the nav wraps.
- `ScrollTrigger.getAll().length` returning to its starting value after `/` → `/about` → `/`.

## Deferred to Stage 5

Pinned Two Labs circle convergence and pinned case-study spread (§6), the `/archive` fixed-corner counter (§6), mobile pin-to-stack conversion (§7), the performance budget pass (§10), and the accessibility pass (§11).

## Open content-layer items

- `site_setting` is empty; `lib/studio-contact.ts` and its tripwire test exist until it is populated.
- `scope` is `[]` on all six archive projects; the opener pages carry those lists as artwork.
- `hero_image` and `gallery` are null/empty on all six projects; the deck pages stand in.
- Spec §3's client list omits Nippon Paint, which is legible on deck page 24.
- Spec §14's open questions are unchanged: exact brand red, hosting target, deck spelling corrections, and vector artwork for the crossed-K mark.
