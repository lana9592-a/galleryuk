import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SearchClient } from '@/components/search/SearchClient';
import { getAllGalleries } from '@/lib/data';

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
  const galleries = await getAllGalleries();
  const initial = (searchParams.q ?? '').trim();

  return (
    <Container as="div" className="space-y-6 py-6 md:py-10">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Search</h1>
        <p className="text-text-muted">
          Search exhibitions by title, artist, or gallery.
        </p>
      </header>
      <SearchClient
        galleries={galleries.map((g) => ({
          id: g.id,
          name: g.name,
          shortName: g.shortName,
        }))}
        initialQuery={initial}
      />
    </Container>
  );
}
