# Kreative Studio Lab — Website Design Spec

Date: 2026-09-18
Status: Awaiting user review
Author: Taufik + Claude

---

## 1. Purpose and scope

Build the public website for Kreative Studio Lab, a creative production studio working
in product development and creative production. The site replaces the PDF company
profile (`KREATIVE STUDIO LAB - create live archive.pdf`, 26 pages) as the studio's
primary business-development artifact.

Success means: a prospective client lands on the site, understands within one screen
that this is a production studio with real manufacturing capability, browses the six
LAB ARCHIVE case studies, recognises at least one logo from the client wall, and
contacts the studio. It must do this as well on a mid-range Android phone on 4G as on
a desktop.

### In scope (v1)

Seven route types, six case studies, one client logo wall, one contact path.

### Out of scope (v1)

Multi-language toggle, blog or journal, client login, e-commerce, newsletter capture,
case-study filtering or search. Revisit after launch.

---

## 2. Platform architecture

**Decision: headless WordPress.** WordPress is the content store and admin surface.
Next.js is the rendering layer. WordPress renders zero HTML to the public.

```
WordPress (private subdomain)      Next.js (public)
┌─────────────────────────┐        ┌──────────────────────────┐
│ ACF Pro                 │        │ App Router               │
│ CPT: archive_project    │ ──────▶│ Static generation        │
│ CPT: client_logo        │  REST  │ ISR revalidate on webhook│
│ Options: contact, meta  │        │ next/image pipeline      │
└─────────────────────────┘        └──────────────────────────┘
        publish hook ──────────────────────▶ /api/revalidate
```

### Rationale

The studio's archive is numbered and grows — the deck already labels entries `01`
through `06` and calls itself `ISSUE 001`. Entry `07` will exist. Someone who is not a
developer needs to add it. That is the entire case for a CMS, and it is sufficient.

The reason WordPress does not render is scroll ownership. GSAP ScrollTrigger and
ScrollSmoother take control of scroll position and pin behaviour. A WordPress theme
layer — especially once a page builder is installed by a future maintainer — competes
for that control and breaks pinning in ways that are hard to diagnose. Demoting
WordPress to a JSON source removes the conflict permanently rather than by convention.

### Rejected alternatives

- **Classic hand-built WP theme.** One system, cheaper hosting. Rejected because the
  no-page-builder rule is unenforceable over the site's lifetime.
- **Astro static, no CMS.** Fastest and cheapest. Rejected because adding case study
  `07` would require a developer.

### Hosting

Not yet decided by the client. The Next.js front-end targets Vercel or any Node host;
WordPress targets any PHP 8.2+ host. These are independent choices. Deployment detail
belongs in the implementation plan, not here.

---

## 3. Content model

> **Amendment (2026-09-18, post-approval, pre-launch):** this section originally specified
> ACF Pro fields (`scope` as a repeater, contact details as an ACF options page). The studio
> does not hold an ACF Pro license and chose not to buy one, so both are descoped to
> free-ACF-compatible equivalents below. The public REST contract shape (what Next.js
> consumes) is unchanged in both cases — this is purely how WordPress stores and edits the
> data, not what the frontend receives. See the content-layer implementation ledger for the
> full rationale.

### CPT: `archive_project`

| Field | Type | Notes |
|---|---|---|
| `archive_no` | text | Zero-padded, e.g. `01`. Displayed as a corner counter. |
| `title` | post title | e.g. "N8N Collective" |
| `client` | text | e.g. "Nathan Tjoe A On" |
| `industry` | text | e.g. "Clothing Brand" |
| `year_range` | text | e.g. "2025 – 2026" |
| `scope` | textarea, one item per line (was: repeater, ACF Pro only — see amendment above) | Split on newline in the REST contract layer into the same array shape the frontend always received; renders as the asterisked SCOPE OF WORK list |
| `lab` | select | `product` \| `creative` \| `both` |
| `hero_image` | image | Full-bleed opener |
| `gallery` | gallery | Ordered; drives the scrolling right panel |
| `accent_color` | colour picker | Per-project accent; see §5 |

Six entries at launch:

| No | Title | Client | Industry | Year |
|---|---|---|---|---|
| 01 | N8N Collective | Nathan Tjoe A On | Clothing Brand | 2025 – 2026 |
| 02 | DRX Wear | DRX Wear | Sport Brand Apparel | 2024 – 2025 |
| 03 | Howard Smith | Howard Smith | Otomotive Manufacture | 2025 |
| 04 | Cargloss Helmet | Cargloss Helmet | Otomotive Manufacture | 2024 – 2025 |
| 05 | XL Smart Axiata | XL Smart Axiata | Telekomunikasi | 2025 – 2026 |
| 06 | Kemenpora | Kemenpora | Sport Event National | 2025 |

