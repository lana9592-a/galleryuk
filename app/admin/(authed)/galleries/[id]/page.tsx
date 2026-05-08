import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { GallerySchema } from '@/lib/schemas';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { GalleryForm } from '../GalleryForm';
import { updateGallery } from '../actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit gallery — Admin',
  robots: { index: false, follow: false },
};

type Row = Record<string, unknown>;

function mapGalleryRow(row: Row) {
  return GallerySchema.parse({
    id: row.id,
    name: row.name,
    shortName: row.short_name ?? undefined,
    lat: Number(row.lat),
    lng: Number(row.lng),
    address: row.address,
    city: row.city ?? 'London',
    borough: row.borough ?? undefined,
    website: row.website,
    logoUrl: row.logo_url ?? undefined,
    openingHours: row.opening_hours ?? undefined,
    description: row.description ?? undefined,
    tags: row.tags ?? undefined,
  });
}

export default async function EditGalleryPage({
  params,
}: {
  params: { id: string };
}) {
  const { data, error } = await getSupabaseAdmin()
    .from('galleries')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) notFound();

  const gallery = mapGalleryRow(data as Row);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/galleries"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to galleries
      </Link>
      <header>
        <h1 className="font-serif text-3xl font-bold">Edit gallery</h1>
        <p className="text-sm text-text-muted">{gallery.name}</p>
      </header>

      <GalleryForm mode="edit" initial={gallery} action={updateGallery} />
    </div>
  );
}
