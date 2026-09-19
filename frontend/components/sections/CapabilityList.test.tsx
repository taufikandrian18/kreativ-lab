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