Industry values are reproduced verbatim from the deck, including "Otomotive". Correct
these in the CMS at content-entry time if the studio wants them corrected; do not
silently change them in code.

### CPT: `client_logo`

`name`, `logo` (SVG preferred, PNG accepted), `order`. 25 entries at launch: Deus,
BMW Motorrad, Unionwell, Jägermeister, Howard Smith, Jameson, Von Dutch, Shiny Bright,
Compass, XLSmart, Cargloss, B-LOG, Pocari Sweat, N8N, J&T Express, Garuda Indonesia,
Pertamina, Chelsea, Erspo, DRX, Kominfo, Kemenpora, Sampoerna, Grand Hyatt, and one
mark not legible in the deck export — confirm with the studio.

### CPT: `site_setting` (was: ACF options page — see amendment above)

`acf_add_options_page()` is an ACF Pro-only function; without a license there is no options
page to attach fields to. Replaced with a singleton-by-convention CPT (`site_setting`,
`rest_base` `site-settings`) carrying one published post: `phone_primary`, `phone_secondary`,
`email`, `instagram`, `address`, `og_image`. "Singleton by convention" means WordPress has no
native concept of exactly-one-post — this is enforced editorially (`wp ksl seed` creates
exactly one), not technically; the frontend reads `data[0]` from the collection endpoint.
Values come from the deck's closing card and are entered in the CMS, not hardcoded — seed data
ships with these fields empty because the actual phone/email/Instagram values were never
transcribed from the deck (same conservative stance as the client-logo list's one unconfirmed
mark in §3).

---

## 4. Routes

| Route | Source | Notes |
|---|---|---|
| `/` | static + latest 3 archive | Hero, manifesto, who we are, two labs, archive teaser, client wall, closing |
| `/about` | static | WHO WE ARE long form, THINK / DESIGN / CRAFT / EXPERIENCE |
| `/product-lab` | static | Capability list, process imagery |
| `/creative-lab` | static | Capability list, production imagery |
| `/archive` | all `archive_project` | Six entries, numbered |
| `/archive/[slug]` | one `archive_project` | Hero, scope, gallery |
| `/contact` | `site_setting` (singleton) | Contact details, no form in v1 |

No contact form in v1. The studio's deck lists two WhatsApp-capable numbers and an
email; a form adds spam handling, a mail transport dependency, and a data-protection
question for no measured gain. Add one post-launch if the studio asks.

---

## 5. Design tokens

### Colour

```css
--k-red:    #F81010;  /* sampled from deck; see caveat */
--k-black:  #000000;
--k-paper:  #FFFFFF;
```

Three colours. No greys — apparent greys in the deck are halftone screens of black,
reproduced as image content, not as CSS colour.

**Caveat on `--k-red`:** sampled from JPEG-compressed deck exports, clustering at
`(248,16,16)` and `(248,0,0)`. The true brand value is most likely a pure or near-pure
red and may be specified as a Pantone. It is defined here as a single token so that
replacing it with the studio's real value is a one-line change. Ask for the brand guide.

Per-project `accent_color` exists because the case studies are chromatically distinct —
N8N is saturated blue, DRX is red, Howard Smith is pink and black, Cargloss is
multicolour, XL Smart is green and blue, Kemenpora is a four-colour system. The accent
tints only that project's own counter and keyline, never the site chrome.

### Typography

Licensed Helvetica Now Condensed is unavailable; free substitutes confirmed by the
client.

```css
--font-display: 'Anton', sans-serif;      /* compressed black grotesque */
--font-body:    'Archivo', sans-serif;    /* variable, neutral grotesque */
```

`Anton` is the closest free match to the compressed black grotesque used for
`LAB ARCHIVE`, `SCOPE OF WORK`, `WHO WE ARE`, `PRODUCT LAB`. It ships one weight only,
which is acceptable because the deck uses that lockup at a single weight.

`Archivo` (variable, 100–900) covers body copy and the medium-weight capability lists.

Both self-hosted as subset woff2, `font-display: swap`, preloaded. No Google Fonts
network request.

Display type is set flush-left, tight (`letter-spacing: -0.02em`), and large —
`clamp(3rem, 12vw, 11rem)` for section openers. The deck sets headlines hard against
the page edge; the web version matches this down to a 16px minimum gutter.

### Scale and grid

