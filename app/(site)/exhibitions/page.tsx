import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { ExhibitionCard } from '@/components/exhibition/ExhibitionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAllExhibitions, getAllGalleries } from '@/lib/data';
import { CategoryEnum, getExhibitionStatus } from '@/lib/schemas';
import { CATEGORY_LABEL } from '@/lib/constants';
import { exhibitionsHref } from '@/lib/routes';
import { cn } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Exhibitions',
  description: 'Browse all current and upcoming art exhibitions across London.',
};

type Status = 'all' | 'now' | 'upcoming';
type Search = { status?: string; category?: string };

export default async function ExhibitionsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const [exhibitions, galleries] = await Promise.all([
    getAllExhibitions(),
    getAllGalleries(),
  ]);
  const galleryById = new Map(galleries.map((g) => [g.id, g]));

  const status: Status =
    searchParams.status === 'now' || searchParams.status === 'upcoming'
      ? searchParams.status
      : 'all';
  const categoryParsed = CategoryEnum.safeParse(searchParams.category);
  const category = categoryParsed.success ? categoryParsed.data : null;

  const now = new Date();
  const filtered = exhibitions
    .filter((e) => {
      const s = getExhibitionStatus(e, now);
      if (s === 'ended') return false;
      if (status !== 'all' && s !== status) return false;
      if (category && e.category !== category) return false;
      return true;
    })
    .sort((a, b) => a.endDate.localeCompare(b.endDate));

  const statusTabs: { value: Status; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'now', label: 'Now on' },
    { value: 'upcoming', label: 'Upcoming' },
  ];
  const categoryOptions = [null, ...CategoryEnum.options] as const;

  const buildHref = (next: { status?: Status; category?: string | null }) => {
    const s = next.status ?? status;
    const c = next.category === undefined ? category : next.category;
    const q = new URLSearchParams();
    if (s !== 'all') q.set('status', s);
    if (c) q.set('category', c);
    return exhibitionsHref(q);
  };

  return (
    <Container as="div" className="space-y-8 py-6 md:py-10">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Exhibitions</h1>
        <p className="text-text-muted">
          {filtered.length} {filtered.length === 1 ? 'exhibition' : 'exhibitions'} across London
        </p>
      </header>

      <div className="space-y-4">
        <nav aria-label="Filter by status">
          <ul className="flex gap-2" role="tablist">
            {statusTabs.map((t) => {
              const active = t.value === status;
              return (
                <li key={t.value} role="presentation">
                  <Link
                    role="tab"
                    aria-selected={active}
                    href={buildHref({ status: t.value })}
                    className={cn(
                      'inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors',
                      active
                        ? 'bg-text text-white'
                        : 'border border-border bg-surface text-text-muted hover:text-text',
                    )}
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav aria-label="Filter by category">
          <ul className="flex flex-wrap gap-2">
            {categoryOptions.map((c) => {
              const active = c === category;
              const label = c ? (CATEGORY_LABEL[c] ?? c) : 'All categories';
              return (
                <li key={c ?? 'all'}>
                  <Link
                    href={buildHref({ category: c })}
                    aria-pressed={active}
                    className={cn(
                      'inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors',
                      active
                        ? 'bg-primary text-white'
                        : 'border border-border bg-surface text-text-muted hover:text-text',
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {filtered.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {filtered.map((e) => {
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
        <EmptyState
          title="No exhibitions match your filters"
          description="Try clearing filters to see all exhibitions."
          action={{ label: 'Clear filters', href: '/exhibitions' }}
        />
      )}
    </Container>
  );
}
