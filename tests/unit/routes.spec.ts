import { describe, it, expect } from 'vitest';
import {
  exhibitionHref,
  exhibitionsHref,
  galleryHref,
  searchHref,
} from '@/lib/routes';

describe('route helpers', () => {
  it('galleryHref builds the canonical gallery path', () => {
    expect(galleryHref('tate-modern')).toBe('/galleries/tate-modern');
  });

  it('exhibitionHref builds the canonical exhibition path', () => {
    expect(exhibitionHref('turner-prize-2026')).toBe(
      '/exhibitions/turner-prize-2026',
    );
  });

  it('exhibitionsHref returns the bare path when no query', () => {
    expect(exhibitionsHref()).toBe('/exhibitions');
    expect(exhibitionsHref(new URLSearchParams())).toBe('/exhibitions');
  });

  it('exhibitionsHref appends the query string when provided', () => {
    const q = new URLSearchParams({ status: 'now', category: 'painting' });
    expect(exhibitionsHref(q)).toBe('/exhibitions?status=now&category=painting');
  });

  it('searchHref encodes the query term', () => {
    expect(searchHref('Turner prize')).toBe('/search?q=Turner%20prize');
  });

  it('searchHref returns bare path on empty query', () => {
    expect(searchHref('')).toBe('/search');
    expect(searchHref(undefined)).toBe('/search');
    expect(searchHref('   ')).toBe('/search');
  });
});
