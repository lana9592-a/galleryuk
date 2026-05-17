'use server';

import { runScrapeForGallery, type ScrapeRunResult } from '@/lib/scrape/runScrape';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

async function assertAdmin(): Promise<void> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = user?.email?.trim().toLowerCase();
  if (!user || !adminEmail || userEmail !== adminEmail) {
    throw new Error('Unauthorized');
  }
}

export type RunScrapeState =
  | { status: 'idle' }
  | { status: 'invalid'; message: string }
  | { status: 'done'; result: ScrapeRunResult }
  | { status: 'done-batch'; results: ScrapeRunResult[] };

export async function runScrapeAction(
  _prev: RunScrapeState,
  formData: FormData,
): Promise<RunScrapeState> {
  await assertAdmin();
  const galleryId = formData.get('galleryId');
  if (typeof galleryId !== 'string' || !galleryId) {
    return { status: 'invalid', message: 'Pick a gallery first.' };
  }
  const result = await runScrapeForGallery(galleryId);
  return { status: 'done', result };
}

// Per-batch cap: only this many galleries per single click. Each gallery
// can take 10–90s; processing all 10 in one go regularly exceeds Vercel's
// 60s Server Action ceiling and returns a 504 mid-stream, which the
// client cannot recover from cleanly. Click the button repeatedly to do
// the rest, or move to v1.2.4 (per-gallery cron jobs).
const BATCH_GALLERY_CAP = 3;

// Wall-clock safety net. If we're past this many ms into the call,
// don't start another gallery — return what we have and let the user
// click again. Keeps us under the 60s function ceiling with headroom.
const BATCH_TIME_BUDGET_MS = 45_000;

// Smart-skip rules — batch only, single 'Run scraper' bypasses these:
//   1. If we successfully scraped within this window, no need to redo —
//      protects against burning $0.005 per call on data that hasn't
//      changed since the page was scraped an hour ago.
//   2. If the last N attempts all errored, the gallery is broken
//      (Hayward HTTP 403, dead URL, schema rejects every row) — leave
//      it alone until the admin manually unbreaks it.
const SKIP_AFTER_SUCCESS_HOURS = 12;
const SKIP_AFTER_CONSECUTIVE_ERRORS = 3;

export async function runScrapeAllAction(
  _prev: RunScrapeState,
  _formData: FormData,
): Promise<RunScrapeState> {
  await assertAdmin();
  const admin = getSupabaseAdmin();

  const { data: galleries, error: galleriesErr } = await admin
    .from('galleries')
    .select('id, whats_on_url')
    .not('whats_on_url', 'is', null);
  if (galleriesErr) {
    return { status: 'invalid', message: `Could not list galleries: ${galleriesErr.message}` };
  }
  const eligible = (galleries ?? []).filter((g) => !!g.whats_on_url);
  if (eligible.length === 0) {
    return {
      status: 'invalid',
      message: 'No galleries have whats_on_url set. Fill it in on at least one gallery first.',
    };
  }

  // Pull the last 30 days of scrape_log for these galleries. Enough to
  // evaluate both the success-cooldown and the consecutive-errors gates
  // without paginating.
  const { data: logs } = await admin
    .from('scrape_log')
    .select('gallery_id, run_at, status')
    .order('run_at', { ascending: false })
    .limit(eligible.length * 10);

  const logsByGallery = new Map<
    string,
    { run_at: string; status: string }[]
  >();
  for (const r of logs ?? []) {
    const gid = r.gallery_id as string | null;
    if (!gid) continue;
    const arr = logsByGallery.get(gid) ?? [];
    arr.push({ run_at: r.run_at as string, status: r.status as string });
    logsByGallery.set(gid, arr);
  }

  const cutoffMs = Date.now() - SKIP_AFTER_SUCCESS_HOURS * 3_600_000;
  const cutoffIso = new Date(cutoffMs).toISOString();

  const skipResults: ScrapeRunResult[] = [];
  const toRun: { id: string }[] = [];

  for (const g of eligible) {
    const gid = g.id as string;
    const history = logsByGallery.get(gid) ?? [];

    // 1. Recently-successful cooldown
    const recentSuccess = history.find(
      (h) => h.status === 'success' && h.run_at > cutoffIso,
    );
    if (recentSuccess) {
      skipResults.push({
        status: 'skipped',
        gallery: gid,
        reason: `Successful run <${SKIP_AFTER_SUCCESS_HOURS}h ago — saving tokens. Use single 'Run scraper' to force.`,
      });
      continue;
    }

    // 2. Stuck-failing exclusion
    const lastN = history.slice(0, SKIP_AFTER_CONSECUTIVE_ERRORS);
    if (
      lastN.length >= SKIP_AFTER_CONSECUTIVE_ERRORS &&
      lastN.every((h) => h.status === 'error')
    ) {
      skipResults.push({
        status: 'skipped',
        gallery: gid,
        reason: `${SKIP_AFTER_CONSECUTIVE_ERRORS} consecutive failures — fix whats_on_url or unset it. Use single 'Run scraper' to retry.`,
      });
      continue;
    }

    toRun.push({ id: gid });
  }

  // Sort to-run list by least-recently-scraped (never-scraped first via
  // the '0000' sentinel) so repeat clicks rotate through every venue.
  const lastRunByGallery = new Map<string, string>();
  for (const [gid, history] of logsByGallery) {
    const lastSuccess = history.find((h) => h.status === 'success');
    if (lastSuccess) lastRunByGallery.set(gid, lastSuccess.run_at);
  }
  toRun.sort((a, b) => {
    const aTime = lastRunByGallery.get(a.id) ?? '0000';
    const bTime = lastRunByGallery.get(b.id) ?? '0000';
    return aTime.localeCompare(bTime);
  });

  const batch = toRun.slice(0, BATCH_GALLERY_CAP);

  const startedAt = Date.now();
  const runResults: ScrapeRunResult[] = [];
  for (const g of batch) {
    if (Date.now() - startedAt > BATCH_TIME_BUDGET_MS) {
      break;
    }
    try {
      runResults.push(await runScrapeForGallery(g.id));
    } catch (err) {
      runResults.push({
        status: 'error',
        gallery: g.id,
        stage: 'gallery-lookup',
        error: err instanceof Error ? err.message : String(err),
        durationMs: 0,
      });
    }
  }

  return { status: 'done-batch', results: [...skipResults, ...runResults] };
}
