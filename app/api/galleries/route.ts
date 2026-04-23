import { NextResponse } from 'next/server';
import { getAllExhibitions, getAllGalleries } from '@/lib/data';
import { getExhibitionStatus } from '@/lib/schemas';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET() {
  const [galleries, exhibitions] = await Promise.all([
    getAllGalleries(),
    getAllExhibitions(),
  ]);

  const now = new Date();
  const activeByGallery = new Map<string, number>();
  for (const e of exhibitions) {
    if (getExhibitionStatus(e, now) !== 'now') continue;
    activeByGallery.set(e.galleryId, (activeByGallery.get(e.galleryId) ?? 0) + 1);
  }

  const payload = galleries.map((g) => ({
    ...g,
    activeCount: activeByGallery.get(g.id) ?? 0,
  }));

  return NextResponse.json(
    { count: payload.length, galleries: payload },
    {
      headers: {
        'Cache-Control':
          'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
      },
    },
  );
}
