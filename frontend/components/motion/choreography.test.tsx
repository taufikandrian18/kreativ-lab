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
