import type { Metadata } from 'next';
import { Search as SearchIcon } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ExhibitionCard } from '@/components/exhibition/ExhibitionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAllExhibitions, getAllGalleries } from '@/lib/data';
import { getExhibitionStatus } from '@/lib/schemas';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search exhibitions by title, artist, or venue.',
};

type Search = { q?: string };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const query = (searchParams.q ?? '').trim();
  const [exhibitions, galleries] = await Promise.all([
    getAllExhibitions(),
    getAllGalleries(),
  ]);
  const galleryById = new Map(galleries.map((g) => [g.id, g]));

  const now = new Date();
  const needle = query.toLowerCase();
  const results = query
    ? exhibitions.filter((e) => {
        if (getExhibitionStatus(e, now) === 'ended') return false;
        const g = galleryById.get(e.galleryId);
        const haystack = [
          e.title,
          e.summary,
          e.category,
          ...(e.artists ?? []),
          g?.name ?? '',
          g?.shortName ?? '',
          ...(e.tags ?? []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      })
    : [];

  return (
    <Container as="div" className="space-y-6 py-6 md:py-10">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Search</h1>
        <p className="text-text-muted">
          Search exhibitions by title, artist, or gallery.
        </p>
      </header>

      <form
        action="/search"
        method="get"
        role="search"
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
            defaultValue={query}
            placeholder="Tate, Turner, photography..."
            className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-base outline-none transition-colors focus:border-text"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-text px-5 text-sm font-semibold text-white transition-colors hover:bg-text/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          Search
        </button>
      </form>

      {query ? (
        results.length > 0 ? (
          <section aria-label="Search results" className="space-y-3">
            <p className="text-sm text-text-muted">
              {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;{query}
              &rdquo;
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
            title={`No results for "${query}"`}
            description="Try a different keyword or browse all exhibitions."
            action={{ label: 'Browse exhibitions', href: '/exhibitions' }}
          />
        )
      ) : (
        <p className="text-sm text-text-muted">
          Type a keyword above to search across all exhibitions.
        </p>
      )}
    </Container>
  );
}
