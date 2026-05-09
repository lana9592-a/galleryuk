import 'server-only';
import { ExhibitionSchema } from '@/lib/schemas';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { slugify } from './slugify';
import type { ScrapedExhibition } from './types';

export type UpsertOutcome =
  | { status: 'inserted'; id: string }
  | { status: 'updated'; id: string }
  | { status: 'skipped-verified'; id: string; reason: 'admin-edited' }
  | { status: 'skipped-invalid'; id: string; reason: string };

export async function upsertScrapedExhibition(
  scraped: ScrapedExhibition,
  galleryId: string,
  sourceUrl: string,
): Promise<UpsertOutcome> {
  const id = slugify(scraped.title);

  // Validate strictly against our app schema before touching the DB.
  // ExhibitionSchema enforces date format, summary length, URL shape, etc.
  const candidate = {
    id,
    title: scraped.title,
    galleryId,
    startDate: scraped.startDate,
    endDate: scraped.endDate,
    priceFrom: scraped.priceFrom ?? undefined,
    priceTo: scraped.priceTo ?? undefined,
    ticketUrl: scraped.ticketUrl ?? undefined,
    category: scraped.category,
    tags: scraped.tags.length > 0 ? scraped.tags : undefined,
    summary: scraped.summary.slice(0, 200),
    description: scraped.description,
    artists: scraped.artists.length > 0 ? scraped.artists : undefined,
    curator: scraped.curator ?? undefined,
    heroImage: scraped.heroImage,
    heroImageAlt: scraped.heroImageAlt.slice(0, 200),
    featured: false,
  };

  const validated = ExhibitionSchema.safeParse(candidate);
  if (!validated.success) {
    return {
      status: 'skipped-invalid',
      id,
      reason: validated.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; '),
    };
  }

  const admin = getSupabaseAdmin();

  const { data: existing, error: existingErr } = await admin
    .from('exhibitions')
    .select('id, verified')
    .eq('id', id)
    .maybeSingle();
  if (existingErr) throw new Error(`select existing failed: ${existingErr.message}`);

  if (existing && existing.verified === true) {
    return { status: 'skipped-verified', id, reason: 'admin-edited' };
  }

  const row = {
    id,
    title: validated.data.title,
    gallery_id: validated.data.galleryId,
    start_date: validated.data.startDate,
    end_date: validated.data.endDate,
    price_from: validated.data.priceFrom ?? null,
    price_to: validated.data.priceTo ?? null,
    ticket_url: validated.data.ticketUrl ?? null,
    category: validated.data.category,
    tags: validated.data.tags ?? null,
    summary: validated.data.summary,
    description: validated.data.description,
    artists: validated.data.artists ?? null,
    curator: validated.data.curator ?? null,
    hero_image: validated.data.heroImage,
    hero_image_alt: validated.data.heroImageAlt,
    images: null,
    featured: false,
    source_url: sourceUrl,
    last_scraped_at: new Date().toISOString(),
    verified: false,
  };

  if (existing) {
    const { error } = await admin
      .from('exhibitions')
      .update(row)
      .eq('id', id)
      .eq('verified', false);
    if (error) throw new Error(`update failed: ${error.message}`);
    return { status: 'updated', id };
  }

  const { error } = await admin.from('exhibitions').insert(row);
  if (error) throw new Error(`insert failed: ${error.message}`);
  return { status: 'inserted', id };
}
