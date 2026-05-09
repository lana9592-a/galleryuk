'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, Play } from 'lucide-react';
import { runScrapeAction, type RunScrapeState } from './actions';
import type { ScrapeRunResult } from '@/lib/scrape/runScrape';

const initial: RunScrapeState = { status: 'idle' };

type GalleryOption = {
  id: string;
  name: string;
  whatsOnUrl: string | null;
};

type Props = {
  galleries: GalleryOption[];
};

function RunButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Scraping…
        </>
      ) : (
        <>
          <Play className="h-4 w-4" aria-hidden />
          Run scraper
        </>
      )}
    </button>
  );
}

function ResultCard({ result }: { result: ScrapeRunResult }) {
  if (result.status === 'skipped') {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Skipped — {result.gallery}</p>
        <p className="mt-1">{result.reason}</p>
      </div>
    );
  }
  if (result.status === 'error') {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        <p className="font-semibold">
          Failed at {result.stage} — {result.gallery} ({result.durationMs} ms)
        </p>
        <p className="mt-1 break-words font-mono text-xs">{result.error}</p>
      </div>
    );
  }

  const { counts, tokens, durationMs } = result;
  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-4">
      <div className="flex items-baseline justify-between">
        <p className="font-semibold">
          {result.status === 'success' ? '✅ Success' : '⚠️ Partial'} —{' '}
          {result.gallery}
        </p>
        <p className="text-xs text-text-muted">{durationMs} ms</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <Stat label="Found" value={result.found} />
        <Stat label="Inserted" value={counts.inserted} tone="positive" />
        <Stat label="Updated" value={counts.updated} tone="positive" />
        <Stat
          label="Skipped"
          value={counts.skippedVerified + counts.skippedInvalid}
          tone="muted"
        />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-text-muted">
        <span>Input tokens: {tokens.input.toLocaleString()}</span>
        <span>Output tokens: {tokens.output.toLocaleString()}</span>
        <span>Cost: ${tokens.estimatedCostUsd.toFixed(4)}</span>
      </div>
      {result.skipped.length > 0 ? (
        <details className="text-sm">
          <summary className="cursor-pointer text-text-muted">
            Skipped rows ({result.skipped.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs">
            {result.skipped.map((s) => (
              <li key={s.id} className="font-mono">
                <span className="font-semibold">{s.id}</span> — {s.reason}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {result.failures.length > 0 ? (
        <details className="text-sm" open>
          <summary className="cursor-pointer text-red-700">
            Errors ({result.failures.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-red-800">
            {result.failures.map((f, i) => (
              <li key={i} className="font-mono">
                {f.reason}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'positive' | 'muted';
}) {
  const valueClass =
    tone === 'positive'
      ? 'text-green-700'
      : tone === 'muted'
        ? 'text-text-muted'
        : 'text-text';
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}

export function ScrapeRunner({ galleries }: Props) {
  const [state, formAction] = useFormState(runScrapeAction, initial);

  const eligible = galleries.filter((g) => g.whatsOnUrl);
  const noneEligible = eligible.length === 0;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="galleryId" className="block text-sm font-medium">
            Gallery
          </label>
          <select
            id="galleryId"
            name="galleryId"
            required
            disabled={noneEligible}
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-text disabled:bg-surface-muted"
          >
            <option value="" disabled>
              {noneEligible
                ? '— No galleries with whats_on_url set —'
                : '— Select a gallery —'}
            </option>
            {eligible.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {noneEligible ? (
            <p className="text-xs text-amber-700">
              Set a gallery&rsquo;s <span className="font-mono">whats_on_url</span>{' '}
              in Supabase Table Editor first (e.g.{' '}
              <span className="font-mono">
                https://www.tate.org.uk/whats-on/tate-modern
              </span>
              ).
            </p>
          ) : (
            <p className="text-xs text-text-muted">
              Only galleries with{' '}
              <span className="font-mono">whats_on_url</span> populated are
              shown. Scraping takes ~10–30 seconds and costs ~$0.005.
            </p>
          )}
        </div>

        {state.status === 'invalid' ? (
          <p role="alert" className="text-sm text-red-700">
            {state.message}
          </p>
        ) : null}

        <RunButton disabled={noneEligible} />
      </form>

      {state.status === 'done' ? <ResultCard result={state.result} /> : null}
    </div>
  );
}
