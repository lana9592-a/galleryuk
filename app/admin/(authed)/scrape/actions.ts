'use server';

import { runScrapeForGallery, type ScrapeRunResult } from '@/lib/scrape/runScrape';
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
  | { status: 'done'; result: ScrapeRunResult };

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
