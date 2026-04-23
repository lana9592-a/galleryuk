import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/format';
import type { Gallery } from '@/lib/schemas';

export type GalleryAvatarProps = {
  gallery: Pick<Gallery, 'name' | 'shortName' | 'logoUrl'>;
  size?: 32 | 40 | 48;
  className?: string;
};

export function GalleryAvatar({ gallery, size = 40, className }: GalleryAvatarProps) {
  const displayName = gallery.shortName ?? gallery.name;

  if (gallery.logoUrl) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-full border border-border bg-surface',
          className,
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={gallery.logoUrl}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-border bg-surface-muted text-sm font-semibold text-text',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {getInitials(displayName)}
    </div>
  );
}
