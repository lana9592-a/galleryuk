import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { fetchHtmlPage } from './fetchPage';
import { extractExhibitionsWithLLM } from './extractWithLLM';
import { upsertScrapedExhibition } from './upsertExhibition';

export type ScrapeFailure = { reason: string };
export type ScrapeSkipped = { id: string; reason: string };

export type ScrapeRunResult =
  | {
      status: 'skipped';
      gallery: string;
      reason: string;
    }
  | {
      status: 'error';
      gallery: string;
      stage: 'fetch' | 'llm' | 'gallery-lookup';
      error: string;
      durationMs: number;
    }
  | {
      status: 'success' | 'partial';
      gallery: string;
      sourceUrl: string;
      found: number;
      counts: {
        inserted: number;
        updated: number;
        skippedVerified: number;
        skippedInvalid: number;
      };
      skipped: ScrapeSkipped[];
      failures: ScrapeFailure[];
      durationMs: number;
      tokens: {
        input: number;
        output: number;
        estimatedCostUsd: number;
      };
    };

// Single-gallery scrape pipeline. Used by both the cron route handler
// (HTTP-triggered, CRON_SECRET-authed) and the admin page server action
// (session-authed).
export async function runScrapeForGallery(
  galleryId: string,
): Promise<ScrapeRunResult> {
  const start = Date.now();
  const admin = getSupabaseAdmin();

  const { data: gallery, error: galleryErr } = await admin
    .from('galleries')
    .select('id, name, whats_on_url')
    .eq('id', galleryId)
    .maybeSingle();

  if (galleryErr) {
    return {
      status: 'error',
      gallery: galleryId,
      stage: 'gallery-lookup',
      error: galleryErr.message,
      durationMs: Date.now() - start,
    };
  }
  if (!gallery) {
    return {
      status: 'error',
      gallery: galleryId,
      stage: 'gallery-lookup',
      error: `gallery not found: ${galleryId}`,
      durationMs: Date.now() - start,
    };
  }

  const sourceUrl = gallery.whats_on_url as string | null;
  if (!sourceUrl) {
    await admin.from('scrape_log').insert({
      gallery_id: galleryId,
      status: 'skipped',
      error_message: 'whats_on_url is null',
    });
    return {
      status: 'skipped',
      gallery: galleryId,
      reason: 'whats_on_url not set on this gallery',
    };
  }

  let html: string;
  try {
    html = await fetchHtmlPage(sourceUrl);
  } catch (err) {
    const error_message = err instanceof Error ? err.message : String(err);
    const durationMs = Date.now() - start;
    await admin.from('scrape_log').insert({
      gallery_id: galleryId,
      status: 'error',
      error_message: `fetch: ${error_message}`,
      duration_ms: durationMs,
    });
    return {
      status: 'error',
      gallery: galleryId,
      stage: 'fetch',
      error: error_message,
      durationMs,
    };
  }

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
    const durationMs = Date.now() - start;
    await admin.from('scrape_log').insert({
      gallery_id: galleryId,
      status: 'error',
      error_message: `llm: ${error_message}`,
      duration_ms: durationMs,
    });
    return {
      status: 'error',
      gallery: galleryId,
      stage: 'llm',
      error: error_message,
      durationMs,
    };
  }

  const counts = { inserted: 0, updated: 0, skippedVerified: 0, skippedInvalid: 0 };
  const failures: ScrapeFailure[] = [];
  const skipped: ScrapeSkipped[] = [];

  for (const scraped of extracted.exhibitions) {
    try {
      const outcome = await upsertScrapedExhibition(scraped, galleryId, sourceUrl);
      if (outcome.status === 'inserted') counts.inserted++;
      else if (outcome.status === 'updated') counts.updated++;
      else if (outcome.status === 'skipped-verified') {
        counts.skippedVerified++;
        skipped.push({ id: outcome.id, reason: outcome.reason });
      } else {
        counts.skippedInvalid++;
        skipped.push({ id: outcome.id, reason: outcome.reason });
      }
    } catch (err) {
      failures.push({ reason: err instanceof Error ? err.message : String(err) });
    }
  }

  if (counts.inserted > 0 || counts.updated > 0) {
    revalidatePath('/');
    revalidatePath('/exhibitions');
    revalidatePath('/galleries');
    revalidatePath(`/galleries/${galleryId}`);
    revalidatePath('/admin/exhibitions');
  }

  const durationMs = Date.now() - start;
  const status = failures.length > 0 ? 'partial' : 'success';

  await admin.from('scrape_log').insert({
    gallery_id: galleryId,
    status: failures.length > 0 ? 'error' : 'success',
    exhibitions_found: extracted.exhibitions.length,
    exhibitions_inserted: counts.inserted,
    exhibitions_updated: counts.updated,
    exhibitions_skipped: counts.skippedVerified + counts.skippedInvalid,
    error_message: failures.length > 0 ? failures.map((f) => f.reason).join(' | ') : null,
    duration_ms: durationMs,
    prompt_tokens: extracted.inputTokens,
    completion_tokens: extracted.outputTokens,
  });

  return {
    status,
    gallery: galleryId,
    sourceUrl,
    found: extracted.exhibitions.length,
    counts,
    skipped,
    failures,
    durationMs,
    tokens: {
      input: extracted.inputTokens,
      output: extracted.outputTokens,
      // Haiku 4.5: $1/MTok input, $5/MTok output.
      estimatedCostUsd:
        (extracted.inputTokens * 1) / 1_000_000 +
        (extracted.outputTokens * 5) / 1_000_000,
    },
  };
}
