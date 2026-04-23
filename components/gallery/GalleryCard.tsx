import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Gallery } from '@/lib/schemas';
import { GalleryAvatar } from './GalleryAvatar';
import { galleryHref } from '@/lib/routes';
import { cn } from '@/lib/utils';

export type GalleryCardProps = {
  gallery: Pick<Gallery, 'id' | 'name' | 'shortName' | 'logoUrl' | 'borough'>;
  activeCount: number;
  distanceKm?: number;
  className?: string;
};

export function GalleryCard({
  gallery,
  activeCount,
  distanceKm,
  className,
}: GalleryCardProps) {
  const name = gallery.shortName ?? gallery.name;
  return (
    <Link
      href={galleryHref(gallery.id)}
      className={cn(
        'flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-colors',
        'hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        className,
      )}
    >
      <GalleryAvatar gallery={gallery} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold">{name}</p>
        <p className="truncate text-sm text-text-muted">
          {gallery.borough ?? 'London'}
          {distanceKm != null ? ` · ${distanceKm.toFixed(1)} km` : ''}
          {' · '}
          {activeCount} {activeCount === 1 ? 'exhibition' : 'exhibitions'}
        </p>
      </div>
      <ChevronRight aria-hidden className="h-5 w-5 text-text-muted" />
    </Link>
  );
}
