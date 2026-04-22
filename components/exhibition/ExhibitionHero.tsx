import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Exhibition, Gallery } from '@/lib/schemas';
import { formatDateShort, formatPriceCompact } from '@/lib/format';
import { exhibitionHref } from '@/lib/routes';

export type ExhibitionHeroProps = {
  exhibition: Exhibition;
  gallery: Gallery;
};

export function ExhibitionHero({ exhibition: e, gallery: g }: ExhibitionHeroProps) {
  const galleryName = g.shortName ?? g.name;
  return (
    <Link
      href={exhibitionHref(e.id)}
      className="group relative block overflow-hidden rounded-xl bg-text text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <div className="relative aspect-[16/9] w-full lg:aspect-[21/9]">
        <Image
          src={e.heroImage}
          alt={e.heroImageAlt}
          fill
          priority
          sizes="(min-width: 1024px) 1200px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
        <p className="mb-2 text-xs uppercase tracking-widest text-white/80">Featured · Now on</p>
        <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {e.title}
        </h2>
        <p className="mt-2 text-sm text-white/85 sm:text-base">
          {galleryName} · ends {formatDateShort(e.endDate)} · {formatPriceCompact(e.priceFrom, e.priceTo)}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
          View exhibition <ArrowRight aria-hidden className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
