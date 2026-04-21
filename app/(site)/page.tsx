import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ExhibitionCard } from '@/components/exhibition/ExhibitionCard';
import { ExhibitionHero } from '@/components/exhibition/ExhibitionHero';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getExhibitionsByStatus,
  getFeaturedExhibition,
  getGallery,
  getAllGalleries,
} from '@/lib/data';

export const revalidate = 3600;

export default async function HomePage() {
  const [featured, nowOn, comingSoon, galleries] = await Promise.all([
    getFeaturedExhibition(),
    getExhibitionsByStatus('now', 8),
    getExhibitionsByStatus('upcoming', 4),
    getAllGalleries(),
  ]);
  const galleryById = new Map(galleries.map((g) => [g.id, g]));
  const featuredGallery = featured ? await getGallery(featured.galleryId) : null;

  return (
    <Container as="div" className="space-y-12 py-6 md:space-y-16 md:py-10">
      <section aria-labelledby="hero-heading">
        <h1 id="hero-heading" className="sr-only">
          GalleryUK — Currently on view in London
        </h1>
        {featured && featuredGallery ? (
          <ExhibitionHero exhibition={featured} gallery={featuredGallery} />
        ) : (
          <EmptyState
            title="No featured exhibition"
            description="Check back soon for highlights."
          />
        )}
      </section>

      <section aria-labelledby="now-heading" className="space-y-5">
        <div className="flex items-end justify-between">
          <h2 id="now-heading" className="font-serif text-2xl font-bold md:text-3xl">
            Now on
          </h2>
          <Link
            href="/exhibitions"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            See all <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {nowOn.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {nowOn.map((e) => {
              const g = galleryById.get(e.galleryId);
              if (!g) return null;
              return (
                <li key={e.id}>
                  <ExhibitionCard exhibition={e} gallery={g} />
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="No exhibitions currently on" />
        )}
      </section>

      {comingSoon.length > 0 ? (
        <section aria-labelledby="soon-heading" className="space-y-5">
          <h2 id="soon-heading" className="font-serif text-2xl font-bold md:text-3xl">
            Coming soon
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {comingSoon.map((e) => {
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
      ) : null}
    </Container>
  );
}
