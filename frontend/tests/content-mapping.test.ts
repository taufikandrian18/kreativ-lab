import { describe, it, expect } from 'vitest';
import { getArchiveProjects } from '../lib/contract';

// Reproduced verbatim from spec §3's six-row table. Do not "correct" values here —
// if the fixture and the spec disagree, that is a real bug to surface, not paper over.
const EXPECTED = [
  { archive_no: '01', client: 'Nathan Tjoe A On', industry: 'Clothing Brand', year_range: '2025 – 2026' },
  { archive_no: '02', client: 'DRX Wear', industry: 'Sport Brand Apparel', year_range: '2024 – 2025' },
  { archive_no: '03', client: 'Howard Smith', industry: 'Otomotive Manufacture', year_range: '2025' },
  { archive_no: '04', client: 'Cargloss Helmet', industry: 'Otomotive Manufacture', year_range: '2024 – 2025' },
  { archive_no: '05', client: 'XL Smart Axiata', industry: 'Telekomunikasi', year_range: '2025 – 2026' },
  { archive_no: '06', client: 'Kemenpora', industry: 'Sport Event National', year_range: '2025' },
];

describe('content mapping (spec §12)', () => {
  const projects = getArchiveProjects();

  it('has exactly six entries', () => {
    expect(projects).toHaveLength(6);
  });

  it.each(EXPECTED)('matches spec §3 for archive_no $archive_no', (expected) => {
    const actual = projects.find((p) => p.archive_no === expected.archive_no);
    expect(actual).toBeDefined();
    expect(actual?.client).toBe(expected.client);
    expect(actual?.industry).toBe(expected.industry);
    expect(actual?.year_range).toBe(expected.year_range);
  });

  it('every project has a scope array (possibly empty until content is populated)', () => {
    for (const p of projects) {
      expect(Array.isArray(p.scope)).toBe(true);
    }
  });
});
