'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { GalleryAvatar } from '@/components/gallery/GalleryAvatar';
import { LONDON_CENTER } from '@/lib/constants';
import { galleryHref } from '@/lib/routes';
import type { Gallery } from '@/lib/schemas';

export type LondonMapProps = {
  galleries: Pick<
    Gallery,
    'id' | 'name' | 'shortName' | 'lat' | 'lng' | 'borough' | 'logoUrl' | 'address'
  >[];
  apiKey: string;
};

const CONTAINER_STYLE = { width: '100%', height: '100%' } as const;

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: 'greedy',
};

export function LondonMap({ galleries, apiKey }: LondonMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'galleryuk-gmaps',
    googleMapsApiKey: apiKey,
  });
  const [selected, setSelected] = useState<LondonMapProps['galleries'][number] | null>(
    null,
  );
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    for (const m of markersRef.current) m.setMap(null);
    clustererRef.current?.clearMarkers();

    const markers = galleries.map((g) => {
      const marker = new google.maps.Marker({
        position: { lat: g.lat, lng: g.lng },
        title: g.name,
      });
      marker.addListener('click', () => setSelected(g));
      return marker;
    });
    markersRef.current = markers;
    clustererRef.current = new MarkerClusterer({ map: mapRef.current, markers });

    return () => {
      for (const m of markers) m.setMap(null);
      clustererRef.current?.clearMarkers();
      clustererRef.current = null;
    };
  }, [isLoaded, galleries]);

  const center = useMemo(
    () => ({ lat: LONDON_CENTER.lat, lng: LONDON_CENTER.lng }),
    [],
  );

  if (loadError) {
    return (
      <div
        role="alert"
        className="flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-border bg-surface-muted p-6 text-center text-text-muted"
      >
        Could not load the map right now. Please try again later.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        aria-busy
        className="aspect-[16/10] w-full animate-pulse rounded-lg bg-surface-muted"
      />
    );
  }

  return (
    <div className="relative">
      <div className="aspect-[16/10] w-full overflow-hidden rounded-lg">
        <GoogleMap
          center={center}
          zoom={12}
          options={MAP_OPTIONS}
          mapContainerStyle={CONTAINER_STYLE}
          onLoad={onLoad}
        />
      </div>
      {selected ? (
        <aside
          aria-label={`${selected.name} details`}
          className="absolute inset-x-2 bottom-2 rounded-lg border border-border bg-surface p-4 shadow-lg md:inset-x-auto md:right-4 md:w-80"
        >
          <div className="flex items-start gap-3">
            <GalleryAvatar gallery={selected} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{selected.name}</p>
              <p className="truncate text-sm text-text-muted">
                {selected.borough ?? 'London'} · {selected.address}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              ✕
            </button>
          </div>
          <Link
            href={galleryHref(selected.id)}
            className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md bg-text text-sm font-semibold text-white hover:bg-text/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            View gallery
          </Link>
        </aside>
      ) : null}
    </div>
  );
}
