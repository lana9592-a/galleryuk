import { z } from 'zod';

export const CategoryEnum = z.enum([
  'painting',
  'photography',
  'sculpture',
  'installation',
  'mixed',
]);
export type Category = z.infer<typeof CategoryEnum>;

const UK_LAT = z.number().min(49).max(61);
const UK_LNG = z.number().min(-8).max(2);

export const GallerySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  shortName: z.string().optional(),
  lat: UK_LAT,
  lng: UK_LNG,
  address: z.string().min(1),
  city: z.string().default('London'),
  borough: z.string().optional(),
  website: z.string().url(),
  logoUrl: z.string().optional(),
  openingHours: z.record(z.string()).optional(),
  description: z.string().max(400).optional(),
  tags: z.array(z.string()).optional(),
});
export type Gallery = z.infer<typeof GallerySchema>;

export const ExhibitionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    galleryId: z.string(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    priceFrom: z.number().nonnegative().nullable().optional(),
    priceTo: z.number().nonnegative().nullable().optional(),
    ticketUrl: z.string().url().nullable().optional(),
    category: CategoryEnum,
    tags: z.array(z.string()).optional(),
    summary: z.string().max(200),
    description: z.string().min(1),
    artists: z.array(z.string()).optional(),
    curator: z.string().optional(),
    heroImage: z.string().url(),
    heroImageAlt: z.string().min(1),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          alt: z.string().min(1),
          caption: z.string().optional(),
        }),
      )
      .max(8)
      .optional(),
    featured: z.boolean().optional(),
  })
  .refine((e) => new Date(e.startDate) <= new Date(e.endDate), {
    message: 'startDate must be <= endDate',
    path: ['endDate'],
  });
export type Exhibition = z.infer<typeof ExhibitionSchema>;

export type ExhibitionStatus = 'upcoming' | 'now' | 'ended';

export function getExhibitionStatus(
  e: Pick<Exhibition, 'startDate' | 'endDate'>,
  now: Date = new Date(),
): ExhibitionStatus {
  const today = new Date(now.toISOString().slice(0, 10));
  const start = new Date(e.startDate);
  const end = new Date(e.endDate);
  if (today < start) return 'upcoming';
  if (today > end) return 'ended';
  return 'now';
}
