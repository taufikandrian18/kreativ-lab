import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArchiveIndex from './page';

describe('/archive', () => {
  it('lists all six entries numbered 01 through 06', () => {
    render(<ArchiveIndex />);
    for (const no of ['01', '02', '03', '04', '05', '06']) {
      expect(screen.getByText(no)).toBeInTheDocument();
    }
  });

  it('renders the six entries in ascending archive_no order, not fixture (descending) order', () => {
    // The real fixture stores archive_projects descending (06..01) — a presence-only
    // check (above) can't catch a route that forgot to sort, since all six numbers are
    // present either way. This asserts document order directly against the data-testid
    // markers, per spec §6 ("01–06 counter increments").
    render(<ArchiveIndex />);
    const rendered = screen.getAllByTestId('archive-no').map((el) => el.textContent);
    expect(rendered).toEqual(['01', '02', '03', '04', '05', '06']);
  });
});
