'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { ExhibitionCard } from '@/components/exhibition/ExhibitionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ExhibitionCardSkeleton } from '@/components/ui/Skeleton';
import type { Exhibition, Gallery } from '@/lib/schemas';

export type SearchClientProps = {
  galleries: Pick<Gallery, 'id' | 'name' | 'shortName'>[];
  initialQuery: string;
};

type ApiResponse = {
  count: number;
  exhibitions: Exhibition[];
};

export function SearchClient({ galleries, initialQuery }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [results, setResults] = useState<Exhibition[] | null>(
    initialQuery ? null : [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const galleryById = useMemo(
    () => new Map(galleries.map((g) => [g.id, g])),
    [galleries],
  );

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), 250);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (debounced) next.set('q', debounced);
    else next.delete('q');
    const qs = next.toString();
    router.replace(qs ? `/search?${qs}` : '/search', { scroll: false });
  }, [debounced, router, searchParams]);

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetch(`/api/exhibitions?q=${encodeURIComponent(debounced)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as ApiResponse;
      })
      .then((data) => {
        setResults(data.exhibitions);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('Something went wrong. Please try again.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [debounced]);

  return (
    <div className="space-y-6">
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center gap-2"
      >
        <label htmlFor="q" className="sr-only">
          Search term
        </label>
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <input
            id="q"
            name="q"
            type="search"
            autoFocus
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Tate, Turner, photography..."
            className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-base outline-none transition-colors focus:border-text"
          />
        </div>
      </form>

      {loading ? (
        <ul
          aria-busy
          aria-label="Searching"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <ExhibitionCardSkeleton />
            </li>
          ))}
        </ul>
      ) : error ? (
        <EmptyState title="Search failed" description={error} />
      ) : !debounced ? (
        <p className="text-sm text-text-muted">
          Type a keyword above to search across all exhibitions.
        </p>
      ) : results && results.length > 0 ? (
        <section aria-label="Search results" className="space-y-3">
          <p className="text-sm text-text-muted">
            {results.length} {results.length === 1 ? 'result' : 'results'} for
            &ldquo;{debounced}&rdquo;
          </p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {results.map((e) => {
              const g = galleryById.get(e.galleryId);
              if (!g) return null;
              return (
                <li key={e.id}>
                  <ExhibitionCard exhibition={e} gallery={g} />
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <EmptyState
          title={`No results for "${debounced}"`}
          description="Try a different keyword or browse all exhibitions."
          action={{ label: 'Browse exhibitions', href: '/exhibitions' }}
        />
      )}
    </div>
  );
}
