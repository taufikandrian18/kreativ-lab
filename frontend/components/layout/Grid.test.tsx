import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders a 12-column grid container', () => {
    const { container } = render(<Grid><div>child</div></Grid>);
    const grid = container.firstElementChild;
    expect(grid?.className).toMatch(/grid-cols-12/);
  });

  it('never sets a raw 100vh height', () => {
    const { container } = render(<Grid><div>child</div></Grid>);
    expect(container.innerHTML).not.toMatch(/100vh/);
  });
});
