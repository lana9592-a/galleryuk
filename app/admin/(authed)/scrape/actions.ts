'use server';

import { runScrapeForGallery, type ScrapeRunResult } from '@/lib/scrape/runScrape';
import { runScrapeBatch } from '@/lib/scrape/batch';
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
  try {
    const { results } = await runScrapeBatch(getSupabaseAdmin());
    if (results.length === 0) {
      return {
        status: 'invalid',
        message:
          'No galleries have whats_on_url set. Fill it in on at least one gallery first.',
      };
    }
    return { status: 'done-batch', results };
  } catch (err) {
    return {
      status: 'invalid',
      message: err instanceof Error ? err.message : String(err),
    };
  }
}
