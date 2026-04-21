import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { GalleryCard } from '@/components/gallery/GalleryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAllExhibitions, getAllGalleries } from '@/lib/data';
import { getExhibitionStatus } from '@/lib/schemas';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Galleries',
  description: 'Discover museums and galleries in London hosting exhibitions.',
};

export default async function GalleriesPage() {
  const [galleries, exhibitions] = await Promise.all([
    getAllGalleries(),
    getAllExhibitions(),
  ]);

  const now = new Date();
  const activeByGallery = new Map<string, number>();
  for (const e of exhibitions) {
    if (getExhibitionStatus(e, now) !== 'now') continue;
    activeByGallery.set(e.galleryId, (activeByGallery.get(e.galleryId) ?? 0) + 1);
  }

  return (
    <Container as="div" className="space-y-8 py-6 md:py-10">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Galleries</h1>
        <p className="text-text-muted">
          {galleries.length} galleries in London
        </p>
      </header>

      {galleries.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {galleries.map((g) => (
            <li key={g.id}>
              <GalleryCard gallery={g} activeCount={activeByGallery.get(g.id) ?? 0} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No galleries yet" />
      )}
    </Container>
  );
}
