import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { runScrapeForGallery, type ScrapeRunResult } from './runScrape';

// Per-batch cap and wall-clock budget. Tuned to keep a single run well
// under Vercel's 60s Server Action / cron function ceiling — each
// gallery takes 10–40s once the LLM call is included.
export const BATCH_GALLERY_CAP = 3;
export const BATCH_TIME_BUDGET_MS = 45_000;

// Smart-skip rules — the batch path enforces these so we never burn
// tokens on a gallery whose data is still fresh or whose scrape is
// reliably failing. Single-gallery 'Run scraper' bypasses this and
// always runs (admin force-override).
export const SKIP_AFTER_SUCCESS_HOURS = 12;
export const SKIP_AFTER_CONSECUTIVE_ERRORS = 3;

export type BatchOutcome = {
  results: ScrapeRunResult[];
};

export type BatchOptions = {
  // Manual-test override. Vercel-scheduled cron never sets this; it's
  // for one-off operator runs ('I want to see the pipeline actually do
  // something right now even though everything was just scraped').
  // Skips the cooldown rule only — the consecutive-failures rule still
  // protects against burning fetches on hard-broken galleries.
  skipCooldown?: boolean;
};

export async function runScrapeBatch(
  admin: SupabaseClient,
  options: BatchOptions = {},
): Promise<BatchOutcome> {
  const { data: galleries, error: galleriesErr } = await admin
    .from('galleries')
    .select('id, whats_on_url')
    .not('whats_on_url', 'is', null);
  if (galleriesErr) {
    throw new Error(`Could not list galleries: ${galleriesErr.message}`);
  }
  const eligible = (galleries ?? []).filter((g) => !!g.whats_on_url);
  if (eligible.length === 0) {
    return { results: [] };
  }

  // Pull recent scrape_log rows for skip evaluation + LRU sort. One read
  // covers both — no per-gallery N+1.
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

    const recentSuccess = history.find(
      (h) => h.status === 'success' && h.run_at > cutoffIso,
    );
    if (recentSuccess && !options.skipCooldown) {
      skipResults.push({
        status: 'skipped',
        gallery: gid,
        reason: `Successful run <${SKIP_AFTER_SUCCESS_HOURS}h ago — saving tokens. Use single 'Run scraper' to force.`,
      });
      continue;
    }

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

  // LRU: least-recently-successfully-scraped first. Never-scraped wins
  // via the '0000' sentinel.
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

  return { results: [...skipResults, ...runResults] };
}
