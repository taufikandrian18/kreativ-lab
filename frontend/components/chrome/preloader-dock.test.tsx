import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PRELOADER_BOOT, PRELOADER_SEEN, Preloader } from './Preloader';
import { MobileDock } from './MobileDock';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

function stubMotion(reduce: boolean) {
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

const boot = () => new Function(PRELOADER_BOOT)();
const state = () => document.documentElement.getAttribute('data-preloader');

beforeEach(() => {
  sessionStorage.clear();
  document.documentElement.removeAttribute('data-preloader');
});
afterEach(() => vi.unstubAllGlobals());

describe('preloader boot (runs in <head> before first paint)', () => {
  it('turns the curtain on for the first page of a visit', () => {
    stubMotion(false);
    boot();
    expect(state()).toBe('on');
  });

  it('stays off for the rest of the visit', () => {
    stubMotion(false);
    sessionStorage.setItem(PRELOADER_SEEN, '1');
    boot();
    expect(state()).toBe('off');
  });

  it('never shows under reduced motion', () => {
    stubMotion(true);
    boot();
    expect(state()).toBe('off');
  });
});

describe('Preloader', () => {
  it('is hidden from assistive technology and carries the vector mark, not the 107px PNG', () => {
    stubMotion(false);
    const { container } = render(<Preloader />);
    const curtain = container.querySelector('#k-preloader') as HTMLElement;
    expect(curtain.getAttribute('aria-hidden')).toBe('true');
    expect(curtain.querySelector('[data-mark-ring]')).not.toBeNull();
    expect(curtain.querySelector('[data-mark-k]')?.getAttribute('d')?.length).toBeGreaterThan(100);
    expect(curtain.innerHTML).not.toContain('studiolab-mark.png');
  });
});

const NAV = [
  { name: 'About', href: '/about' },
  { name: 'Archive', href: '/archive' },
];
const LABELS = { menu: 'Menu', cta: "Let's talk", work: 'Work', close: 'Close' };

describe('MobileDock', () => {
  it('offers the menu, the call to action and the work as full tap targets', () => {
    stubMotion(true);
    render(<MobileDock nav={NAV} labels={LABELS} />);
    expect(screen.getByRole('button', { name: 'Menu' }).className).toContain('min-h-11');
    expect(screen.getByRole('link', { name: "Let's talk" })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/archive');
  });

  it('opens the menu as a modal dialog with every route, and Escape closes it', () => {
    stubMotion(true);
    render(<MobileDock nav={NAV} labels={LABELS} />);
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    expect(document.activeElement?.textContent).toBe('About');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
