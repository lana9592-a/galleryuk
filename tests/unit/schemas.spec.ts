import { describe, it, expect } from 'vitest';
import {
  ExhibitionSchema,
  GallerySchema,
  getExhibitionStatus,
} from '@/lib/schemas';

const VALID_GALLERY = {
  id: 'tate-modern',
  name: 'Tate Modern',
  shortName: 'Tate',
  lat: 51.5076,
  lng: -0.0994,
  address: 'Bankside, London SE1 9TG',
  city: 'London',
  borough: 'Southwark',
  website: 'https://www.tate.org.uk/',
};

const VALID_EXHIBITION = {
  id: 'turner-prize-2026',
  title: 'Turner Prize 2026',
  galleryId: 'tate-modern',
  startDate: '2026-09-01',
  endDate: '2027-01-15',
  priceFrom: 12,
  priceTo: 18,
  ticketUrl: 'https://www.tate.org.uk/whats-on/turner-prize-2026',
  category: 'mixed',
  summary: 'Short summary.',
  description: 'Long description.',
  heroImage: 'https://images.unsplash.com/photo-1',
  heroImageAlt: 'Hero alt',
};

describe('GallerySchema', () => {
  it('accepts a valid London gallery', () => {
    expect(() => GallerySchema.parse(VALID_GALLERY)).not.toThrow();
  });

  it('rejects latitudes outside the UK window', () => {
    expect(() =>
      GallerySchema.parse({ ...VALID_GALLERY, lat: 30 }),
    ).toThrow();
  });

  it('rejects ids with uppercase or spaces', () => {
    expect(() =>
      GallerySchema.parse({ ...VALID_GALLERY, id: 'Tate Modern' }),
    ).toThrow();
  });

  it('rejects non-URL websites', () => {
    expect(() =>
      GallerySchema.parse({ ...VALID_GALLERY, website: 'tate.org.uk' }),
    ).toThrow();
  });
});

describe('ExhibitionSchema', () => {
  it('accepts a valid exhibition', () => {
    expect(() => ExhibitionSchema.parse(VALID_EXHIBITION)).not.toThrow();
  });

  it('rejects non-ISO date format', () => {
    expect(() =>
      ExhibitionSchema.parse({ ...VALID_EXHIBITION, startDate: '2026/09/01' }),
    ).toThrow();
  });

  it('rejects startDate after endDate', () => {
    expect(() =>
      ExhibitionSchema.parse({
        ...VALID_EXHIBITION,
        startDate: '2027-02-01',
        endDate: '2027-01-15',
      }),
    ).toThrow(/startDate must be <= endDate/);
  });

  it('rejects summary longer than 200 chars', () => {
    expect(() =>
      ExhibitionSchema.parse({
        ...VALID_EXHIBITION,
        summary: 'x'.repeat(201),
      }),
    ).toThrow();
  });

  it('rejects unknown categories', () => {
    expect(() =>
      ExhibitionSchema.parse({ ...VALID_EXHIBITION, category: 'architecture' }),
    ).toThrow();
  });

  it('accepts null / omitted price fields', () => {
    expect(() =>
      ExhibitionSchema.parse({
        ...VALID_EXHIBITION,
        priceFrom: null,
        priceTo: null,
        ticketUrl: null,
      }),
    ).not.toThrow();
  });

  it('caps images at 8', () => {
    const images = Array.from({ length: 9 }, (_, i) => ({
      url: `https://images.unsplash.com/photo-${i}`,
      alt: `alt ${i}`,
    }));
    expect(() =>
      ExhibitionSchema.parse({ ...VALID_EXHIBITION, images }),
    ).toThrow();
  });
});

describe('getExhibitionStatus', () => {
  const ex = { startDate: '2026-09-01', endDate: '2027-01-15' } as const;

  it('returns "upcoming" when today is before startDate', () => {
    expect(getExhibitionStatus(ex, new Date('2026-06-15T12:00:00Z'))).toBe(
      'upcoming',
    );
  });

  it('returns "now" on the start boundary', () => {
    expect(getExhibitionStatus(ex, new Date('2026-09-01T10:00:00Z'))).toBe(
      'now',
    );
  });

  it('returns "now" on a mid-range day', () => {
    expect(getExhibitionStatus(ex, new Date('2026-11-01T10:00:00Z'))).toBe(
      'now',
    );
  });

  it('returns "now" on the end boundary', () => {
    expect(getExhibitionStatus(ex, new Date('2027-01-15T23:00:00Z'))).toBe(
      'now',
    );
  });

  it('returns "ended" after endDate', () => {
    expect(getExhibitionStatus(ex, new Date('2027-01-16T00:01:00Z'))).toBe(
      'ended',
    );
  });
});
