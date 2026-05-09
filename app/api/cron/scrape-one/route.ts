import { NextResponse, type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { fetchHtmlPage } from '@/lib/scrape/fetchPage';
import { extractExhibitionsWithLLM } from '@/lib/scrape/extractWithLLM';
import { upsertScrapedExhibition } from '@/lib/scrape/upsertExhibition';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
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

  const start = Date.now();
  const admin = getSupabaseAdmin();

  // 1. Look up the gallery + whats_on_url.
  const { data: gallery, error: galleryErr } = await admin
    .from('galleries')
    .select('id, name, whats_on_url')
    .eq('id', galleryId)
    .maybeSingle();

  if (galleryErr) {
    return NextResponse.json(
      { error: `select gallery: ${galleryErr.message}` },
      { status: 500 },
    );
  }
  if (!gallery) {
    return NextResponse.json(
      { error: `gallery not found: ${galleryId}` },
      { status: 404 },
    );
  }
  const sourceUrl = gallery.whats_on_url as string | null;
  if (!sourceUrl) {
    await admin.from('scrape_log').insert({
      gallery_id: galleryId,
      status: 'skipped',
      error_message: 'whats_on_url is null',
    });
    return NextResponse.json({
      status: 'skipped',
      gallery: galleryId,
      reason: 'whats_on_url not set; populate via Supabase Table Editor or admin CMS',
    });
  }

  // 2. Fetch + clean HTML.
  let html: string;
  try {
    html = await fetchHtmlPage(sourceUrl);
  } catch (err) {
    const error_message = err instanceof Error ? err.message : String(err);
    await admin.from('scrape_log').insert({
      gallery_id: galleryId,
      status: 'error',
      error_message: `fetch: ${error_message}`,
      duration_ms: Date.now() - start,
    });
    return NextResponse.json(
      { status: 'error', stage: 'fetch', error: error_message },
      { status: 502 },
    );
  }

  // 3. Extract via LLM.
  let extracted;
  try {
    extracted = await extractExhibitionsWithLLM(html, sourceUrl);
  } catch (err) {
    const error_message =
      err instanceof Anthropic.APIError
        ? `${err.status} ${err.message}`
        : err instanceof Error
          ? err.message
          : String(err);
    await admin.from('scrape_log').insert({
      gallery_id: galleryId,
      status: 'error',
      error_message: `llm: ${error_message}`,
      duration_ms: Date.now() - start,
    });
    return NextResponse.json(
      { status: 'error', stage: 'llm', error: error_message },
      { status: 502 },
    );
  }

  // 4. Upsert each exhibition.
  const counts = { inserted: 0, updated: 0, skippedVerified: 0, skippedInvalid: 0 };
  const failures: { id?: string; reason: string }[] = [];
  const skipped: { id: string; reason: string }[] = [];

  for (const scraped of extracted.exhibitions) {
    try {
      const outcome = await upsertScrapedExhibition(scraped, galleryId, sourceUrl);
      if (outcome.status === 'inserted') counts.inserted++;
      else if (outcome.status === 'updated') counts.updated++;
      else if (outcome.status === 'skipped-verified') {
        counts.skippedVerified++;
        skipped.push({ id: outcome.id, reason: outcome.reason });
      } else if (outcome.status === 'skipped-invalid') {
        counts.skippedInvalid++;
        skipped.push({ id: outcome.id, reason: outcome.reason });
      }
    } catch (err) {
      failures.push({
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (counts.inserted > 0 || counts.updated > 0) {
    revalidatePath('/');
    revalidatePath('/exhibitions');
    revalidatePath('/galleries');
    revalidatePath(`/galleries/${galleryId}`);
    revalidatePath('/admin/exhibitions');
  }

  const duration_ms = Date.now() - start;
  const status: 'success' | 'error' = failures.length > 0 ? 'error' : 'success';

  await admin.from('scrape_log').insert({
    gallery_id: galleryId,
    status,
    exhibitions_found: extracted.exhibitions.length,
    exhibitions_inserted: counts.inserted,
    exhibitions_updated: counts.updated,
    exhibitions_skipped: counts.skippedVerified + counts.skippedInvalid,
    error_message: failures.length > 0 ? failures.map((f) => f.reason).join(' | ') : null,
    duration_ms,
    prompt_tokens: extracted.inputTokens,
    completion_tokens: extracted.outputTokens,
  });

  return NextResponse.json({
    status,
    gallery: galleryId,
    sourceUrl,
    found: extracted.exhibitions.length,
    counts,
    skipped,
    failures,
    duration_ms,
    tokens: {
      input: extracted.inputTokens,
      output: extracted.outputTokens,
      // Haiku 4.5: $1/MTok input, $5/MTok output.
      estimatedCostUsd:
        (extracted.inputTokens * 1) / 1_000_000 +
        (extracted.outputTokens * 5) / 1_000_000,
    },
  });
}
