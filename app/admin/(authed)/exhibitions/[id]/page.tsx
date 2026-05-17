import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ExhibitionSchema } from '@/lib/schemas';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ExhibitionForm } from '../ExhibitionForm';
import { updateExhibition } from '../actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit exhibition — Admin',
  robots: { index: false, follow: false },
};

type Row = Record<string, unknown>;

function mapExhibitionRow(row: Row) {
  return ExhibitionSchema.parse({
    id: row.id,
    title: row.title,
    galleryId: row.gallery_id,
    startDate: row.start_date,
    endDate: row.end_date,
    priceFrom: row.price_from === null ? undefined : Number(row.price_from),
    priceTo: row.price_to === null ? undefined : Number(row.price_to),
    ticketUrl: row.ticket_url ?? undefined,
    category: row.category,
    tags: row.tags ?? undefined,
    summary: row.summary,
    description: row.description,
    artists: row.artists ?? undefined,
    curator: row.curator ?? undefined,
    heroImage: row.hero_image,
    heroImageAlt: row.hero_image_alt,
    images: row.images ?? undefined,
    featured: row.featured ?? false,
    verified: row.verified ?? false,
  });
}

export default async function EditExhibitionPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = getSupabaseAdmin();
  const [exhibitionResult, galleriesResult] = await Promise.all([
    admin.from('exhibitions').select('*').eq('id', params.id).maybeSingle(),
    admin.from('galleries').select('id, name').order('name', { ascending: true }),
  ]);

  if (exhibitionResult.error) throw new Error(exhibitionResult.error.message);
  if (!exhibitionResult.data) notFound();
  if (galleriesResult.error) throw new Error(galleriesResult.error.message);

  const exhibition = mapExhibitionRow(exhibitionResult.data as Row);
  const galleries = (galleriesResult.data ?? []).map((g) => ({
    id: g.id as string,
    name: g.name as string,
  }));

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
        <h1 className="font-serif text-3xl font-bold">Edit exhibition</h1>
        <p className="text-sm text-text-muted">{exhibition.title}</p>
      </header>

      <ExhibitionForm
        mode="edit"
        initial={exhibition}
        galleries={galleries}
        action={updateExhibition}
      />
    </div>
  );
}
