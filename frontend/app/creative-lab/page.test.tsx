import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreativeLab from './page';
import { sitePage } from '@/lib/site-content';

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
    expect(screen.getByText(sitePage('creative_lab', []).text('cl_subhead'))).toBeInTheDocument();
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

  it('runs the set photography edge to edge', () => {
    const { container } = render(<CreativeLab />);
    const srcs = Array.from(container.querySelectorAll('img')).map((i) => i.getAttribute('src'));
    expect(srcs).toContain('/panels/creative-lab-strip.webp');
  });

  it('sets the capabilities as a wrap of display-size tags, not a column', () => {
    const { container } = render(<CreativeLab />);
    const list = container.querySelector('[data-capability-list] ul') as HTMLElement;
    expect(list.className).toMatch(/flex-wrap/);
    const item = container.querySelector('[data-capability-item]') as HTMLElement;
    expect(item.className).toContain('font-display');
    expect(item.className).toContain('rounded-full');
  });

  it('drops the Stage 2 stub placeholder line', () => {
    render(<CreativeLab />);
    expect(screen.queryByText(/Capability list and production imagery/i)).not.toBeInTheDocument();
  });
});
