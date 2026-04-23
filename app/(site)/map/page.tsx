import type { Metadata } from 'next';
import Link from 'next/link';
import { Map as MapIcon } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { GalleryAvatar } from '@/components/gallery/GalleryAvatar';
import { LondonMap } from '@/components/map/LondonMap';
import { getAllGalleries } from '@/lib/data';
import { galleryHref } from '@/lib/routes';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Map',
  description: 'Find galleries and exhibitions on the London map.',
};

export default async function MapPage() {
  const galleries = await getAllGalleries();
  const apiKey = process.env.NEXT_PUBLIC_GMAPS_KEY;

  return (
    <Container as="div" className="space-y-6 py-6 md:py-10">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Map</h1>
        <p className="text-text-muted">
          Tap a marker to see the gallery, then jump to its page.
        </p>
      </header>

      {apiKey ? (
        <LondonMap
          galleries={galleries.map((g) => ({
            id: g.id,
            name: g.name,
            shortName: g.shortName,
            lat: g.lat,
            lng: g.lng,
            borough: g.borough,
            logoUrl: g.logoUrl,
            address: g.address,
          }))}
          apiKey={apiKey}
        />
      ) : (
        <div
          role="status"
          className="flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted text-text-muted"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <MapIcon className="h-8 w-8" aria-hidden />
            <p className="text-sm">
              Interactive map is unavailable here. Browse the list below.
            </p>
          </div>
        </div>
      )}

      <section aria-labelledby="list-heading" className="space-y-3">
        <h2 id="list-heading" className="font-serif text-xl font-bold">
          Galleries by borough
        </h2>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {galleries.map((g) => (
            <li key={g.id}>
              <Link
                href={galleryHref(g.id)}
                className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <GalleryAvatar gallery={g} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{g.name}</span>
                  <span className="block truncate text-sm text-text-muted">
                    {g.borough ?? 'London'}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
