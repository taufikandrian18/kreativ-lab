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