12-column grid. Gutter 16px on mobile, 32px from 768px, 48px from 1280px. Max content
width 1680px. Spread sections use a 50/50 split at ≥1024px that collapses to stacked
below 1024px.

---

## 6. Motion

### Stack

`gsap`, `ScrollTrigger`, `ScrollSmoother`. Nothing else.

Three.js, Locomotive Scroll, Framer Motion, and React Bits are explicitly excluded.
Three.js because the identity is print-editorial and a 3D scene contradicts it at a
cost of roughly 600 KB. Locomotive because ScrollSmoother does the same work while
sharing ScrollTrigger's internals rather than racing them, and because Locomotive's
transform-based virtual scroll degrades mobile momentum scrolling. Framer Motion
because it duplicates GSAP. This exclusion is a design decision, not an oversight;
reversing it means re-opening this spec.

### Per-section vocabulary

| Section | Motion |
|---|---|
| Hero | Video loop, `KREATE LIVE` marquee band, headline clip-path mask reveal |
| Manifesto | Line-by-line reveal on a 60ms stagger |
| Who we are | THINK / DESIGN / CRAFT / EXPERIENCE stagger up, halftone cards |
| Two labs | Pinned; two circles converge into the Venn on scrub |
| Lab capability lists | Reveal per line (keyline wipe removed — see amendment below) |
| Archive index | Six rows; `01`–`06` counter increments in the fixed corner |
| Case study | Pinned left hero, scrolling right gallery — mirrors the deck spread |
| Client wall | Name grid in display type, 40ms stagger, red-and-scale on hover (see amendment below) |
| Closing | `LET'S CREATE SOMETHING THAT LIVES.` with CREATE and LIVES in red |

> **Amendment (2026-09-19, post-Stage-4):** parallax is added to the vocabulary. Every
> deck figure on every route drifts against the page — 0.85 for a full-bleed section
> figure, 0.92 for a stacked gallery spread, both named in `lib/parallax.ts` so the whole
> site drifts by the same amounts. The studio's note was that the design reads as generic
> without depth. Implemented as a scrubbed ScrollTrigger on `yPercent`, deliberately not
> ScrollSmoother's `data-speed`: the smoother runs only above 1024px and only if it
> initialised, and its runtime state has never been confirmed in a browser, whereas this
> works at every width either way. Drift is capped at 12% of the element's own height so
> a figure cannot slide out of its section, and is disabled entirely under reduced
> motion, where the content sits exactly where the layout put it.
>
> Parallax alone does not answer "generic". It adds depth to the elements that exist; it
> does not change that every section is the same full-width stack of headline, figure and
> list, on a 12-column grid the routes barely use. That is a layout question and it is
> still open.

> **Amendment (2026-09-19, post-Stage-4):** the client wall is a grid of client names
> set in display type, not a grid of marks. The 24 marks do not exist as files — every
> `client_logo` entry carries a null image URL and the deck supplies only page 24, a
> single raster with all of them baked in — so a per-mark hover was not buildable. Each
> name flips to red and scales up under the cursor, which is the interaction the studio
> asked for; the 40ms stagger is unchanged. This is weaker than the real thing and
> knowingly so: a wall of names reads as a client list, a wall of marks reads as proof.
> When the artwork arrives, each cell takes an `<img>` and the grid, stagger and hover
> stay as they are. Deck page 24 is no longer used by any route.

> **Amendment (2026-09-19, post-Stage-4):** the red keyline wipe above each capability
> group is removed. It was the one piece of this vocabulary the studio rejected on
> sight — a hairline rule drawing itself above a list reads as a template flourish
> rather than as the studio's own motion. The per-line stagger stays; nothing replaces
> the keyline. `.k-keyline` and the `data-revealed` state that existed only to drive it
> are deleted from `CapabilityList`, and `CapabilityList.test.tsx` now asserts their
> absence so the rule cannot return by accident.

### Rules

Animate `transform` and `opacity` only. Anything else is a bug. No layout-triggering
property inside a scroll handler. All ScrollTriggers registered through a single
`useGSAP` context per route so they tear down on navigation.

### Reduced motion

`prefers-reduced-motion: reduce` disables ScrollSmoother, replaces every scrub with its
static end-state, stops all marquees, and swaps the hero video for
`hero-still-reduced.jpg`. The site must be fully legible and navigable in this state.

---

## 7. Mobile

Mobile is the priority surface, not the fallback.

- ScrollSmoother is disabled below 1024px. Native scroll and momentum are preserved.
- Every pinned section becomes a stacked section. No pinning below 1024px.
- The Venn convergence becomes two stacked circles, no scrub.
- Marquees continue — a CSS transform loop is cheap and carries the brand.
- `100vh` is never used; `100svh` / `100dvh` only, so the mobile URL bar does not cause
  a layout jump.
