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

  // Pull the most-recent successful run per gallery so we can pick the
  // oldest first. Without this the slice(0, CAP) above would process the
  // same alphabetically-first N galleries on every click and never get
  // round to the rest.
  const { data: lastRuns } = await admin
    .from('scrape_log')
    .select('gallery_id, run_at')
    .eq('status', 'success')
    .order('run_at', { ascending: false });

  const lastRunByGallery = new Map<string, string>();
  for (const r of lastRuns ?? []) {
    const gid = r.gallery_id as string | null;
    if (gid && !lastRunByGallery.has(gid)) {
      lastRunByGallery.set(gid, r.run_at as string);
    }
  }

  // Never-scraped (no entry) sort to the front via a sentinel timestamp.
  const sorted = eligible.slice().sort((a, b) => {
    const aTime = lastRunByGallery.get(a.id as string) ?? '0000';
    const bTime = lastRunByGallery.get(b.id as string) ?? '0000';
    return aTime.localeCompare(bTime);
  });

  const batch = sorted.slice(0, BATCH_GALLERY_CAP);

  const startedAt = Date.now();
  const results: ScrapeRunResult[] = [];
  for (const g of batch) {
    if (Date.now() - startedAt > BATCH_TIME_BUDGET_MS) {
      // Bail before starting another long-running gallery — protects the
      // overall response from the 60s timeout. The remaining galleries
      // simply don't appear in the result; the user clicks again.
      break;
    }
    try {
      results.push(await runScrapeForGallery(g.id as string));
    } catch (err) {
      results.push({
        status: 'error',
        gallery: g.id as string,
        stage: 'gallery-lookup',
        error: err instanceof Error ? err.message : String(err),
        durationMs: 0,
      });
    }
  }
  return { status: 'done-batch', results };
}
