// The Crency-direction moves (2026-09-24): letter-built hero headline, scrubbed statement,
// dealt cards, magnetic call to action. jsdom has no layout, so none of this can assert
// what the motion looks like — that was checked in a browser. What it can hold is the
// contract each primitive makes: real text for assistive technology, content in place
// whenever motion is off, and no tweens left behind once a route unmounts.
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { Magnetic } from './Magnetic';
import { SlideIn } from './SlideIn';
import { SplitHeadline } from './SplitHeadline';
import { WordReveal } from './WordReveal';

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

describe('SplitHeadline', () => {
  it('is named by its sentence, not by a pile of letters', () => {
    setReducedMotion(false);
    render(<SplitHeadline as="h1" text="CLEAN IN FORM." />);
    expect(screen.getByRole('heading', { name: 'CLEAN IN FORM.' })).toBeInTheDocument();
  });

  it('hides the per-letter spans from assistive technology', () => {
    setReducedMotion(false);
    const { container } = render(<SplitHeadline as="h1" text="CLEAN IN FORM." />);
    const chars = container.querySelectorAll('[data-split-char]');
    expect(chars).toHaveLength('CLEANINFORM.'.length);
    for (const char of chars) expect(char.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('touches no letter under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<SplitHeadline as="h1" text="CLEAN" />);
    for (const char of container.querySelectorAll<HTMLElement>('[data-split-char]')) {
      expect(char.style.transform).toBe('');
      expect(char.style.opacity).toBe('');
    }
  });
});

describe('WordReveal scrub', () => {
  it('records its mode and keeps the sentence readable', () => {
    setReducedMotion(false);
    const { container } = render(<WordReveal as="p" text="LET'S CREATE" scrub />);
    expect(container.querySelector('[data-word-reveal]')?.getAttribute('data-word-reveal')).toBe(
      'scrub'
    );
    expect(screen.getByText("LET'S")).toBeInTheDocument();
  });

  it('never parks a scrubbed word half-transparent (spec §5: no greys)', () => {
    setReducedMotion(false);
    const { container } = render(<WordReveal as="p" text="LET'S CREATE" scrub />);
    for (const word of container.querySelectorAll<HTMLElement>('[data-word]')) {
      expect(word.style.opacity).toBe('');
    }
  });

  it('leaves every word in place under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<WordReveal as="p" text="LET'S CREATE" scrub />);
    for (const word of container.querySelectorAll<HTMLElement>('[data-word]')) {
      expect(word.style.transform).toBe('');
    }
  });
});

describe('SlideIn deal', () => {
  it('keeps its direction marker, so the alternation stays testable', () => {
    setReducedMotion(false);
    const { container } = render(
      <SlideIn from="right" deal>
        <p>DESIGN</p>
      </SlideIn>
    );
    expect(container.querySelector('[data-slide-in]')?.getAttribute('data-slide-in')).toBe('right');
  });

  it('never holds a dealt card half-transparent', () => {
    setReducedMotion(false);
    const { container } = render(
      <SlideIn from="left" deal>
        <p>THINK</p>
      </SlideIn>
    );
    expect((container.querySelector('[data-slide-in]') as HTMLElement).style.opacity).toBe('');
  });
});

describe('Magnetic', () => {
  it('renders its child untouched', () => {
    setReducedMotion(false);
    render(
      <Magnetic>
        <a href="/contact">START A PROJECT</a>
      </Magnetic>
    );
    expect(screen.getByRole('link', { name: 'START A PROJECT' })).toBeInTheDocument();
  });
});

describe('choreography teardown (spec §6)', () => {
  it('leaves no live tweens behind when the moves unmount', () => {
    setReducedMotion(false);
    const baseline = gsap.globalTimeline.getChildren().length;

    const { unmount } = render(
      <>
        <SplitHeadline as="h1" text="CLEAN IN FORM." />
        <WordReveal as="p" text="LET'S CREATE" scrub />
        <SlideIn from="left" deal>
          <p>THINK</p>
        </SlideIn>
      </>
    );

    expect(gsap.globalTimeline.getChildren().length).toBeGreaterThan(baseline);

    unmount();

    expect(gsap.globalTimeline.getChildren().length).toBe(baseline);
  });
});

// ── Crency layout pass (2026-09-24b) ────────────────────────────────────────────────

import { CardFan, burstPoints } from './CardFan';
import { ChipStatement, chipSlots } from './ChipStatement';
import { Gather, scatterFor } from './Gather';
import { Highlight } from './Highlight';
import { OffsetHeading, splitLines } from './OffsetHeading';
import { Signpost } from './Signpost';
import { TornEdge, tearPoints } from './TornEdge';

describe('splitLines', () => {
  it('breaks at the sentence nearest the middle', () => {
    expect(splitLines('IDEAS ARE EVERYWHERE. WE MAKE THEM *REAL.*')).toEqual([
      'IDEAS ARE EVERYWHERE.',
      'WE MAKE THEM *REAL.*',
    ]);
  });

  it('falls back to the middle word when there is no sentence break', () => {
    expect(splitLines('ONE TWO THREE FOUR')).toEqual(['ONE TWO', 'THREE FOUR']);
  });
});

describe('OffsetHeading', () => {
  it('is named by the whole sentence, with a space between its lines', () => {
    setReducedMotion(false);
    render(<OffsetHeading text="IDEAS ARE EVERYWHERE. WE MAKE THEM *REAL.*" />);
    expect(
      screen.getByRole('heading', { name: 'IDEAS ARE EVERYWHERE. WE MAKE THEM REAL.' })
    ).toBeInTheDocument();
  });

  it('swaps at most one letter per line', () => {
    setReducedMotion(true);
    const { container } = render(<OffsetHeading text="GOOD COSTS. CROSS COLOSSAL SCISSORS." />);
    for (const line of container.querySelectorAll('[data-line]')) {
      expect(line.querySelectorAll('[data-swap]').length).toBeLessThanOrEqual(1);
    }
  });
});

describe('chipSlots', () => {
  it('spreads chips through the sentence and never after its last word', () => {
    const slots = chipSlots(10, 4);
    expect(slots).toHaveLength(4);
    expect(Math.max(...slots)).toBeLessThan(9);
    expect(new Set(slots).size).toBe(slots.length);
  });
});

describe('ChipStatement', () => {
  it('reads as the plain sentence', () => {
    setReducedMotion(false);
    const { container } = render(
      <ChipStatement text="We build products people keep" chips={[{ src: '/a.webp' }]} />
    );
    expect(container.textContent?.replace(/\s+/g, ' ').trim()).toBe('We build products people keep');
  });

  it('never parks a word half-transparent', () => {
    setReducedMotion(false);
    const { container } = render(<ChipStatement text="We build things" chips={[]} />);
    for (const word of container.querySelectorAll<HTMLElement>('[data-word]')) {
      expect(word.style.opacity).toBe('');
    }
  });
});

describe('deterministic shapes', () => {
  it('tears the same edge for the same seed, and a different one for another', () => {
    expect(tearPoints(3)).toBe(tearPoints(3));
    expect(tearPoints(3)).not.toBe(tearPoints(4));
  });

  it('keeps every tear point inside the box', () => {
    for (const point of tearPoints(7).split(' ')) {
      const [x, y] = point.split(',').map(Number);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
  });

  it('scatters the same way on every visit', () => {
    expect(scatterFor(5)).toEqual(scatterFor(5));
  });

  it('draws a burst with twice as many corners as spikes', () => {
    expect(burstPoints(14).split(' ')).toHaveLength(28);
  });
});

describe('TornEdge', () => {
  it('fills with a brand colour and is hidden from assistive technology', () => {
    setReducedMotion(false);
    const { container } = render(<TornEdge from="black" seed={1} />);
    const svg = container.querySelector('[data-torn-edge]') as SVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelector('polygon')?.getAttribute('fill')).toBe('var(--k-black)');
  });
});

describe('Highlight', () => {
  it('marks only the starred words and keeps the sentence readable', () => {
    setReducedMotion(false);
    const { container } = render(<Highlight text="People *care* about it." />);
    expect(container.textContent).toBe('People care about it.');
    expect(container.querySelectorAll('[data-mark]')).toHaveLength(1);
  });
});

describe('Signpost', () => {
  it('is a real link named by its label', () => {
    setReducedMotion(false);
    render(
      <Signpost href="/archive" point="left">
        See everything
      </Signpost>
    );
    expect(screen.getByRole('link', { name: 'See everything' })).toHaveAttribute('href', '/archive');
  });
});

describe('layout-pass teardown (spec §6)', () => {
  it('leaves no live tweens behind when the new moves unmount', () => {
    setReducedMotion(false);
    const baseline = gsap.globalTimeline.getChildren().length;
    const { unmount } = render(
      <>
        <OffsetHeading text="ONE LINE. TWO LINES." />
        <ChipStatement text="We build things people keep" chips={[{ src: '/a.webp' }]} />
        <TornEdge from="paper" seed={2} />
        <Highlight text="People *care*." />
        <Signpost href="/x">X</Signpost>
        <Gather>
          <span>a</span>
          <span>b</span>
        </Gather>
        <CardFan>
          <article>a</article>
        </CardFan>
      </>
    );
    expect(gsap.globalTimeline.getChildren().length).toBeGreaterThan(baseline);
    unmount();
    expect(gsap.globalTimeline.getChildren().length).toBe(baseline);
  });
});
