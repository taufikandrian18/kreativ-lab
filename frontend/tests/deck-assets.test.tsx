import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ClientWall } from '../components/sections/ClientWall';
import { WhoWeAre } from '../components/sections/WhoWeAre';
import { TwoLabs } from '../components/sections/TwoLabs';
import { SlideIn } from '../components/motion/SlideIn';
import { getClientLogos } from '../lib/contract';
import { CLIENT_MARKS } from '../lib/client-marks';

afterEach(() => vi.unstubAllGlobals());

describe('client marks extracted from deck page 24', () => {
  it('has a mask file on disk for every mark', () => {
    expect(CLIENT_MARKS.length).toBe(25);
    for (const mark of CLIENT_MARKS) {
      expect(existsSync(join(__dirname, '../public', mark.file))).toBe(true);
    }
  });

  it('covers every client the fixture names', () => {
    const marks = new Set(CLIENT_MARKS.map((m) => m.name));
    for (const logo of getClientLogos()) expect(marks.has(logo.name)).toBe(true);
  });

  it('renders the wall as marks, each carrying its name for assistive tech', () => {
    render(<ClientWall />);
    expect(screen.getAllByTestId('client-cell')).toHaveLength(CLIENT_MARKS.length);
    for (const logo of getClientLogos()) expect(screen.getByLabelText(logo.name)).toBeInTheDocument();
  });

  it('keeps the hover treatment the type grid had', () => {
    render(<ClientWall />);
    for (const cell of screen.getAllByTestId('client-cell')) {
      expect(cell.className).toMatch(/hover:text-k-red/);
      expect(cell.className).toMatch(/hover:scale-/);
    }
  });

  it('paints each mark with currentColor through a mask, so hover can recolour it', () => {
    const { container } = render(<ClientWall />);
    const mark = container.querySelector('[data-client-mark]') as HTMLElement;
    expect(mark.style.maskImage || mark.style.webkitMaskImage).toContain('/logos/');
    expect(mark.style.backgroundColor).toBe('currentcolor');
  });
});

describe('WhoWeAre pillar cards', () => {
  it('shows the four photographs lifted off deck page 03', () => {
    const { container } = render(<WhoWeAre />);
    const srcs = Array.from(container.querySelectorAll('img')).map((i) => i.getAttribute('src'));
    expect(srcs).toEqual([
      '/pillars/think.jpg',
      '/pillars/design.jpg',
      '/pillars/craft.jpg',
      '/pillars/experience.jpg',
    ]);
  });

  it('alternates the direction each card enters from', () => {
    const { container } = render(<WhoWeAre />);
    const dirs = Array.from(container.querySelectorAll('[data-slide-in]')).map((el) =>
      el.getAttribute('data-slide-in')
    );
    expect(dirs).toEqual(['left', 'right', 'left', 'right']);
  });
});

describe('SlideIn', () => {
  it('renders its children and records its direction', () => {
    const { container } = render(<SlideIn from="left"><p>THINK</p></SlideIn>);
    expect(screen.getByText('THINK')).toBeInTheDocument();
    expect(container.querySelector('[data-slide-in]')?.getAttribute('data-slide-in')).toBe('left');
  });
});

describe('TwoLabs converging circles', () => {
  it('draws both labs as live circles rather than one flat raster', () => {
    const { container } = render(<TwoLabs />);
    expect(container.querySelectorAll('[data-lab-circle]')).toHaveLength(2);
    expect(screen.getByText('PRODUCT LAB')).toBeInTheDocument();
    expect(screen.getByText('CREATIVE LAB')).toBeInTheDocument();
  });

  it('puts the studio mark at the intersection', () => {
    const { container } = render(<TwoLabs />);
    const mark = container.querySelector('[data-studio-mark]') as HTMLElement;
    expect(mark.style.maskImage || mark.style.webkitMaskImage).toContain('studiolab-mark.png');
  });
});
