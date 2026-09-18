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
});
