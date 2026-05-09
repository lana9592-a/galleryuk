import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ExhibitionForm } from '../ExhibitionForm';
import { createExhibition } from '../actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'New exhibition — Admin',
  robots: { index: false, follow: false },
};

async function getGalleryOptions() {
  const { data, error } = await getSupabaseAdmin()
    .from('galleries')
    .select('id, name')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((g) => ({
    id: g.id as string,
    name: g.name as string,
  }));
}

export default async function NewExhibitionPage() {
  const galleries = await getGalleryOptions();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/exhibitions"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to exhibitions
      </Link>
      <header>
        <h1 className="font-serif text-3xl font-bold">New exhibition</h1>
        <p className="text-sm text-text-muted">
          Pick a gallery, fill in the details, save. The slug must be lowercase
          and hyphenated, and is permanent once created.
        </p>
      </header>

      <ExhibitionForm
        mode="create"
        galleries={galleries}
        action={createExhibition}
      />
    </div>
  );
}