- Tap targets minimum 44×44px.
- The hero video is served at 720p below 768px.

---

## 8. Video

The hero loop is an 8.0s, 1920×1080, 24fps clip; source is 6.07 MB at roughly 6 Mbps.

**Decision: H.264 MP4 only. No HLS, no WebM.**

HLS was requested and is rejected. It exists for adaptive bitrate on long-form video;
for an 8-second decorative loop it adds a manifest, segment files, and the hls.js
runtime (~40 KB) while complicating reliable autoplay-loop on iOS Safari. If the studio
later publishes a real 2–3 minute brand film, HLS becomes appropriate for that asset
and only that asset.

WebM was specified in an earlier draft and is also rejected, on measurement rather than
principle. Transcoding this source produced:

| Output | Codec | Size |
|---|---|---|
| `hero-1080.mp4` | H.264 CRF 27 | 1.31 MB |
| `hero-720.mp4` | H.264 CRF 28 | 1.00 MB |
| `hero-1080.webm` | VP9 CRF 36 | 2.53 MB |
| `hero-720.webm` | VP9 CRF 38 | 1.18 MB |

VP9 is roughly twice the size of H.264 at every tier on this content, because the source
is an AI-generated image sequence with high-frequency detail that VP9 handles poorly.
Shipping MP4 alone is both smaller and simpler, and H.264 has universal support
including iOS.

Delivery: `<video muted loop playsinline preload="metadata">` with
`poster="hero-poster.jpg"`; 720p source below 768px, 1080p above.

---

## 9. Images

All 26 deck pages were extracted at their embedded resolution of 2048×1448 (175 ppi),
totalling 8.2 MB. Derivatives generated at 1920 / 1280 / 768 / 420px wide in WebP q82:
104 files, 8.8 MB, averaging 179 KB at 1920.

**Known limitation, accepted by the client:** these are deck exports, not originals.
2048px is adequate for full-bleed at 1× and for any phone, and soft on a 2× desktop
display at full-bleed. Where a page is used full-bleed on desktop, prefer a crop over
an upscale.

**Halftone compression:** halftone pages compress badly — page 01 is 507 KB and page 10
is 621 KB at 1920, against a 179 KB average, because dither noise is worst-case for
lossy codecs. Where a halftone treatment is decorative rather than content, apply it as
a CSS or SVG filter over a clean photograph instead of shipping a pre-halftoned raster.

Raw pages are in `assets/raw/`, derivatives in `assets/web/`, video in `assets/video/`.

**Page-to-section mapping is not yet verified.** The ordering assumed during extraction
is plausible but unconfirmed. Verifying each of the 26 pages against its target section
is an explicit task in the implementation plan, and no layout work should depend on the
assumed order until that task is done.

---

## 10. Performance budget

Measured on a mid-range Android over simulated 4G, on `/` and `/archive/[slug]`.

| Metric | Budget |
|---|---|
| LCP | < 2.5s |
| CLS | < 0.05 |
| INP | < 200ms |
| JS transferred, initial route | < 180 KB gzipped |
| Largest single image, initial viewport | < 200 KB |

GSAP core plus ScrollTrigger plus ScrollSmoother is roughly 70 KB gzipped, which is the
majority of the JS budget and the reason nothing else joins it.

Every image below the fold is lazy. The hero video does not block LCP — the poster frame
is the LCP element and is preloaded.

---

## 11. Accessibility

WCAG 2.2 AA.

Red `#F81010` on white measures 4.0:1, which fails AA for body text. Red is therefore
restricted to display type at 24px and above, and to non-informational keylines. It is
never used for body copy or small labels. If the studio's real brand red differs, this
ratio must be re-measured and this rule re-derived.

All motion respects `prefers-reduced-motion`. Pinned sections remain keyboard-reachable
in document order. Every image carries meaningful alt text drawn from its project's
client and scope.

---

## 12. Testing

Motion-heavy sites fail in ways unit tests do not catch, so the weight is on visual and
behavioural checks rather than coverage percentage.

