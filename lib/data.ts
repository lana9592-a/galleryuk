import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  ExhibitionSchema,
  GallerySchema,
  type Exhibition,
  type Gallery,
  getExhibitionStatus,
} from './schemas';

type Cache = {
  galleries: Gallery[];
  exhibitions: Exhibition[];
  galleryById: Map<string, Gallery>;
  exhibitionById: Map<string, Exhibition>;
} | null;

let cache: Cache = null;

async function loadOnce(): Promise<NonNullable<Cache>> {
  if (cache) return cache;

  const dataDir = path.join(process.cwd(), 'public', 'data');
  const [galleriesRaw, exhibitionsRaw] = await Promise.all([
    fs.readFile(path.join(dataDir, 'galleries.json'), 'utf8'),
    fs.readFile(path.join(dataDir, 'exhibitions.json'), 'utf8'),
  ]);

  const galleries = GallerySchema.array().parse(JSON.parse(galleriesRaw));
  const exhibitions = ExhibitionSchema.array().parse(JSON.parse(exhibitionsRaw));

  const galleryById = new Map(galleries.map((g) => [g.id, g]));
  for (const ex of exhibitions) {
    if (!galleryById.has(ex.galleryId)) {
      throw new Error(
        `Data integrity: exhibition "${ex.id}" references unknown galleryId "${ex.galleryId}"`,
      );
    }
  }

  cache = {
    galleries: [...galleries].sort((a, b) => a.name.localeCompare(b.name)),
    exhibitions,
    galleryById,
    exhibitionById: new Map(exhibitions.map((e) => [e.id, e])),
  };
  return cache;
}

export async function getAllGalleries(): Promise<Gallery[]> {
  const d = await loadOnce();
  return d.galleries;
}

export async function getGallery(id: string): Promise<Gallery | null> {
  const d = await loadOnce();
  return d.galleryById.get(id) ?? null;
}

export async function getAllExhibitions(): Promise<Exhibition[]> {
  const d = await loadOnce();
  return d.exhibitions;
}

export async function getExhibition(id: string): Promise<Exhibition | null> {
  const d = await loadOnce();
  return d.exhibitionById.get(id) ?? null;
}

export async function getExhibitionsByStatus(
  status: 'now' | 'upcoming',
  limit?: number,
): Promise<Exhibition[]> {
  const d = await loadOnce();
  const now = new Date();
  const filtered = d.exhibitions.filter((e) => getExhibitionStatus(e, now) === status);
  const sorted =
    status === 'now'
      ? filtered.sort((a, b) => a.endDate.localeCompare(b.endDate)) // ending soonest first
      : filtered.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return limit ? sorted.slice(0, limit) : sorted;
}

export async function getExhibitionsByGallery(galleryId: string): Promise<Exhibition[]> {
  const d = await loadOnce();
  return d.exhibitions
    .filter((e) => e.galleryId === galleryId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function getFeaturedExhibition(): Promise<Exhibition | null> {
  const d = await loadOnce();
  const now = new Date();
  const currentlyOn = d.exhibitions.filter((e) => getExhibitionStatus(e, now) === 'now');
  const featured = currentlyOn.find((e) => e.featured === true);
  return featured ?? currentlyOn[0] ?? null;
}
