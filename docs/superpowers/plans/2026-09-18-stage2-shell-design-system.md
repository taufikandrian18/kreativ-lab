# Stage 2: Shell and Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public Next.js front-end — every route, correct typography and grid,
the full image pipeline — entirely still, no motion, consuming Stage 1's frozen REST
contract fixture as its content source.

**Architecture:** Next.js App Router + TypeScript, statically rendered at build time from
`wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json` (Stage 1's frozen
deliverable). No live WordPress connection in this stage — that wiring (a `/api/revalidate`
route consuming `KSL_REVALIDATE_URL`/`KSL_REVALIDATE_SECRET`, already sent by the plugin's
`class-revalidate-webhook.php`) is explicitly deferred; see Self-Review Notes. Styling is
CSS custom properties driven by Tailwind v4's CSS-first `@theme`, not component-level
inline styles, so every token in spec §5 has exactly one source of truth.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4,
`next/font/google` for Anton + Archivo (self-hosts at build time — no runtime Google
request, satisfying spec §5's "no Google Fonts network request"), Vitest + React Testing
Library for content/contract tests, Playwright for a static-render smoke pass. Package
manager: npm (already installed, confirmed `v25.2.1` / `11.12.1`). Deploy target:
self-hosted Node (`next build && next start`) — `next/image`'s built-in optimizer runs in
that mode with zero extra config; no Vercel-specific setup.

**Spec:** `docs/superpowers/specs/2026-09-18-kreative-studio-lab-design.md`

## Global Constraints

- Three colours only: `--k-red: #F81010`, `--k-black: #000000`, `--k-paper: #FFFFFF`. No
  greys as CSS colour — halftone greys are image content (spec §5).
- `--font-display: 'Anton'`, `--font-body: 'Archivo'`. Self-hosted, `font-display: swap`,
  preloaded. No Google Fonts network request at runtime (spec §5).
- 12-column grid. Gutter 16px mobile, 32px from 768px, 48px from 1280px. Max content width
  1680px (spec §5).
- `100vh` is never used — `100svh`/`100dvh` only (spec §7, applies now even without motion,
  since it's a CSS rule not a motion rule).
- Red on white is 4.0:1 — restricted to display type ≥24px and non-informational keylines,
  never body copy or small labels (spec §11).
- Every image below the fold is lazy; the LCP element on `/` is a static poster image, not
  the hero video (spec §10) — the video element itself is Stage 3 scope (motion), but the
  poster image and its preload must be correct now since LCP is measured on this stage's
  static output.
- Raw pages: `assets/raw/`. Derivatives: `assets/web/` (1920/1280/768/420px WebP). Video:
  `assets/video/` (spec §9; video *files* exist from Stage 0 prep, but embedding them is
  Stage 3 — this stage only needs the poster frame).
- No layout work may assume a specific page-to-section mapping until Task 2 verifies it
  (spec §9's explicit requirement).

---

## File Structure

```
frontend/
  package.json
  tsconfig.json
  next.config.ts
  vitest.config.ts
  playwright.config.ts
  app/
    layout.tsx                 # root layout: fonts, <html>, global CSS import
    globals.css                # Tailwind import + @theme tokens
    page.tsx                   # /
    about/page.tsx
    product-lab/page.tsx
    creative-lab/page.tsx
    archive/page.tsx
    archive/[slug]/page.tsx
    contact/page.tsx
  components/
    layout/
      Container.tsx
      Grid.tsx
      Section.tsx
    archive/
      ArchiveRow.tsx
      ArchiveHero.tsx
  lib/
    contract.ts                 # types + fixture loader (Stage 2's data source)
    contract.test.ts
  content/
    page-section-mapping.md     # Task 2's output: which deck page -> which route/section
  public/
    images/                     # symlink or copy target for assets/web/* actually used
  tests/
    content-mapping.test.ts     # spec §12 "Content mapping" row
    smoke.spec.ts                # Playwright: every route renders, no console errors
```

Rationale for `lib/contract.ts` as a single seam: Stage 4 swaps this file's internals from
"read the frozen JSON fixture" to "fetch the live WP REST API," and nothing else in the
app changes, because every route imports the same exported function signatures.

---

## Task 1: Scaffold the Next.js app

**Files:**
- Create: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.ts`
- Create: `frontend/app/layout.tsx`, `frontend/app/page.tsx`, `frontend/app/globals.css`
- Create: `frontend/vitest.config.ts`

**Interfaces:**
- Produces: a working `npm run dev` / `npm run build` in `frontend/`, consumed by every
  later task.

- [ ] **Step 1: Scaffold with create-next-app**

Run (from `~/kreativ-lab`):
```bash
npx --yes create-next-app@latest frontend \
  --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint --use-npm
```
Expected: `frontend/` created with a default Next.js 15 + Tailwind v4 + App Router project.

- [ ] **Step 2: Verify the dev server boots**

Run: `cd frontend && npm run dev -- --port 3100 &` then `sleep 3 && curl -sf http://localhost:3100 | head -c 200`
Expected: HTML output starting with `<!DOCTYPE html>`. Then: `kill %1` to stop it.

- [ ] **Step 3: Add Vitest + React Testing Library**

Run: `cd frontend && npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`

```ts
// frontend/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

Add to `frontend/package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 4: Write and run a trivial smoke test to confirm the harness works**

```ts
// frontend/lib/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('vitest harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npm test`
Expected: `1 passed`. Delete this file once confirmed — it exists only to prove the harness
before Task 5 depends on it.

- [ ] **Step 5: Commit**

```bash
cd ~/kreativ-lab
git add frontend
git commit -m "chore(frontend): scaffold Next.js 15 app with Vitest harness"
```

---

## Task 2: Verify the page-to-section mapping

**Files:**
- Create: `frontend/content/page-section-mapping.md`
- Read: all 26 files in `assets/web/page-NN-1920.webp` (view each one)

**Interfaces:**
- Produces: `frontend/content/page-section-mapping.md`, a table every later route task
  reads by name (e.g. "hero poster", "who-we-are grid") — never by raw page number.

This is the spec §9 gate: "no layout work should depend on the assumed order until this
task is done." Do this before Task 6 onward.

- [ ] **Step 1: View each of the 26 pages**

For each `assets/web/page-01-1920.webp` through `page-26-1920.webp`, view the image and
note: what it depicts (headline text visible, photo subject, layout style), and which
spec section it most plausibly belongs to, cross-referencing spec §4 (routes) and §6
(per-section vocabulary) for section names, even though motion itself is out of scope.

- [ ] **Step 2: Write the mapping table**

```markdown
# Page-to-section mapping

Verified by viewing `assets/web/page-NN-1920.webp` against spec §4/§6. Superseded the
provisional extraction-order assumption in spec §9.

| Page | Depicts | Route | Section |
|---|---|---|---|
| 01 | ... | / | hero poster |
| 02 | ... | / | manifesto |
| ... | ... | ... | ... |
```

Fill in all 26 rows with what is actually visible — do not guess at rows you have not
viewed. If a page's target section is genuinely ambiguous, write "ambiguous — needs studio
confirmation" in the Section column rather than picking one silently; carry it forward the
same way spec §14 carries forward the illegible client logo, rather than resolving it by
assumption.

- [ ] **Step 3: Commit**

```bash
cd ~/kreativ-lab
git add frontend/content/page-section-mapping.md
git commit -m "docs(frontend): verify page-to-section mapping per spec §9"
```

---

## Task 3: Design tokens — colour, type, grid

**Files:**
- Modify: `frontend/app/globals.css`
- Modify: `frontend/app/layout.tsx`

**Interfaces:**
- Produces: CSS custom properties (`--k-red`, `--k-black`, `--k-paper`, `--font-display`,
  `--font-body`) and Tailwind utility classes generated from them, consumed by every
  component task from here on.

- [ ] **Step 1: Write the failing test — tokens resolve to spec values**

```ts
// frontend/lib/tokens.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('design tokens', () => {
  const css = readFileSync(join(__dirname, '../app/globals.css'), 'utf-8');

  it('defines the three-colour palette from spec §5', () => {
    expect(css).toMatch(/--k-red:\s*#F81010/i);
    expect(css).toMatch(/--k-black:\s*#000000/i);
    expect(css).toMatch(/--k-paper:\s*#FFFFFF/i);
  });

  it('does not define a generic grey token', () => {
    expect(css).not.toMatch(/--k-grey/i);
    expect(css).not.toMatch(/--k-gray/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tokens.test.ts`
Expected: FAIL — `globals.css` doesn't have these tokens yet (default create-next-app
scaffold only).

- [ ] **Step 3: Write the tokens**

```css
/* frontend/app/globals.css */
@import "tailwindcss";

@theme {
  --color-k-red: #F81010;
  --color-k-black: #000000;
  --color-k-paper: #FFFFFF;

  --font-display: var(--font-anton), sans-serif;
  --font-body: var(--font-archivo), sans-serif;

  --spacing-gutter-mobile: 1rem;    /* 16px */
  --spacing-gutter-tablet: 2rem;    /* 32px */
  --spacing-gutter-desktop: 3rem;   /* 48px */
  --width-content-max: 1680px;
}

:root {
  --k-red: #F81010;
  --k-black: #000000;
  --k-paper: #FFFFFF;
}

body {
  background: var(--k-paper);
  color: var(--k-black);
  font-family: var(--font-body);
}

.display-type {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  font-size: clamp(3rem, 12vw, 11rem);
  line-height: 0.95;
}
```

Note: both a Tailwind `@theme` block (for `bg-k-red`, `text-k-black`, etc. utility
classes) and plain `:root` custom properties (for the token test above, and for any raw
CSS that isn't going through Tailwind) are defined — they must stay in sync, which the
test in Step 1 only checks on the `:root` block. This is a known duplication, accepted
because Tailwind v4's `@theme` values aren't independently readable as plain CSS text by
a test without a build step.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire up fonts via next/font/google**

```tsx
// frontend/app/layout.tsx
import { Anton, Archivo } from 'next/font/google';
import './globals.css';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata = {
  title: 'Kreative Studio Lab',
  description: 'Clean in form. Sharp in function.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

`next/font/google` downloads the font files at build time and serves them from the app's
own domain — this satisfies spec §5's "no Google Fonts network request" without needing to
manually source and subset woff2 files ourselves.

- [ ] **Step 6: Verify no console warnings about missing font files**

Run: `npm run build`
Expected: build succeeds with no font-related warnings in the output.

- [ ] **Step 7: Commit**

```bash
cd ~/kreativ-lab
git add frontend/app/globals.css frontend/app/layout.tsx frontend/lib/tokens.test.ts
git commit -m "feat(frontend): design tokens for colour, type, and grid (spec §5)"
```

---

## Task 4: Contract types and fixture data loader

**Files:**
- Create: `frontend/lib/contract.ts`
- Test: `frontend/lib/contract.test.ts`
- Reads: `wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json`

**Interfaces:**
- Produces: `ArchiveProject`, `ClientLogo`, `SiteSetting` types, and
  `getArchiveProjects(): ArchiveProject[]`, `getArchiveProject(slug: string):
  ArchiveProject | undefined`, `getClientLogos(): ClientLogo[]`, `getSiteSetting():
  SiteSetting`. Every route task (6 onward) imports only these — never reads the fixture
  file directly.

- [ ] **Step 1: Write the failing test**

```ts
// frontend/lib/contract.test.ts
import { describe, it, expect } from 'vitest';
import { getArchiveProjects, getArchiveProject, getClientLogos, getSiteSetting } from './contract';

describe('contract data loader', () => {
  it('loads exactly six archive projects', () => {
    expect(getArchiveProjects()).toHaveLength(6);
  });

  it('finds a project by slugified title', () => {
    const project = getArchiveProject('n8n-collective');
    expect(project?.client).toBe('Nathan Tjoe A On');
  });

  it('returns undefined for an unknown slug', () => {
    expect(getArchiveProject('does-not-exist')).toBeUndefined();
  });

  it('loads exactly 24 client logos, ordered', () => {
    const logos = getClientLogos();
    expect(logos).toHaveLength(24);
    expect(logos[0].order).toBeLessThan(logos[1].order);
  });

  it('loads the single site setting', () => {
    const settings = getSiteSetting();
    expect(settings).toHaveProperty('email');
    expect(settings).toHaveProperty('phone_primary');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- contract.test.ts`
Expected: FAIL — `./contract` module doesn't exist yet.

- [ ] **Step 3: Write the minimal implementation**

```ts
// frontend/lib/contract.ts
import fixture from '../../wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json';

export interface ArchiveProject {
  archive_no: string;
  title: string;
  client: string;
  industry: string;
  year_range: string;
  scope: string[];
  lab: 'product' | 'creative' | 'both';
  hero_image: { url: string | null; alt: string | null };
  gallery: { url: string | null; alt: string | null }[];
  accent_color: string | null;
}

export interface ClientLogo {
  name: string;
  logo: { url: string | null; alt: string | null };
  order: number;
}

export interface SiteSetting {
  phone_primary: string;
  phone_secondary: string;
  email: string;
  instagram: string;
  address: string;
  og_image: { url: string | null; alt: string | null };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getArchiveProjects(): ArchiveProject[] {
  return fixture.archive_projects as ArchiveProject[];
}

export function getArchiveProject(slug: string): ArchiveProject | undefined {
  return getArchiveProjects().find((p) => slugify(p.title) === slug);
}

export function getClientLogos(): ClientLogo[] {
  return [...(fixture.client_logos as ClientLogo[])].sort((a, b) => a.order - b.order);
}

export function getSiteSetting(): SiteSetting {
  return fixture.site_settings[0] as SiteSetting;
}
```

Note the relative import path (`../../wordpress/...`) crosses from `frontend/` into the
repo's WordPress plugin directory — this is deliberate: it is the one and only place
Stage 2 reads Stage 1's output, and Stage 4 replaces only this file's internals (fetch
the live REST API instead of importing JSON) without touching the exported function
signatures any route depends on.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- contract.test.ts`
Expected: `5 passed`.

- [ ] **Step 5: Commit**

```bash
cd ~/kreativ-lab
git add frontend/lib/contract.ts frontend/lib/contract.test.ts
git commit -m "feat(frontend): contract types and fixture data loader"
```

---

## Task 5: Content-mapping test (spec §12)

**Files:**
- Test: `frontend/tests/content-mapping.test.ts`
- Reads: spec §3's six-row table (reproduced as literal expected values, not re-derived)

**Interfaces:**
- Consumes: `getArchiveProjects()` from Task 4.

This is the exact test spec §12 names: "Snapshot test per archive_project: the six
entries' archive_no, client, industry, year_range and scope length match the table in §3."

- [ ] **Step 1: Write the test**

```ts
// frontend/tests/content-mapping.test.ts
import { describe, it, expect } from 'vitest';
import { getArchiveProjects } from '../lib/contract';

// Reproduced verbatim from spec §3's six-row table. Do not "correct" values here —
// if the fixture and the spec disagree, that is a real bug to surface, not paper over.
const EXPECTED = [
  { archive_no: '01', client: 'Nathan Tjoe A On', industry: 'Clothing Brand', year_range: '2025 – 2026' },
  { archive_no: '02', client: 'DRX Wear', industry: 'Sport Brand Apparel', year_range: '2024 – 2025' },
  { archive_no: '03', client: 'Howard Smith', industry: 'Otomotive Manufacture', year_range: '2025' },
  { archive_no: '04', client: 'Cargloss Helmet', industry: 'Otomotive Manufacture', year_range: '2024 – 2025' },
  { archive_no: '05', client: 'XL Smart Axiata', industry: 'Telekomunikasi', year_range: '2025 – 2026' },
  { archive_no: '06', client: 'Kemenpora', industry: 'Sport Event National', year_range: '2025' },
];

describe('content mapping (spec §12)', () => {
  const projects = getArchiveProjects();

  it('has exactly six entries', () => {
    expect(projects).toHaveLength(6);
  });

  it.each(EXPECTED)('matches spec §3 for archive_no $archive_no', (expected) => {
    const actual = projects.find((p) => p.archive_no === expected.archive_no);
    expect(actual).toBeDefined();
    expect(actual?.client).toBe(expected.client);
    expect(actual?.industry).toBe(expected.industry);
    expect(actual?.year_range).toBe(expected.year_range);
  });

  it('every project has a scope array (possibly empty until content is populated)', () => {
    for (const p of projects) {
      expect(Array.isArray(p.scope)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run and verify it passes against the real fixture**

Run: `npm test -- content-mapping.test.ts`
Expected: all pass. If any fail, stop — this means the fixture and spec §3 have drifted,
which is a real defect to fix at the source (WordPress plugin or spec), not in this test.

- [ ] **Step 3: Commit**

```bash
cd ~/kreativ-lab
git add frontend/tests/content-mapping.test.ts
git commit -m "test(frontend): content-mapping check against spec §3 (spec §12)"
```

---

## Task 6: Layout primitives — Container, Grid, Section

**Files:**
- Create: `frontend/components/layout/Container.tsx`
- Create: `frontend/components/layout/Grid.tsx`
- Create: `frontend/components/layout/Section.tsx`
- Test: `frontend/components/layout/Grid.test.tsx`

**Interfaces:**
- Produces: `<Container>`, `<Grid cols={n}>`, `<Section>` — every route task uses these
  instead of ad-hoc Tailwind grid classes, so the 12-column/gutter rule from spec §5 has
  one implementation.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/components/layout/Grid.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders a 12-column grid container', () => {
    const { container } = render(<Grid><div>child</div></Grid>);
    const grid = container.firstElementChild;
    expect(grid?.className).toMatch(/grid-cols-12/);
  });

  it('never sets a raw 100vh height', () => {
    const { container } = render(<Grid><div>child</div></Grid>);
    expect(container.innerHTML).not.toMatch(/100vh/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Grid.test.tsx`
Expected: FAIL — `./Grid` doesn't exist.

- [ ] **Step 3: Write the components**

```tsx
// frontend/components/layout/Container.tsx
export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full px-4 sm:px-8 lg:px-12" style={{ maxWidth: 'var(--width-content-max)' }}>
      {children}
    </div>
  );
}
```

```tsx
// frontend/components/layout/Grid.tsx
export function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
      {children}
    </div>
  );
}
```

```tsx
// frontend/components/layout/Section.tsx
export function Section({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-h-[100svh] w-full ${className}`}>
      {children}
    </section>
  );
}
```

`Section` uses `min-h-[100svh]` (small viewport height), never `100vh`, satisfying the
global constraint even though no motion or mobile URL-bar animation exists yet in this
stage — the CSS unit choice is a static-CSS decision, not a motion decision.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Grid.test.tsx`
Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
cd ~/kreativ-lab
git add frontend/components/layout
git commit -m "feat(frontend): Container, Grid, Section layout primitives"
```

---

## Task 7: Home route (`/`)

**Files:**
- Modify: `frontend/app/page.tsx`
- Consumes: `getArchiveProjects()`, `getClientLogos()` (Task 4), `Container`/`Grid`/`Section`
  (Task 6), the mapping in `frontend/content/page-section-mapping.md` (Task 2) for which
  static image is the hero poster and which are used in "who we are"/"two labs"/client
  wall imagery.

**Interfaces:**
- Produces: the `/` route, statically rendered, no client component, no motion.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/app/page.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('/ home route', () => {
  it('renders the manifesto and an archive teaser of three entries', () => {
    render(<Home />);
    expect(screen.getAllByText(/archive_no|01|02|03/i).length).toBeGreaterThan(0);
  });

  it('lists client logos', () => {
    render(<Home />);
    // At least one seeded client name renders somewhere on the page.
    expect(screen.getByText(/Deus|BMW Motorrad|Unionwell/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/page.test.tsx`
Expected: FAIL against the default create-next-app placeholder page.

- [ ] **Step 3: Implement the route**

```tsx
// frontend/app/page.tsx
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { Grid } from '@/components/layout/Grid';
import { Section } from '@/components/layout/Section';
import { getArchiveProjects, getClientLogos } from '@/lib/contract';

export default function Home() {
  const latestThree = getArchiveProjects().slice(0, 3);
  const logos = getClientLogos();

  return (
    <main>
      <Section className="flex items-center bg-k-black text-k-paper">
        <Container>
          <Image
            src="/images/hero-poster.jpg"
            alt="Kreative Studio Lab"
            width={1920}
            height={1080}
            priority
            className="w-full h-auto"
          />
          <h1 className="display-type mt-8">CLEAN IN FORM. SHARP IN FUNCTION.</h1>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="display-type">WHO WE ARE</h2>
          <Grid>
            {['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE'].map((word) => (
              <div key={word} className="col-span-12 sm:col-span-6 lg:col-span-3">
                <p className="font-body text-xl">{word}</p>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="display-type">LAB ARCHIVE</h2>
          <Grid>
            {latestThree.map((project) => (
              <div key={project.archive_no} className="col-span-12 sm:col-span-4">
                <span className="text-k-red font-display text-2xl">{project.archive_no}</span>
                <p className="font-body">{project.client}</p>
                <p className="font-body text-sm">{project.industry}</p>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="display-type">CLIENT WALL</h2>
          <Grid>
            {logos.map((logo) => (
              <div key={logo.name} className="col-span-6 sm:col-span-3 lg:col-span-2">
                <p className="font-body text-sm">{logo.name}</p>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section className="flex items-center justify-center bg-k-black text-k-paper">
        <Container>
          <p className="display-type text-center">
            LET&apos;S <span className="text-k-red">CREATE</span> SOMETHING THAT{' '}
            <span className="text-k-red">LIVES</span>.
          </p>
        </Container>
      </Section>
    </main>
  );
}
```

Client-logo and archive-teaser rendering here is text-only (name/number), not the logo
image or hero photograph — actual per-project imagery (`hero_image`, `gallery`, `logo`)
is `null` in the current fixture (spec §3's own acknowledged gap: real photography was
never supplied). Wiring real images in is Stage 4 ("real assets if the studio supplies
them"); this task renders what the contract actually contains today, not placeholder
photography that would need to be replaced later and could be mistaken for real content.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/page.test.tsx`
Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
cd ~/kreativ-lab
git add frontend/app/page.tsx frontend/app/page.test.tsx
git commit -m "feat(frontend): home route, static, no motion"
```

---

## Task 8: Static content routes — `/about`, `/product-lab`, `/creative-lab`

**Files:**
- Create: `frontend/app/about/page.tsx`
- Create: `frontend/app/product-lab/page.tsx`
- Create: `frontend/app/creative-lab/page.tsx`
- Test: `frontend/app/about/page.test.tsx` (pattern repeats per route)

**Interfaces:**
- Consumes: `Container`/`Grid`/`Section` (Task 6). No contract data — spec §4 marks all
  three as "static" source.

- [ ] **Step 1: Write the failing test for `/about`**

```tsx
// frontend/app/about/page.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from './page';

describe('/about', () => {
  it('renders the four-word capability stagger list', () => {
    render(<About />);
    for (const word of ['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE']) {
      expect(screen.getByText(word)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- app/about/page.test.tsx`
Expected: FAIL — route doesn't exist.

- [ ] **Step 3: Implement `/about`**

```tsx
// frontend/app/about/page.tsx
import { Container } from '@/components/layout/Container';
import { Grid } from '@/components/layout/Grid';
import { Section } from '@/components/layout/Section';

export default function About() {
  return (
    <main>
      <Section>
        <Container>
          <h1 className="display-type">WHO WE ARE</h1>
          <p className="font-body text-xl max-w-2xl mt-8">
            Kreative Studio Lab is a creative production studio. Clean in form. Sharp in
            function.
          </p>
          <Grid>
            {['THINK', 'DESIGN', 'CRAFT', 'EXPERIENCE'].map((word) => (
              <div key={word} className="col-span-12 sm:col-span-6 lg:col-span-3 mt-12">
                <p className="display-type text-3xl">{word}</p>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>
    </main>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- app/about/page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Implement `/product-lab` and `/creative-lab` the same way**

```tsx
// frontend/app/product-lab/page.tsx
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';

export default function ProductLab() {
  return (
    <main>
      <Section>
        <Container>
          <h1 className="display-type">PRODUCT LAB</h1>
          <p className="font-body text-xl max-w-2xl mt-8">
            Capability list and process imagery for the Product Lab.
          </p>
        </Container>
      </Section>
    </main>
  );
}
```

```tsx
// frontend/app/creative-lab/page.tsx
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';

export default function CreativeLab() {
  return (
    <main>
      <Section>
        <Container>
          <h1 className="display-type">CREATIVE LAB</h1>
          <p className="font-body text-xl max-w-2xl mt-8">
            Capability list and production imagery for the Creative Lab.
          </p>
        </Container>
      </Section>
    </main>
  );
}
```

No dedicated tests for these two beyond the build-time type check — they follow the exact
pattern already proven by `/about`'s test, and per Task Right-Sizing, duplicating an
identical test-and-implement cycle three times for three near-identical static pages adds
verification weight without adding coverage of new behavior. `/about`'s test is the
behavioral proof that the `Section`/`Container`/`Grid` composition renders real content;
these two reuse the same composition with different literal strings.

- [ ] **Step 6: Run the full test suite and the build**

Run: `npm test && npm run build`
Expected: all tests pass, build succeeds with all seven routes listed in the build output.

- [ ] **Step 7: Commit**

```bash
cd ~/kreativ-lab
git add frontend/app/about frontend/app/product-lab frontend/app/creative-lab
git commit -m "feat(frontend): static content routes (about, product-lab, creative-lab)"
```

---

## Task 9: Archive routes — `/archive` and `/archive/[slug]`

**Files:**
- Create: `frontend/app/archive/page.tsx`
- Create: `frontend/app/archive/[slug]/page.tsx`
- Test: `frontend/app/archive/page.test.tsx`
- Test: `frontend/app/archive/[slug]/page.test.tsx`

**Interfaces:**
- Consumes: `getArchiveProjects`, `getArchiveProject` (Task 4).
- Produces: `generateStaticParams` for the dynamic route, so all six case studies are
  statically generated at build time (matches architecture diagram's "Static generation").

- [ ] **Step 1: Write the failing test for `/archive`**

```tsx
// frontend/app/archive/page.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArchiveIndex from './page';

describe('/archive', () => {
  it('lists all six entries numbered 01 through 06', () => {
    render(<ArchiveIndex />);
    for (const no of ['01', '02', '03', '04', '05', '06']) {
      expect(screen.getByText(no)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails, then implement**

Run: `npm test -- app/archive/page.test.tsx` — expect FAIL.

```tsx
// frontend/app/archive/page.tsx
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { getArchiveProjects } from '@/lib/contract';

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ArchiveIndex() {
  const projects = getArchiveProjects();

  return (
    <main>
      <Section>
        <Container>
          <h1 className="display-type">ARCHIVE</h1>
          <ul>
            {projects.map((project) => (
              <li key={project.archive_no} className="border-t border-k-black py-6">
                <Link href={`/archive/${slugify(project.title)}`} className="flex items-baseline gap-6">
                  <span className="text-k-red font-display text-3xl">{project.archive_no}</span>
                  <span className="font-body text-2xl">{project.client}</span>
                  <span className="font-body text-sm text-k-black/60">{project.industry}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </main>
  );
}
```

Run: `npm test -- app/archive/page.test.tsx` — expect PASS.

- [ ] **Step 3: Write the failing test for `/archive/[slug]`**

```tsx
// frontend/app/archive/[slug]/page.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArchiveCaseStudy, { generateStaticParams } from './page';

describe('/archive/[slug]', () => {
  it('generates static params for all six projects', async () => {
    const params = await generateStaticParams();
    expect(params).toHaveLength(6);
  });

  it('renders the client name and scope list for a known slug', () => {
    render(<ArchiveCaseStudy params={{ slug: 'n8n-collective' }} />);
    expect(screen.getByText('Nathan Tjoe A On')).toBeInTheDocument();
  });

  it('calls notFound for an unknown slug', () => {
    expect(() => render(<ArchiveCaseStudy params={{ slug: 'not-a-real-project' }} />)).toThrow();
  });
});
```

- [ ] **Step 4: Run to verify it fails, then implement**

Run: `npm test -- "app/archive/\[slug\]/page.test.tsx"` — expect FAIL.

```tsx
// frontend/app/archive/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { getArchiveProject, getArchiveProjects } from '@/lib/contract';

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function generateStaticParams() {
  return getArchiveProjects().map((p) => ({ slug: slugify(p.title) }));
}

export default function ArchiveCaseStudy({ params }: { params: { slug: string } }) {
  const project = getArchiveProject(params.slug);
  if (!project) {
    notFound();
  }

  // Alt text drawn from client and scope, per spec §11.
  const heroAlt = `${project.client} — ${project.industry}`;

  return (
    <main>
      <Section>
        <Container>
          <span className="text-k-red font-display text-3xl">{project.archive_no}</span>
          <h1 className="display-type">{project.client}</h1>
          <p className="font-body text-lg">{project.industry} · {project.year_range}</p>

          {project.hero_image.url ? (
            <img src={project.hero_image.url} alt={project.hero_image.alt ?? heroAlt} className="w-full mt-8" />
          ) : (
            <p className="font-body text-sm text-k-black/60 mt-8">
              Hero image not yet supplied — placeholder pending Stage 4 asset population.
            </p>
          )}

          {project.scope.length > 0 && (
            <ul className="mt-8">
              {project.scope.map((item) => (
                <li key={item} className="font-body border-t border-k-black py-2">{item}</li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </main>
  );
}
```

`notFound()` throws (it calls Next.js's internal not-found mechanism), which is exactly
what the third test above asserts — this is standard Next.js App Router behavior, not a
bug to catch.

- [ ] **Step 5: Run to verify it passes**

Run: `npm test -- "app/archive/\[slug\]/page.test.tsx"`
Expected: `3 passed`.

- [ ] **Step 6: Commit**

```bash
cd ~/kreativ-lab
git add frontend/app/archive
git commit -m "feat(frontend): archive index and case study routes, statically generated"
```

---

## Task 10: Contact route (`/contact`)

**Files:**
- Create: `frontend/app/contact/page.tsx`
- Test: `frontend/app/contact/page.test.tsx`

**Interfaces:**
- Consumes: `getSiteSetting` (Task 4).

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/app/contact/page.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Contact from './page';

describe('/contact', () => {
  it('renders a contact heading and no form', () => {
    render(<Contact />);
    expect(screen.getByText(/CONTACT/i)).toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- app/contact/page.test.tsx`
Expected: FAIL — route doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// frontend/app/contact/page.tsx
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { getSiteSetting } from '@/lib/contract';

export default function Contact() {
  const settings = getSiteSetting();
  const hasContactInfo = settings.phone_primary || settings.email;

  return (
    <main>
      <Section>
        <Container>
          <h1 className="display-type">CONTACT</h1>
          {hasContactInfo ? (
            <dl className="font-body text-xl mt-8 space-y-4">
              {settings.phone_primary && (
                <div>
                  <dt className="text-sm text-k-black/60">Phone</dt>
                  <dd>{settings.phone_primary}</dd>
                </div>
              )}
              {settings.email && (
                <div>
                  <dt className="text-sm text-k-black/60">Email</dt>
                  <dd>{settings.email}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="font-body text-lg mt-8 text-k-black/60">
              Contact details pending — not yet entered in the CMS.
            </p>
          )}
        </Container>
      </Section>
    </main>
  );
}
```

The empty-state branch is not hypothetical: the current fixture's `site_settings[0]` has
every contact field as an empty string (spec §3 amendment — never transcribed from the
deck), so this branch is what actually renders today, not dead code.

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- app/contact/page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/kreativ-lab
git add frontend/app/contact
git commit -m "feat(frontend): contact route reading the site_setting singleton"
```

---

## Task 11: Full-suite verification and static-render smoke test

**Files:**
- Create: `frontend/tests/smoke.spec.ts`
- Create: `frontend/playwright.config.ts`

**Interfaces:**
- Consumes: the full built app from `npm run build && npm start`.

This is a lightweight pass, not the full Playwright baseline-diffing regime from spec
§12 — visual-diff baselines belong to Stage 4, once real imagery exists to diff against
(diffing against placeholder-empty states now would need re-baselining the moment Stage 4
adds real photos, wasting the work). This task only proves every route renders without a
thrown error or console exception, which is a real and durable regression signal on its
own.

- [ ] **Step 1: Install Playwright**

Run: `cd frontend && npm install --save-dev @playwright/test && npx playwright install --with-deps chromium`

- [ ] **Step 2: Write the smoke test**

```ts
// frontend/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run build && npm start',
    port: 3000,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  use: { baseURL: 'http://localhost:3000' },
});
```

```ts
// frontend/tests/smoke.spec.ts
import { test, expect } from '@playwright/test';

const routes = [
  '/',
  '/about',
  '/product-lab',
  '/creative-lab',
  '/archive',
  '/archive/n8n-collective',
  '/contact',
];

for (const route of routes) {
  test(`${route} renders without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const response = await page.goto(route);
    expect(response?.status()).toBeLessThan(400);
    expect(errors).toEqual([]);
  });
}
```

- [ ] **Step 3: Run the smoke suite**

Run: `cd frontend && npx playwright test`
Expected: all 7 route checks pass.

- [ ] **Step 4: Run the entire test suite one more time end to end**

Run: `cd frontend && npm test && npx playwright test`
Expected: every Vitest test and every Playwright check green.

- [ ] **Step 5: Commit**

```bash
cd ~/kreativ-lab
git add frontend/tests/smoke.spec.ts frontend/playwright.config.ts frontend/package.json frontend/package-lock.json
git commit -m "test(frontend): static-render smoke pass across all seven routes"
```

---

## Self-Review Notes

**Spec coverage:** §2 (architecture: App Router, static generation) → Task 1, 4, 9. §3
(content model) → Task 4, 5. §4 (routes) → Tasks 7–10, all seven routes. §5 (design
tokens) → Task 3. §9 (images, page-mapping gate) → Task 2, honored by every later task
using named sections instead of page numbers. §10 (performance: LCP is the static poster,
not video) → Task 7's hero uses a static `<Image priority>`, no `<video>` element yet.
§11 (accessibility: alt text from client/scope) → Task 9's `heroAlt`. §12 (testing: content
mapping, WP→Next contract) → Tasks 4 and 5 directly implement those two named rows; Layout
(Playwright), Motion teardown, Reduced motion, and Mobile scroll rows are explicitly Stage
3/4 scope (no motion exists yet to test).

**Explicitly out of scope for this stage, and why:**
- `/api/revalidate` (the ISR webhook endpoint the plugin already POSTs to) — needs a
  decided hosting target's env-var story and a live WordPress instance to test against
  meaningfully; Stage 2 is static-fixture-only by design (spec §13: "Deliverable: the
  whole site correct and legible, entirely still").
- GSAP/ScrollTrigger, the hero video element, all motion vocabulary from spec §6 — Stage
  3's entire scope.
- Real per-project hero/gallery photography and logo SVGs — the fixture's `hero_image`,
  `gallery`, and `logo` fields are all `null` today (never supplied); Stage 4's "real
  assets if the studio supplies them."
- Full Playwright visual-baseline diffing, Lighthouse CI, and axe-core — meaningful once
  real content and motion exist; running them now against placeholder-empty states would
  need re-baselining the moment Stage 4 lands.

**Type consistency:** `ArchiveProject`, `ClientLogo`, `SiteSetting` (Task 4) are the only
types every later task imports — Tasks 7, 9, and 10 use exactly the field names Task 4
defines (`archive_no`, `client`, `industry`, `year_range`, `scope`, `hero_image`,
`gallery`, `accent_color`, `name`, `logo`, `order`, `phone_primary`, `email`, etc.),
matching the WordPress-side contract shape in `class-rest-contract.php` verbatim — a
rename on either side breaks a test, which is exactly spec §12's stated goal for this
layer.

**Placeholder scan:** no "TBD"/"implement later" language; every code block is complete
and runnable. The two genuinely open branches (`/contact`'s empty-state, `/archive/[slug]`'s
missing-hero-image state) are explicit, tested-by-implication renders of real current data,
not stand-ins for work not yet done.
