import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus, Pencil } from 'lucide-react';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { DeleteGalleryButton } from './DeleteGalleryButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Galleries — Admin',
  robots: { index: false, follow: false },
};

type GalleryRow = {
  id: string;
  name: string;
  borough: string | null;
  exhibition_count: number;
};

async function getGalleriesWithCounts(): Promise<GalleryRow[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('galleries')
    .select('id, name, borough, exhibitions(count)')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((g) => ({
    id: g.id as string,
    name: g.name as string,
    borough: (g.borough as string | null) ?? null,
    exhibition_count:
      Array.isArray(g.exhibitions) && g.exhibitions.length > 0
        ? Number((g.exhibitions[0] as { count: number }).count ?? 0)
        : 0,
  }));
}

export default async function AdminGalleriesPage() {
  const galleries = await getGalleriesWithCounts();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Galleries</h1>
          <p className="text-sm text-text-muted">
            {galleries.length} {galleries.length === 1 ? 'gallery' : 'galleries'}
          </p>
        </div>
        <Link
          href="/admin/galleries/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New gallery
        </Link>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Borough</th>
              <th className="px-4 py-3 text-right">Exhibitions</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {galleries.map((g) => (
              <tr key={g.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-mono text-xs text-text-muted">
                  {g.id}
                </td>
                <td className="px-4 py-3 font-medium">{g.name}</td>
                <td className="px-4 py-3 text-text-muted">{g.borough ?? '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {g.exhibition_count}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={{ pathname: `/admin/galleries/${g.id}` }}
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs hover:bg-surface-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit
                    </Link>
                    <DeleteGalleryButton
                      id={g.id}
                      name={g.name}
                      exhibitionCount={g.exhibition_count}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {galleries.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-text-muted"
                >
                  No galleries yet — click &ldquo;New gallery&rdquo; to add one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
