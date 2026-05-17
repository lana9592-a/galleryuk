import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus, Pencil, Lock } from 'lucide-react';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { formatDateShort } from '@/lib/format';
import { CATEGORY_LABEL } from '@/lib/constants';
import { getExhibitionStatus } from '@/lib/schemas';
import type { Category, ExhibitionStatus } from '@/lib/schemas';
import { DeleteExhibitionButton } from './DeleteExhibitionButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Exhibitions — Admin',
  robots: { index: false, follow: false },
};

type ExhibitionRow = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  category: Category;
  gallery_id: string;
  verified: boolean;
  galleries: { name: string } | null;
};

const statusBadgeClass: Record<ExhibitionStatus, string> = {
  now: 'bg-green-100 text-green-800',
  upcoming: 'bg-blue-100 text-blue-800',
  ended: 'bg-surface-muted text-text-muted',
};

const statusLabel: Record<ExhibitionStatus, string> = {
  now: 'Now on',
  upcoming: 'Upcoming',
  ended: 'Ended',
};

async function getExhibitions(): Promise<ExhibitionRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('exhibitions')
    .select(
      'id, title, start_date, end_date, category, gallery_id, verified, galleries(name)',
    )
    .order('start_date', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    start_date: row.start_date as string,
    end_date: row.end_date as string,
    category: row.category as Category,
    gallery_id: row.gallery_id as string,
    verified: (row.verified as boolean | null) ?? false,
    galleries:
      row.galleries && typeof row.galleries === 'object' && 'name' in row.galleries
        ? { name: (row.galleries as { name: string }).name }
        : null,
  }));
}

export default async function AdminExhibitionsPage() {
  const exhibitions = await getExhibitions();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Exhibitions</h1>
          <p className="text-sm text-text-muted">
            {exhibitions.length} {exhibitions.length === 1 ? 'exhibition' : 'exhibitions'}
          </p>
        </div>
        <Link
          href="/admin/exhibitions/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New exhibition
        </Link>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Gallery</th>
              <th className="px-4 py-3 text-left">Dates</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exhibitions.map((e) => {
              const status = getExhibitionStatus({
                startDate: e.start_date,
                endDate: e.end_date,
              });
              return (
                <tr
                  key={e.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1.5 font-medium">
                      {e.title}
                      {e.verified ? (
                        <Lock
                          className="h-3.5 w-3.5 text-text-muted"
                          aria-label="Verified — scraper will skip this row"
                        />
                      ) : null}
                    </p>
                    <p className="font-mono text-xs text-text-muted">{e.id}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {e.galleries?.name ?? e.gallery_id}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatDateShort(e.start_date)} → {formatDateShort(e.end_date)}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {CATEGORY_LABEL[e.category]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass[status]}`}
                    >
                      {statusLabel[status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={{ pathname: `/admin/exhibitions/${e.id}` }}
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs hover:bg-surface-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </Link>
                      <DeleteExhibitionButton id={e.id} title={e.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {exhibitions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-text-muted"
                >
                  No exhibitions yet — click &ldquo;New exhibition&rdquo; to add one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
