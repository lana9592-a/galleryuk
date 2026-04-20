import Image from 'next/image';
import Link from 'next/link';
import type { Exhibition, Gallery } from '@/lib/schemas';
import { formatDateShort, formatPriceCompact } from '@/lib/format';
import { CATEGORY_LABEL } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'featured' | 'compact' | 'horizontal';

const aspectFor: Record<Variant, string> = {
  default: 'aspect-[4/3]',
  featured: 'aspect-[16/9]',
  compact: 'aspect-square',
  horizontal: 'aspect-[16/9]',
};

export function ExhibitionCard({
  exhibition: e,
  gallery: g,
  variant = 'default',
  priority = false,
  className,
}: {
  exhibition: Pick<
    Exhibition,
    'id' | 'title' | 'heroImage' | 'heroImageAlt' | 'startDate' | 'endDate' | 'category' | 'priceFrom' | 'priceTo'
  >;
  gallery: Pick<Gallery, 'id' | 'name' | 'shortName'>;
  variant?: Variant;
  priority?: boolean;
  className?: string;
}) {
  const galleryName = g.shortName ?? g.name;
  const accessibleName = `${e.title}, ${galleryName}, ends ${formatDateShort(e.endDate)}`;

  return (
    <Link
      href={`/exhibitions/${e.id}` as never}
      aria-label={accessibleName}
      className={cn(
        'group block overflow-hidden rounded-lg bg-surface transition-shadow',
        'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        className,
      )}
    >
      <div className={cn('relative w-full overflow-hidden rounded-lg bg-surface-muted', aspectFor[variant])}>
        <Image
          src={e.heroImage}
          alt={e.heroImageAlt}
          fill
          priority={priority}
          sizes={
            variant === 'featured'
              ? '(min-width: 1024px) 800px, 100vw'
              : '(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw'
          }
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="space-y-1 pt-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
          <span>{CATEGORY_LABEL[e.category] ?? e.category}</span>
          <span aria-hidden>·</span>
          <span>{formatPriceCompact(e.priceFrom, e.priceTo)}</span>
        </div>
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{e.title}</h3>
        <p className="text-sm text-text-muted">
          {galleryName} · ~{formatDateShort(e.endDate)}
        </p>
      </div>
    </Link>
  );
}
