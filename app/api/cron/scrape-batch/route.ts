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
    // ?force=1 bypasses the cooldown — manual-test escape hatch only.
    // Vercel-scheduled invocations never pass query strings, so this
    // can't accidentally fire from the actual cron schedule.
    const skipCooldown = request.nextUrl.searchParams.get('force') === '1';
    const { results } = await runScrapeBatch(getSupabaseAdmin(), {
      skipCooldown,
    });

    // Summarise so the response payload tells the cron log everything
    // operators need without paging into Supabase.
    const summary = {
      total: results.length,
      success: results.filter((r) => r.status === 'success').length,
      partial: results.filter((r) => r.status === 'partial').length,
      error: results.filter((r) => r.status === 'error').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
    };

    // Surface the outcome in Vercel's Function log line — the runtime-log
    // UI doesn't always show the response body, but it always shows
    // console output. Lets the operator see at a glance whether the run
    // skipped everything (cooldown), partial-failed, or all-succeeded.
    console.log(
      `[cron/scrape-batch] ${skipCooldown ? 'force ' : ''}done — total=${summary.total} success=${summary.success} partial=${summary.partial} error=${summary.error} skipped=${summary.skipped}`,
    );

    return NextResponse.json({ status: 'ok', summary, results });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('[cron/scrape-batch] failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error,
      },
      { status: 500 },
    );
  }
}
