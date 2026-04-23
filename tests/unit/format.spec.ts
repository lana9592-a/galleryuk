import { describe, it, expect } from 'vitest';
import {
  formatDateFull,
  formatDateRange,
  formatDateShort,
  formatPrice,
  formatPriceCompact,
  getInitials,
} from '@/lib/format';

describe('formatDateShort', () => {
  it('formats as "DD MMM" in en-GB', () => {
    // Node ICU varies between "Sep" and "Sept" for September; both are valid.
    expect(formatDateShort('2026-09-01')).toMatch(/^01 Sept?$/);
  });
});

describe('formatDateFull', () => {
  it('formats as "DD MMM YYYY"', () => {
    expect(formatDateFull('2027-01-15')).toBe('15 Jan 2027');
  });
});

describe('formatDateRange', () => {
  it('joins two dates with an en-dash', () => {
    expect(formatDateRange('2026-09-01', '2027-01-15')).toMatch(
      /^01 Sept? 2026 – 15 Jan 2027$/,
    );
  });
});

describe('formatPrice', () => {
  it('returns "Free" when from is null or undefined', () => {
    expect(formatPrice(null)).toBe('Free');
    expect(formatPrice(undefined)).toBe('Free');
  });

  it('returns "From £X" when only from is provided', () => {
    expect(formatPrice(12)).toBe('From £12');
  });

  it('returns a range when to > from', () => {
    expect(formatPrice(12, 18)).toBe('£12–£18');
  });

  it('treats to == from as a single price', () => {
    expect(formatPrice(12, 12)).toBe('From £12');
  });
});

describe('formatPriceCompact', () => {
  it('elides "From " prefix', () => {
    expect(formatPriceCompact(12)).toBe('£12');
  });

  it('returns "Free" on null', () => {
    expect(formatPriceCompact(null)).toBe('Free');
  });
});

describe('getInitials', () => {
  it('uses two words when available', () => {
    expect(getInitials('Tate Modern')).toBe('TM');
  });

  it('pads with a second letter when only one word', () => {
    expect(getInitials('Serpentine')).toBe('SE');
  });

  it('ignores punctuation', () => {
    expect(getInitials('V&A')).toBe('VA');
  });

  it('returns "?" for empty input', () => {
    expect(getInitials('')).toBe('?');
  });
});
