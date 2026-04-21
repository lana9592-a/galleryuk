import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight, ExternalLink, MapPin } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { GalleryAvatar } from '@/components/gallery/GalleryAvatar';
import { ExhibitionCard } from '@/components/exhibition/ExhibitionCard';
import {
  getAllExhibitions,
  getExhibition,
  getExhibitionsByGallery,
  getGallery,
} from '@/lib/data';
import { getExhibitionStatus } from '@/lib/schemas';
import { formatDateRange, formatPrice } from '@/lib/format';
import { CATEGORY_LABEL, SITE_NAME } from '@/lib/constants';

export const revalidate = 3600;

export async function generateStaticParams() {
  const all = await getAllExhibitions();
  return all.map((e) => ({ slug: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const exhibition = await getExhibition(params.slug);
  if (!exhibition) return { title: 'Exhibition not found' };
  const gallery = await getGallery(exhibition.galleryId);
  return {
    title: exhibition.title,
    description: exhibition.summary,
    openGraph: {
      title: `${exhibition.title} · ${gallery?.name ?? SITE_NAME}`,
      description: exhibition.summary,
      images: [exhibition.heroImage],
    },
  };
}

export default async function ExhibitionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const exhibition = await getExhibition(params.slug);
  if (!exhibition) notFound();

  const gallery = await getGallery(exhibition.galleryId);
  if (!gallery) notFound();

  const status = getExhibitionStatus(exhibition);
  const otherAtGallery = (await getExhibitionsByGallery(gallery.id))
    .filter((e) => e.id !== exhibition.id && getExhibitionStatus(e) !== 'ended')
    .slice(0, 3);

  const statusTone =
    status === 'now' ? 'success' : status === 'upcoming' ? 'info' : 'neutral';
  const statusLabel =
    status === 'now' ? 'Now on' : status === 'upcoming' ? 'Coming soon' : 'Ended';

  return (
    <article>
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted md:aspect-[21/9]">
        <Image
          src={exhibition.heroImage}
          alt={exhibition.heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <Container as="div" className="space-y-10 py-8 md:py-12">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
            <Badge tone={statusTone}>{statusLabel}</Badge>
            <span>{CATEGORY_LABEL[exhibition.category]}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold leading-tight md:text-5xl">
            {exhibition.title}
          </h1>
          <p className="max-w-prose text-lg text-text-muted">{exhibition.summary}</p>
        </header>

        <section className="grid gap-8 border-y border-border py-6 md:grid-cols-[1fr_auto] md:items-start">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">Dates</dt>
              <dd className="mt-1 text-base font-medium">
                {formatDateRange(exhibition.startDate, exhibition.endDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">Admission</dt>
              <dd className="mt-1 text-base font-medium">
                {formatPrice(exhibition.priceFrom, exhibition.priceTo)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-muted">Venue</dt>
              <dd className="mt-1 text-base font-medium">{gallery.shortName ?? gallery.name}</dd>
            </div>
          </dl>

          {exhibition.ticketUrl ? (
            <a
              href={exhibition.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Book tickets
              <ExternalLink className="h-4 w-4" aria-hidden />
              <span className="sr-only">(opens in new tab)</span>
            </a>
          ) : (
            <span className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-surface px-6 text-sm font-medium text-text-muted">
              Free entry
            </span>
          )}
        </section>

        <section aria-labelledby="about-heading" className="max-w-prose space-y-4">
          <h2 id="about-heading" className="font-serif text-2xl font-bold">
            About the exhibition
          </h2>
          <p className="whitespace-pre-line leading-relaxed text-text">
            {exhibition.description}
          </p>
          {exhibition.artists && exhibition.artists.length > 0 ? (
            <p className="text-sm text-text-muted">
              <span className="font-semibold text-text">Featured artists: </span>
              {exhibition.artists.join(', ')}
            </p>
          ) : null}
          {exhibition.curator ? (
            <p className="text-sm text-text-muted">
              <span className="font-semibold text-text">Curator: </span>
              {exhibition.curator}
            </p>
          ) : null}
        </section>

        {exhibition.images && exhibition.images.length > 0 ? (
          <section aria-labelledby="gallery-heading" className="space-y-4">
            <h2 id="gallery-heading" className="font-serif text-2xl font-bold">
              Gallery
            </h2>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {exhibition.images.map((img) => (
                <li
                  key={img.url}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-muted"
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="venue-heading" className="space-y-4">
          <h2 id="venue-heading" className="font-serif text-2xl font-bold">
            Venue
          </h2>
          <Link
            href={`/galleries/${gallery.id}` as never}
            className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <GalleryAvatar gallery={gallery} size={48} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold">{gallery.name}</p>
              <p className="flex items-center gap-1 truncate text-sm text-text-muted">
                <MapPin className="h-4 w-4" aria-hidden />
                {gallery.address}
              </p>
            </div>
            <ArrowRight aria-hidden className="h-5 w-5 text-text-muted" />
          </Link>
        </section>

        {otherAtGallery.length > 0 ? (
          <section aria-labelledby="other-heading" className="space-y-5">
            <h2 id="other-heading" className="font-serif text-2xl font-bold">
              Also at {gallery.shortName ?? gallery.name}
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {otherAtGallery.map((e) => (
                <li key={e.id}>
                  <ExhibitionCard exhibition={e} gallery={gallery} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </article>
  );
}
