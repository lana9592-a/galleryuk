import { z } from 'zod';
import { CategoryEnum, getExhibitionStatus, type Exhibition } from './schemas';

export const StatusEnum = z.enum(['now', 'upcoming', 'ended', 'all']);
export type StatusFilter = z.infer<typeof StatusEnum>;

export const ExhibitionsQuerySchema = z.object({
  status: StatusEnum.optional().default('all'),
  category: CategoryEnum.optional(),
  q: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
export type ExhibitionsQuery = z.infer<typeof ExhibitionsQuerySchema>;

export function filterExhibitions(
  exhibitions: Exhibition[],
  galleryNameById: Map<string, string>,
  query: ExhibitionsQuery,
  now: Date = new Date(),
): Exhibition[] {
  const needle = query.q ? query.q.toLowerCase() : null;

  const filtered = exhibitions.filter((e) => {
    const status = getExhibitionStatus(e, now);
    if (query.status !== 'all' && status !== query.status) return false;
    if (query.category && e.category !== query.category) return false;
    if (needle) {
      const haystack = [
        e.title,
        e.summary,
        e.category,
        ...(e.artists ?? []),
        ...(e.tags ?? []),
        galleryNameById.get(e.galleryId) ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const sorted = filtered.sort((a, b) => {
    if (query.status === 'upcoming') return a.startDate.localeCompare(b.startDate);
    return a.endDate.localeCompare(b.endDate);
  });

  return query.limit ? sorted.slice(0, query.limit) : sorted;
}
