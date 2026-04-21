import type { Category } from './schemas';

export const SITE_NAME = 'GalleryUK';
export const SITE_DESCRIPTION = 'Art exhibitions across London, in one place.';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://galleryuk.vercel.app';

export const LONDON_CENTER = { lat: 51.5072, lng: -0.1276 } as const;

export const CATEGORY_LABEL: Record<Category, string> = {
  painting: 'Painting',
  photography: 'Photography',
  sculpture: 'Sculpture',
  installation: 'Installation',
  mixed: 'Mixed',
};
