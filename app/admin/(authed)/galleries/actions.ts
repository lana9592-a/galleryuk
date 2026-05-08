'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { GallerySchema } from '@/lib/schemas';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export type FieldErrors = Partial<Record<string, string>>;

export type GalleryFormState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: FieldErrors;
};

const idle: GalleryFormState = { status: 'idle' };

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

const numberOrUndefined = (value: FormDataEntryValue | null): number | undefined => {
  const s = trimNullable(value);
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : Number.NaN;
};

const tagsFromCsv = (value: FormDataEntryValue | null): string[] | undefined => {
  const s = trimNullable(value);
  if (!s) return undefined;
  const arr = s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return arr.length > 0 ? arr : undefined;
};

const openingHoursFromJson = (
  value: FormDataEntryValue | null,
): Record<string, string> | undefined => {
  const s = trimNullable(value);
  if (!s) return undefined;
  try {
    const parsed = JSON.parse(s) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      Object.values(parsed as object).every((v) => typeof v === 'string')
    ) {
      return parsed as Record<string, string>;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

function readGalleryForm(formData: FormData): {
  parsed?: z.infer<typeof GallerySchema>;
  errors?: FieldErrors;
} {
  const candidate = {
    id: trimNullable(formData.get('id')),
    name: trimNullable(formData.get('name')),
    shortName: trimNullable(formData.get('shortName')),
    lat: numberOrUndefined(formData.get('lat')),
    lng: numberOrUndefined(formData.get('lng')),
    address: trimNullable(formData.get('address')),
    city: trimNullable(formData.get('city')) ?? 'London',
    borough: trimNullable(formData.get('borough')),
    website: trimNullable(formData.get('website')),
    logoUrl: trimNullable(formData.get('logoUrl')),
    openingHours: openingHoursFromJson(formData.get('openingHours')),
    description: trimNullable(formData.get('description')),
    tags: tagsFromCsv(formData.get('tags')),
  };

  const result = GallerySchema.safeParse(candidate);
  if (result.success) return { parsed: result.data };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_form';
    if (!errors[key]) errors[key] = issue.message;
  }
  return { errors };
}

function toRow(g: z.infer<typeof GallerySchema>) {
  return {
    id: g.id,
    name: g.name,
    short_name: g.shortName ?? null,
    lat: g.lat,
    lng: g.lng,
    address: g.address,
    city: g.city ?? 'London',
    borough: g.borough ?? null,
    website: g.website,
    logo_url: g.logoUrl ?? null,
    opening_hours: g.openingHours ?? null,
    description: g.description ?? null,
    tags: g.tags ?? null,
  };
}

function revalidatePublic() {
  revalidatePath('/admin/galleries');
  revalidatePath('/galleries');
  revalidatePath('/');
  revalidatePath('/map');
  revalidatePath('/exhibitions');
}

export async function createGallery(
  _prev: GalleryFormState,
  formData: FormData,
): Promise<GalleryFormState> {
  await assertAdmin();

  const { parsed, errors } = readGalleryForm(formData);
  if (!parsed) {
    return {
      status: 'error',
      message: 'Please correct the highlighted fields.',
      fieldErrors: errors,
    };
  }

  const { error } = await getSupabaseAdmin().from('galleries').insert(toRow(parsed));
  if (error) {
    return {
      status: 'error',
      message: error.code === '23505'
        ? `A gallery with id "${parsed.id}" already exists.`
        : `Could not save: ${error.message}`,
    };
  }

  revalidatePublic();
  redirect('/admin/galleries');
}

export async function updateGallery(
  _prev: GalleryFormState,
  formData: FormData,
): Promise<GalleryFormState> {
  await assertAdmin();

  const originalId = trimNullable(formData.get('originalId'));
  if (!originalId) {
    return { status: 'error', message: 'Missing originalId.' };
  }

  const { parsed, errors } = readGalleryForm(formData);
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
      message: 'Changing the id of an existing gallery is not supported. Delete and recreate instead.',
      fieldErrors: { id: 'Cannot change id after creation' },
    };
  }

  const { error } = await getSupabaseAdmin()
    .from('galleries')
    .update(toRow(parsed))
    .eq('id', originalId);
  if (error) {
    return { status: 'error', message: `Could not save: ${error.message}` };
  }

  revalidatePublic();
  revalidatePath(`/galleries/${originalId}`);
  redirect('/admin/galleries');
}

export async function deleteGallery(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = trimNullable(formData.get('id'));
  if (!id) return;
  const { error } = await getSupabaseAdmin().from('galleries').delete().eq('id', id);
  if (error) {
    throw new Error(`Could not delete gallery: ${error.message}`);
  }
  revalidatePublic();
  redirect('/admin/galleries');
}

export const initialGalleryFormState = idle;
