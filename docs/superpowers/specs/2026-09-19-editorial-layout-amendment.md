# Amendment — Editorial Layout and Type Scale

**Amends:** `docs/superpowers/specs/2026-09-18-kreative-studio-lab-design.md` §5 (design tokens) and §6 (motion), and adds a new §5a.

**Date:** 2026-09-19. **Status:** proposed, not yet approved.

---

## Why this exists

Stages 1 through 4 delivered the spec faithfully. The studio's verdict on the running
site was that it "is generic" and that the reference — the Crency-style work in the
project's own notes — was not reached. Both are true, and neither was an implementation
failure. This amendment records what the site actually does wrong, from a browser session
on 2026-09-19, and what the spec has to say differently for the next stage to fix it.

Three things were fixed on sight and are already merged; they are listed here only so the
record is complete:

- ScrollSmoother never initialised at all (`gsap.context()` scope vs selector string), so
  no scroll motion of any kind was running.
- The hero clipped its own headline.
- Sections collided, because a flat 96px of padding sat under 176px display type.

What remains is not a defect list. It is a design problem, and the spec is where it lives.

## What the running site looks like, in evidence

Measured and screenshotted at 1680×784 on 2026-09-19, after the three fixes above.

1. **Two type sizes exist.** `--display-type` is `clamp(3rem, 12vw, 11rem)` — 176px at
   this width — and body copy is 16–20px. There is nothing in between. Every heading on
   every route is set at the same maximum, so nothing is subordinate to anything else and
   no section is quieter than its neighbour. A page where everything shouts reads as a
   template, because templates are what have no hierarchy.
2. **Every section is the same shape.** Headline, full-bleed figure, list. Seven times on
   `/`, once per route elsewhere. §4 describes what each section contains and §6 describes
   how each one moves, but nothing in the spec says any two sections should be *built*
   differently, so they are not.
3. **The grid is declared and unused.** §5 specifies 12 columns, a gutter ladder and a
   1680px cap, and `.section-shell` implements all three. The routes then put everything
   in one full-width column. On `/product-lab` the headline, both paragraphs and all
   twelve capabilities sit in the left ~35% of the viewport; the remaining 60% is empty
   white. The archive teaser is the one section that spans columns deliberately — and it
   is the one section that reads as designed.
4. **Nothing overlaps, breaks the column, or bleeds.** Every element begins and ends
   inside the same box. The deck the site is built from does none of this: its pages
   crop, overlap and run type across imagery.

## §5a — Editorial layout (new)

### Type scale

Three steps, not two. Each is a token in `globals.css`:

| Token | Size | Use |
|---|---|---|
| `--type-display` | `clamp(2.5rem, 7vw, 7rem)` | Route and section openers |
| `--type-subhead` | `clamp(1.5rem, 2.6vw, 2.75rem)` | Group headings, capability groups, client names, pull quotes |
| `--type-body` | `clamp(1rem, 1.1vw, 1.25rem)` | Everything else |

The display step comes **down** from 11rem to 7rem. A 176px headline is not large because
it is impressive; it is large because nothing else competes with it. Introducing a middle
step is what lets the display step shrink and still lead.

Existing rules carry over unchanged: flush-left, `letter-spacing: -0.02em`, red permitted
only on the display and subhead steps (both are above 24px at every viewport).

### Column discipline

Every section declares a column span rather than defaulting to full width. On the
12-column grid, at 1280px and above:

- **Opener** — headline spans 8, starts at 1.
- **Body copy** — spans 5, starts at 1. A 60ch measure that stops at column 5 instead of
  floating in an empty 1680px row.
- **List or grid content** — spans 6 or 7, starts at 6 or 7, so it sits *beside* the copy
  rather than under it. This alone removes the empty right-hand half of both lab routes.
- **Figure** — spans 7 to 12, and is permitted to bleed past the 1680px cap to the
  viewport edge. One bleed per route maximum.

Below 1024px every span collapses to 12. Mobile is a single column and stays one.

### Asymmetry

At least one element per route must break the column it is nominally in: a figure
bleeding right, a headline overhanging a figure's top edge, a number set in the margin.
The rule is "at least one and not more than two" — the point is a deliberate exception,
and an exception that happens in every section is just a second grid.

## §6 — Motion, amended

Parallax is already in the vocabulary (amended earlier today). Two additions, both of
which depend on §5a landing first, because motion on a flat layout only makes a flat
layout move:

- **Scroll-linked type scale on route openers.** The display headline tracks scroll
  progress on `scale` and `yPercent` only, so a route opener is not a static slab.
- **Figure reveal on the bleed.** A bleeding figure enters with a clip-path wipe from its
  bleed edge, which is the deck's own gesture — its pages crop hard rather than fading.

### What is still explicitly excluded

§6's stack exclusion stands and is **not** amended: no Three.js, Locomotive, Framer
Motion or React Bits. A preloader, a custom cursor and a scroll-progress indicator were
all raised during the Stage 4 review and are all declined here, for one reason each:

- **Preloader** — the LCP budget in §10 is 2.5s on a mid-range Android. A preloader
  spends that budget on itself.
- **Custom cursor** — desktop-only by definition, on a site whose §7 names mobile the
  priority surface.
- **Scroll-progress indicator** — it is chrome about the page rather than the page. §6's
  archive counter already does this job where it earns its place.

These are judgement calls, not laws. If the studio wants any of them, this section is
where to overturn it — but each costs something named above, and the cost should be paid
knowingly.

## What this does not fix

The client wall is 24 names in type because no logo artwork exists. No layout change
makes a name read like a mark. That gap closes when the 24 files arrive, and not before.

## Exit condition

This amendment is satisfied when a stranger shown `/`, `/product-lab` and one case study
cannot describe the site as "a stack of full-width sections", and when no viewport at
1680px contains two elements set at the same type step.
