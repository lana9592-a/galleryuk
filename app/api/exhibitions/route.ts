import { NextResponse, type NextRequest } from 'next/server';
import { getAllExhibitions, getAllGalleries } from '@/lib/data';
import { ExhibitionsQuerySchema, filterExhibitions } from '@/lib/api';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = ExhibitionsQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const [exhibitions, galleries] = await Promise.all([
    getAllExhibitions(),
    getAllGalleries(),
  ]);
  const galleryNameById = new Map(
    galleries.map((g) => [g.id, g.shortName ?? g.name]),
  );
  const results = filterExhibitions(exhibitions, galleryNameById, parsed.data);

  return NextResponse.json(
    { count: results.length, exhibitions: results },
    {
      headers: {
        'Cache-Control':
          'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
      },
    },
  );
}
