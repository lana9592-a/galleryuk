import { NextResponse, type NextRequest } from 'next/server';
import { runScrapeForGallery } from '@/lib/scrape/runScrape';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const galleryId = request.nextUrl.searchParams.get('gallery');
  if (!galleryId) {
    return NextResponse.json(
      { error: 'missing required ?gallery=<id>' },
      { status: 400 },
    );
  }
  const result = await runScrapeForGallery(galleryId);
  const httpStatus =
    result.status === 'error' ? 502 : result.status === 'skipped' ? 200 : 200;
  return NextResponse.json(result, { status: httpStatus });
}
