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
        stalePurged: number;
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

  const counts = {
    inserted: 0,
    updated: 0,
    skippedVerified: 0,
    skippedInvalid: 0,
    stalePurged: 0,
  };
  const failures: ScrapeFailure[] = [];
  const skipped: ScrapeSkipped[] = [];
  const touchedIds: string[] = [];

  for (const scraped of extracted.exhibitions) {
    try {
      const outcome = await upsertScrapedExhibition(scraped, galleryId, sourceUrl);
      if (outcome.status === 'inserted') {
        counts.inserted++;
        touchedIds.push(outcome.id);
      } else if (outcome.status === 'updated') {
        counts.updated++;
        touchedIds.push(outcome.id);
      } else if (outcome.status === 'skipped-verified') {
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

  // Stale-row cleanup: any non-verified row for this gallery the scraper
  // didn't touch this run is no longer on the gallery's listing, so it's
  // stale and should go. Two safety rails:
  //   - Only purge when the scrape itself was healthy (found > 0). A bad
  //     run that returned 0 must never wipe the gallery's data.
  //   - verified=true rows are categorically protected (admin-curated).
  // Failures don't block cleanup — partial success still implies the new
  // data is closer to truth than the old.
  let stalePurged = 0;
  if (extracted.exhibitions.length > 0 && touchedIds.length > 0) {
    const { data: staleRows, error: staleErr } = await admin
      .from('exhibitions')
      .select('id')
      .eq('gallery_id', galleryId)
      .eq('verified', false)
      .not('id', 'in', `(${touchedIds.map((id) => `"${id}"`).join(',')})`);
    if (!staleErr && staleRows && staleRows.length > 0) {
      const staleIds = staleRows.map((r) => r.id as string);
      const { error: delErr } = await admin
        .from('exhibitions')
        .delete()
        .in('id', staleIds)
        .eq('verified', false);
      if (!delErr) {
        stalePurged = staleIds.length;
        counts.stalePurged = stalePurged;
        for (const id of staleIds) {
          revalidatePath(`/exhibitions/${id}`);
        }
      }
    }
  }

  if (counts.inserted > 0 || counts.updated > 0 || stalePurged > 0) {
    revalidatePath('/');
    revalidatePath('/exhibitions');
    revalidatePath('/galleries');
    revalidatePath(`/galleries/${galleryId}`);
    revalidatePath('/admin/exhibitions');
    // Per-exhibition detail pages are SSG with revalidate=3600 — without
    // this loop, freshly written ticketUrl / hero / dates would stay
    // hidden behind the stale snapshot for up to an hour.
    for (const id of touchedIds) {
      revalidatePath(`/exhibitions/${id}`);
    }
  }

  const durationMs = Date.now() - start;
  const status = failures.length > 0 ? 'partial' : 'success';

  // Log assistive messages: real failures first, then schema-rejected
  // rows ("LLM found N but none matched our schema"). Both are useful
  // when triaging — RA's 'found 9 / skipped 9' run for instance only
  // makes sense once the schema-reject reasons surface in the log.
  const noteParts: string[] = [];
  if (failures.length > 0) {
    noteParts.push(failures.map((f) => f.reason).join(' | '));
  }
  if (counts.skippedInvalid > 0) {
    const invalidReasons = skipped
      .filter((s) => !s.reason.startsWith('admin-edited'))
      .slice(0, 3)
      .map((s) => `${s.id || '?'}: ${s.reason}`)
      .join(' | ');
    noteParts.push(
      `${counts.skippedInvalid} row(s) rejected by schema — ${invalidReasons}`,
    );
  }

  await admin.from('scrape_log').insert({
    gallery_id: galleryId,
    status: failures.length > 0 ? 'error' : 'success',
    exhibitions_found: extracted.exhibitions.length,
    exhibitions_inserted: counts.inserted,
    exhibitions_updated: counts.updated,
    exhibitions_skipped: counts.skippedVerified + counts.skippedInvalid,
    error_message: noteParts.length > 0 ? noteParts.join(' ‖ ') : null,
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
