import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreativeLab from './page';

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
    expect(screen.getByText(/Where Products Become Stories/i)).toBeInTheDocument();
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

  it('flows the capabilities across columns at display size', () => {
    const { container } = render(<CreativeLab />);
    const list = container.querySelector('[data-capability-list] ul') as HTMLElement;
    expect(list.className).toMatch(/lg:columns-3/);
    const item = container.querySelector('[data-capability-item]') as HTMLElement;
    expect(item.className).toContain('font-display');
  });

  it('drops the Stage 2 stub placeholder line', () => {
    render(<CreativeLab />);
    expect(screen.queryByText(/Capability list and production imagery/i)).not.toBeInTheDocument();
  });
});
