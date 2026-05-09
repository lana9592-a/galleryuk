'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ExhibitionSchema } from '@/lib/schemas';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export type FieldErrors = Partial<Record<string, string>>;

export type ExhibitionFormState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: FieldErrors;
};

async function assertAdmin(): Promise<void> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = user?.email?.trim().toLowerCase();
  if (!user || !adminEmail || userEmail !== adminEmail) {
    throw new Error('Unauthorized');
  }
}

const trimNullable = (value: FormDataEntryValue | null): string | undefined => {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s === '' ? undefined : s;
};

const numberOrNull = (
  value: FormDataEntryValue | null,
): number | null | typeof Number.NaN => {
  const s = trimNullable(value);
  if (s === undefined) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : Number.NaN;
};

const csvArray = (value: FormDataEntryValue | null): string[] | undefined => {
  const s = trimNullable(value);
  if (!s) return undefined;
  const arr = s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return arr.length > 0 ? arr : undefined;
};

const jsonImages = (
  value: FormDataEntryValue | null,
):
  | { url: string; alt: string; caption?: string }[]
  | undefined
  | typeof INVALID_JSON => {
  const s = trimNullable(value);
  if (!s) return undefined;
  try {
    const parsed = JSON.parse(s) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as { url: string; alt: string; caption?: string }[];
    }
    return INVALID_JSON;
  } catch {
    return INVALID_JSON;
  }
};

const INVALID_JSON = Symbol('invalid-json');

function readExhibitionForm(formData: FormData): {
  parsed?: z.infer<typeof ExhibitionSchema>;
  errors?: FieldErrors;
} {
  const images = jsonImages(formData.get('images'));
  if (images === INVALID_JSON) {
    return { errors: { images: 'Images must be a JSON array of {url, alt, caption?}.' } };
  }

  const candidate = {
    id: trimNullable(formData.get('id')),
    title: trimNullable(formData.get('title')),
    galleryId: trimNullable(formData.get('galleryId')),
    startDate: trimNullable(formData.get('startDate')),
    endDate: trimNullable(formData.get('endDate')),
    priceFrom: numberOrNull(formData.get('priceFrom')),
    priceTo: numberOrNull(formData.get('priceTo')),
    ticketUrl: trimNullable(formData.get('ticketUrl')) ?? null,
    category: trimNullable(formData.get('category')),
    tags: csvArray(formData.get('tags')),
    summary: trimNullable(formData.get('summary')),
    description: trimNullable(formData.get('description')),
    artists: csvArray(formData.get('artists')),
    curator: trimNullable(formData.get('curator')),
    heroImage: trimNullable(formData.get('heroImage')),
    heroImageAlt: trimNullable(formData.get('heroImageAlt')),
    images,
    featured: formData.get('featured') === 'on',
  };

  const result = ExhibitionSchema.safeParse(candidate);
  if (result.success) return { parsed: result.data };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_form';
    if (!errors[key]) errors[key] = issue.message;
  }
  return { errors };
}

function toRow(e: z.infer<typeof ExhibitionSchema>) {
  return {
    id: e.id,
    title: e.title,
    gallery_id: e.galleryId,
    start_date: e.startDate,
    end_date: e.endDate,
    price_from: e.priceFrom ?? null,
    price_to: e.priceTo ?? null,
    ticket_url: e.ticketUrl ?? null,
    category: e.category,
    tags: e.tags ?? null,
    summary: e.summary,
    description: e.description,
    artists: e.artists ?? null,
    curator: e.curator ?? null,
    hero_image: e.heroImage,
    hero_image_alt: e.heroImageAlt,
    images: e.images ?? null,
    featured: e.featured ?? false,
  };
}

function revalidatePublic(exhibitionId?: string, galleryId?: string) {
  revalidatePath('/admin/exhibitions');
  revalidatePath('/');
  revalidatePath('/exhibitions');
  if (exhibitionId) revalidatePath(`/exhibitions/${exhibitionId}`);
  if (galleryId) revalidatePath(`/galleries/${galleryId}`);
  revalidatePath('/search');
  revalidatePath('/galleries');
}

export async function createExhibition(
  _prev: ExhibitionFormState,
  formData: FormData,
): Promise<ExhibitionFormState> {
  await assertAdmin();

  const { parsed, errors } = readExhibitionForm(formData);
  if (!parsed) {
    return {
      status: 'error',
      message: 'Please correct the highlighted fields.',
      fieldErrors: errors,
    };
  }

  const { error } = await getSupabaseAdmin().from('exhibitions').insert(toRow(parsed));
  if (error) {
    return {
      status: 'error',
      message:
        error.code === '23505'
          ? `An exhibition with id "${parsed.id}" already exists.`
          : error.code === '23503'
            ? `Gallery "${parsed.galleryId}" does not exist.`
            : `Could not save: ${error.message}`,
    };
  }

  revalidatePublic(parsed.id, parsed.galleryId);
  redirect('/admin/exhibitions');
}

export async function updateExhibition(
  _prev: ExhibitionFormState,
  formData: FormData,
): Promise<ExhibitionFormState> {
  await assertAdmin();

  const originalId = trimNullable(formData.get('originalId'));
  if (!originalId) {
    return { status: 'error', message: 'Missing originalId.' };
  }

  const { parsed, errors } = readExhibitionForm(formData);
  if (!parsed) {
    return {
      status: 'error',
      message: 'Please correct the highlighted fields.',
      fieldErrors: errors,
    };
  }

  if (parsed.id !== originalId) {
    return {
      status: 'error',
      message:
        'Changing the id of an existing exhibition is not supported. Delete and recreate instead.',
      fieldErrors: { id: 'Cannot change id after creation' },
    };
  }

  const { error } = await getSupabaseAdmin()
    .from('exhibitions')
    .update(toRow(parsed))
    .eq('id', originalId);
  if (error) {
    return { status: 'error', message: `Could not save: ${error.message}` };
  }

  revalidatePublic(originalId, parsed.galleryId);
  redirect('/admin/exhibitions');
}

export async function deleteExhibition(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = trimNullable(formData.get('id'));
  if (!id) return;

  // Look up galleryId for revalidation.
  const { data } = await getSupabaseAdmin()
    .from('exhibitions')
    .select('gallery_id')
    .eq('id', id)
    .maybeSingle();

  const { error } = await getSupabaseAdmin().from('exhibitions').delete().eq('id', id);
  if (error) {
    throw new Error(`Could not delete exhibition: ${error.message}`);
  }
  revalidatePublic(id, (data?.gallery_id as string | undefined) ?? undefined);
  redirect('/admin/exhibitions');
}
