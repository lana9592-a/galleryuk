import { describe, it, expect } from 'vitest';
import {
  ExhibitionsQuerySchema,
  filterExhibitions,
  StatusEnum,
} from '@/lib/api';
import type { Exhibition } from '@/lib/schemas';

const makeExhibition = (
  overrides: Partial<Exhibition> & Pick<Exhibition, 'id'>,
): Exhibition =>
  ({
    title: `Title ${overrides.id}`,
    galleryId: 'tate',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    category: 'mixed',
    summary: 'summary',
    description: 'description',
    heroImage: 'https://images.unsplash.com/photo-0',
    heroImageAlt: 'alt',
    ...overrides,
  }) as Exhibition;

const GALLERY_NAME_BY_ID = new Map([
  ['tate', 'Tate Modern'],
  ['nationalgallery', 'National Gallery'],
]);

describe('ExhibitionsQuerySchema', () => {
  it('defaults status to "all"', () => {
    const parsed = ExhibitionsQuerySchema.parse({});
    expect(parsed.status).toBe('all');
  });

  it('coerces numeric limit', () => {
    const parsed = ExhibitionsQuerySchema.parse({ limit: '5' });
    expect(parsed.limit).toBe(5);
  });

  it('rejects limit > 100', () => {
    expect(() => ExhibitionsQuerySchema.parse({ limit: '500' })).toThrow();
  });

  it('rejects unknown category', () => {
    expect(() =>
      ExhibitionsQuerySchema.parse({ category: 'architecture' }),
    ).toThrow();
  });

  it('trims q and caps to 80 chars', () => {
    const parsed = ExhibitionsQuerySchema.parse({ q: '   turner   ' });
    expect(parsed.q).toBe('turner');
    expect(() => ExhibitionsQuerySchema.parse({ q: 'x'.repeat(81) })).toThrow();
  });

  it('enumerates all 4 status values', () => {
    expect(StatusEnum.options).toEqual(['now', 'upcoming', 'ended', 'all']);
  });
});

describe('filterExhibitions', () => {
  const now = new Date('2026-06-01T12:00:00Z');

  const hockney = makeExhibition({
    id: 'hockney-late-works',
    title: 'Hockney: Late Works',
    category: 'painting',
    startDate: '2026-05-01',
    endDate: '2026-08-31',
    artists: ['David Hockney'],
  });
  const turner = makeExhibition({
    id: 'turner-prize-2026',
    title: 'Turner Prize 2026',
    category: 'mixed',
    startDate: '2026-09-01',
    endDate: '2027-01-15',
    galleryId: 'tate',
  });
  const old = makeExhibition({
    id: 'old-show',
    title: 'Old Show',
    startDate: '2025-01-01',
    endDate: '2025-05-01',
  });

  it('filters by status=now', () => {
    const out = filterExhibitions(
      [hockney, turner, old],
      GALLERY_NAME_BY_ID,
      ExhibitionsQuerySchema.parse({ status: 'now' }),
      now,
    );
    expect(out.map((e) => e.id)).toEqual(['hockney-late-works']);
  });

  it('filters by status=upcoming sorted by startDate asc', () => {
    const other = makeExhibition({
      id: 'later',
      startDate: '2027-02-01',
      endDate: '2027-06-01',
    });
    const out = filterExhibitions(
      [turner, other],
      GALLERY_NAME_BY_ID,
      ExhibitionsQuerySchema.parse({ status: 'upcoming' }),
      now,
    );
    expect(out.map((e) => e.id)).toEqual(['turner-prize-2026', 'later']);
  });

  it('filters by category', () => {
    const out = filterExhibitions(
      [hockney, turner],
      GALLERY_NAME_BY_ID,
      ExhibitionsQuerySchema.parse({ category: 'painting' }),
      now,
    );
    expect(out.map((e) => e.id)).toEqual(['hockney-late-works']);
  });

  it('matches q against title + artists + gallery name', () => {
    const out = filterExhibitions(
      [hockney, turner],
      GALLERY_NAME_BY_ID,
      ExhibitionsQuerySchema.parse({ q: 'hockney' }),
      now,
    );
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe('hockney-late-works');

    const byGallery = filterExhibitions(
      [hockney, turner],
      GALLERY_NAME_BY_ID,
      ExhibitionsQuerySchema.parse({ q: 'tate' }),
      now,
    );
    expect(byGallery.map((e) => e.id).sort()).toEqual([
      'hockney-late-works',
      'turner-prize-2026',
    ]);
  });

  it('respects limit', () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      makeExhibition({
        id: `ex-${i}`,
        startDate: '2026-05-01',
        endDate: '2026-12-31',
      }),
    );
    const out = filterExhibitions(
      items,
      GALLERY_NAME_BY_ID,
      ExhibitionsQuerySchema.parse({ status: 'now', limit: '3' }),
      now,
    );
    expect(out).toHaveLength(3);
  });

  it('returns empty array when nothing matches', () => {
    const out = filterExhibitions(
      [hockney],
      GALLERY_NAME_BY_ID,
      ExhibitionsQuerySchema.parse({ q: 'unicorn' }),
      now,
    );
    expect(out).toEqual([]);
  });
});
