import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { runScrapeBatch } from '@/lib/scrape/batch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> automatically
  // when the env var is present. The same header is used for manual
  // curl invocations (e.g. debugging), so this gate covers both.
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { results } = await runScrapeBatch(getSupabaseAdmin());

    // Summarise so the response payload tells the cron log everything
    // operators need without paging into Supabase.
    const summary = {
      total: results.length,
      success: results.filter((r) => r.status === 'success').length,
      partial: results.filter((r) => r.status === 'partial').length,
      error: results.filter((r) => r.status === 'error').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
    };

    return NextResponse.json({ status: 'ok', summary, results });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
