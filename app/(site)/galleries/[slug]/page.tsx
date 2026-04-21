import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ExternalLink, MapPin } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { GalleryAvatar } from '@/components/gallery/GalleryAvatar';
import { ExhibitionCard } from '@/components/exhibition/ExhibitionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getAllGalleries,
  getExhibitionsByGallery,
  getGallery,
} from '@/lib/data';
import { getExhibitionStatus } from '@/lib/schemas';

export const revalidate = 3600;

export async function generateStaticParams() {
  const galleries = await getAllGalleries();
  return galleries.map((g) => ({ slug: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const gallery = await getGallery(params.slug);
  if (!gallery) return { title: 'Gallery not found' };
  return {
    title: gallery.name,
    description:
      gallery.description ?? `Visit ${gallery.name} in ${gallery.borough ?? 'London'}.`,
  };
}

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABEL: Record<(typeof DAY_ORDER)[number], string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export default async function GalleryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const gallery = await getGallery(params.slug);
  if (!gallery) notFound();

  const all = await getExhibitionsByGallery(gallery.id);
  const now = new Date();
  const nowOn = all.filter((e) => getExhibitionStatus(e, now) === 'now');
  const comingSoon = all.filter((e) => getExhibitionStatus(e, now) === 'upcoming');

  return (
    <Container as="div" className="space-y-10 py-6 md:py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-center">
        <GalleryAvatar gallery={gallery} size={48} className="md:h-16 md:w-16" />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-3xl font-bold md:text-4xl">{gallery.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-text-muted">
            <MapPin className="h-4 w-4" aria-hidden />
            {gallery.address}
          </p>
        </div>
        <a
          href={gallery.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus md:self-auto"
        >
          Visit website
          <ExternalLink className="h-4 w-4" aria-hidden />
          <span className="sr-only">(opens in new tab)</span>
        </a>
      </header>

      {gallery.description ? (
        <section className="max-w-prose">
          <p className="leading-relaxed text-text">{gallery.description}</p>
        </section>
      ) : null}

      {gallery.openingHours ? (
        <section aria-labelledby="hours-heading" className="space-y-3">
          <h2 id="hours-heading" className="font-serif text-xl font-bold">
            Opening hours
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            {DAY_ORDER.map((day) => (
              <div key={day} className="flex justify-between border-b border-border py-1">
                <dt className="font-medium">{DAY_LABEL[day]}</dt>
                <dd className="text-text-muted">
                  {gallery.openingHours?.[day] ?? 'Closed'}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section aria-labelledby="now-heading" className="space-y-5">
        <h2 id="now-heading" className="font-serif text-2xl font-bold md:text-3xl">
          Now on
        </h2>
        {nowOn.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {nowOn.map((e) => (
              <li key={e.id}>
                <ExhibitionCard exhibition={e} gallery={gallery} />
              </li>
            ))}
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
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {comingSoon.map((e) => (
              <li key={e.id}>
                <ExhibitionCard exhibition={e} gallery={gallery} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="border-t border-border pt-6">
        <Link
          href="/galleries"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← All galleries
        </Link>
      </section>
    </Container>
  );
}