| Layer | Approach |
|---|---|
| Content mapping | Snapshot test per `archive_project`: the six entries' `archive_no`, `client`, `industry`, `year_range` and `scope` length match the table in §3 |
| WP → Next contract | Contract test against a recorded REST fixture; a field rename in ACF must fail the build, not ship an empty section |
| Layout | Playwright screenshots at 390 / 768 / 1280 / 1920 on every route, diffed against approved baselines |
| Motion teardown | Assert `ScrollTrigger.getAll().length === 0` after navigating away from each route — the single most likely source of a memory leak here |
| Reduced motion | Full Playwright pass with `prefers-reduced-motion: reduce`; every route must render its static end-state and remain navigable |
| Mobile scroll | Manual check on a real iOS and a real Android device that native momentum is intact and no `100vh` jump occurs. Emulation does not reproduce this. |
| Performance | Lighthouse CI on `/` and one `/archive/[slug]`, failing the build on any §10 budget breach |
| Accessibility | axe-core in CI, plus a manual keyboard pass through every pinned section |

The mobile scroll check is deliberately manual. Momentum scrolling and URL-bar
behaviour are the two things this build is most likely to get wrong and the two things
no emulator reproduces faithfully.

---

## 13. Decomposition

> **Amendment (2026-09-19, post-Stage-2, pre-launch):** the original four-stage
> decomposition below is superseded. It layered the build horizontally — all structure,
> then all motion, then all content — and asserted that Stage 2 was "independently
> shippable."
>
> That assertion contradicted §1. §1 defines success as a prospective client
> understanding within one screen that this is a production studio with real
> manufacturing capability. A still page with no imagery and no hero cannot do that, so
> Stage 2 was never independently shippable in the sense §1 requires. Stage 2 shipped on
> 2026-09-18 and demonstrated exactly this: correct routing, correct data, passing tests,
> and a page that reads as an unstyled document. The defect was in this section, not in
> the Stage 2 implementation.
>
> **Governing rule, replacing "Stage 2 must be independently shippable":** every stage
> must be visually complete for the routes it covers. No stage delivers structure
> without identity. A stage may cover fewer routes; it may not cover a route halfway.

### Superseded staging (2026-09-18)

1. Content layer. 2. Shell and design system, still. 3. Motion system. 4. Content
population and hardening. Retained here for the record only.

### Current staging (2026-09-19)

**Stage 1 — Content layer.** Complete. WordPress, both CPTs, REST shape, frozen fixture
at `wordpress/plugins/kreative-studio-lab/tests/fixtures/rest-contract.json`. WordPress
is not in the render path; the front-end reads a committed copy of that fixture.

**Stage 2 — Data and routing foundation.** Complete, retained. Next.js app, contract
types, fixture loader, seven routes, layout primitives, test suite. Its visual output is
superseded by Stage 3, but its data layer, routing, and tests carry forward unchanged.

**Stage 3 — Homepage vertical slice and shared foundation.** The homepage taken to full
visual and motion fidelity, and in doing so, building the foundation every later route
reuses: self-hosted Anton and Archivo per §5, the navigation and footer shell, the
imagery pipeline against `assets/web/`, the hero video per §8, the GSAP context and
ScrollSmoother setup per §6, and the three reusable motion primitives — marquee loop,
clip-path mask reveal, and staggered section reveal. Deliverable: one route that is
finished, against which the visual direction can be accepted or redirected cheaply.

**Stage 4 — Route fan-out.** The remaining six routes composed from Stage 3's primitives
and the verified deck imagery. Mostly composition rather than new invention.

**Stage 5 — Expensive tail, explicitly droppable.** The pinned Venn convergence, the
pinned case-study spread, mobile pin-to-stack conversion per §7, reduced-motion paths per
§6, and the performance and accessibility passes per §10 and §11. This stage is ordered
last because each item is individually severable. If the schedule compresses, work is cut
from here, and the site remains coherent without it.

### Corrections carried into Stage 3

Two defects in the Stage 2 implementation are corrections against this spec as already
written, not amendments to it:

1. **Fonts.** Stage 2 used `next/font/google`, which fetches from Google at build time.
   §5 already requires both faces self-hosted as subset woff2 with no Google Fonts
   network request. The observed failure mode is a silent fallback to a system grotesque
   with no build error, which destroys the display identity. Stage 3 must implement §5 as
   written.
2. **Imagery.** §9 blocked layout work on the deck imagery only "until the
   page-to-section mapping task is done." That task completed during Stage 2 and the
   mapping is verified. The block is therefore cleared, and the 104 derivatives in
   `assets/web/` are the source imagery for v1. The fixture's null image fields do not
   gate this; WordPress-supplied imagery takes precedence only once it exists.

---

## 14. Open questions

1. Brand red — exact hex or Pantone from the studio's brand guide.
2. The one illegible logo on the client wall.
3. Hosting target for both WordPress and the front-end.
4. Whether deck spellings such as "Otomotive" should be corrected.
5. Vector (SVG) artwork for the crossed-K mark — currently raster only.
