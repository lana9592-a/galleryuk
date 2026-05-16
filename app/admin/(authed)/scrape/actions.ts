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

export async function runScrapeAllAction(
  _prev: RunScrapeState,
  _formData: FormData,
): Promise<RunScrapeState> {
  await assertAdmin();
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('galleries')
    .select('id, whats_on_url')
    .not('whats_on_url', 'is', null)
    .order('name', { ascending: true });
  if (error) {
    return { status: 'invalid', message: `Could not list galleries: ${error.message}` };
  }
  const eligible = (data ?? []).filter((g) => !!g.whats_on_url);
  if (eligible.length === 0) {
    return {
      status: 'invalid',
      message: 'No galleries have whats_on_url set. Fill it in on at least one gallery first.',
    };
  }
  // Sequential: parallel would race the Anthropic rate limit and hit the
  // Vercel 60s function ceiling sooner. ~5–8 galleries fit comfortably.
  const results: ScrapeRunResult[] = [];
  for (const g of eligible) {
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
