import 'server-only';
import { cache } from 'react';
import {
  ExhibitionSchema,
  GallerySchema,
  type Exhibition,
  type Gallery,
  getExhibitionStatus,
} from './schemas';
import { getSupabase } from './supabase';

type Row = Record<string, unknown>;

function mapGalleryRow(row: Row): Gallery {
  return GallerySchema.parse({
    id: row.id,
    name: row.name,
    shortName: row.short_name ?? undefined,
    lat: Number(row.lat),
    lng: Number(row.lng),
    address: row.address,
    city: row.city ?? 'London',
    borough: row.borough ?? undefined,
    website: row.website,
    logoUrl: row.logo_url ?? undefined,
    openingHours: row.opening_hours ?? undefined,
    description: row.description ?? undefined,
    tags: row.tags ?? undefined,
  });
}

function mapExhibitionRow(row: Row): Exhibition {
  return ExhibitionSchema.parse({
    id: row.id,
    title: row.title,
    galleryId: row.gallery_id,
    startDate: row.start_date,
    endDate: row.end_date,
    priceFrom: row.price_from === null ? undefined : Number(row.price_from),
    priceTo: row.price_to === null ? undefined : Number(row.price_to),
    ticketUrl: row.ticket_url ?? undefined,
    category: row.category,
    tags: row.tags ?? undefined,
    summary: row.summary,
    description: row.description,
    artists: row.artists ?? undefined,
    curator: row.curator ?? undefined,
    heroImage: row.hero_image,
    heroImageAlt: row.hero_image_alt,
    images: row.images ?? undefined,
    featured: row.featured ?? false,
  });
}

export const getAllGalleries = cache(async (): Promise<Gallery[]> => {
  const { data, error } = await getSupabase()
    .from('galleries')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(`Supabase galleries fetch failed: ${error.message}`);
  return (data ?? []).map((row) => mapGalleryRow(row as Row));
});

export const getAllExhibitions = cache(async (): Promise<Exhibition[]> => {
  const { data, error } = await getSupabase().from('exhibitions').select('*');
  if (error) throw new Error(`Supabase exhibitions fetch failed: ${error.message}`);
  return (data ?? []).map((row) => mapExhibitionRow(row as Row));
});

export const getGallery = cache(async (id: string): Promise<Gallery | null> => {
  const all = await getAllGalleries();
  return all.find((g) => g.id === id) ?? null;
});

export const getExhibition = cache(async (id: string): Promise<Exhibition | null> => {
  const all = await getAllExhibitions();
  return all.find((e) => e.id === id) ?? null;
});

export async function getExhibitionsByStatus(
  status: 'now' | 'upcoming',
  limit?: number,
): Promise<Exhibition[]> {
  const all = await getAllExhibitions();
  const now = new Date();
  const filtered = all.filter((e) => getExhibitionStatus(e, now) === status);
  const sorted =
    status === 'now'
      ? filtered.sort((a, b) => a.endDate.localeCompare(b.endDate))
      : filtered.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return limit ? sorted.slice(0, limit) : sorted;
}

export async function getExhibitionsByGallery(galleryId: string): Promise<Exhibition[]> {
  const all = await getAllExhibitions();
  return all
    .filter((e) => e.galleryId === galleryId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function getFeaturedExhibition(): Promise<Exhibition | null> {
  const all = await getAllExhibitions();
  const now = new Date();
  const currentlyOn = all.filter((e) => getExhibitionStatus(e, now) === 'now');
  return currentlyOn.find((e) => e.featured === true) ?? currentlyOn[0] ?? null;
}
