'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import type { Gallery } from '@/lib/schemas';
import type { GalleryFormState } from './actions';

const initialGalleryFormState: GalleryFormState = { status: 'idle' };

type Mode = 'create' | 'edit';

export type GalleryFormProps = {
  mode: Mode;
  initial?: Gallery;
  action: (
    state: GalleryFormState,
    formData: FormData,
  ) => Promise<GalleryFormState>;
};

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60"
    >
      {pending ? 'Saving…' : mode === 'create' ? 'Create gallery' : 'Save changes'}
    </button>
  );
}

function Field({
  label,
  name,
  hint,
  error,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-text-muted">{hint}</p> : null}
      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputBase =
  'h-11 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-text';

export function GalleryForm({ mode, initial, action }: GalleryFormProps) {
  const [state, formAction] = useFormState(action, initialGalleryFormState);
  const errors = state.fieldErrors ?? {};
  const tagsCsv = (initial?.tags ?? []).join(', ');
  const openingHoursValue = initial?.openingHours
    ? JSON.stringify(initial.openingHours, null, 2)
    : '';

  return (
    <form action={formAction} className="space-y-6">
      {mode === 'edit' ? (
        <input type="hidden" name="originalId" value={initial?.id ?? ''} />
      ) : null}

      {state.status === 'error' && state.message ? (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
        >
          {state.message}
        </div>
      ) : null}

      <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Slug (id)"
          name="id"
          hint="lowercase, hyphenated. Cannot change after creation."
          error={errors.id}
        >
          <input
            id="id"
            name="id"
            required
            readOnly={mode === 'edit'}
            defaultValue={initial?.id ?? ''}
            pattern="[a-z0-9-]+"
            className={`${inputBase} ${mode === 'edit' ? 'bg-surface-muted' : ''}`}
          />
        </Field>

        <Field label="Name" name="name" error={errors.name}>
          <input
            id="name"
            name="name"
            required
            defaultValue={initial?.name ?? ''}
            className={inputBase}
          />
        </Field>

        <Field
          label="Short name"
          name="shortName"
          hint="Optional, e.g. 'V&A'"
          error={errors.shortName}
        >
          <input
            id="shortName"
            name="shortName"
            defaultValue={initial?.shortName ?? ''}
            className={inputBase}
          />
        </Field>

        <Field label="Borough" name="borough" error={errors.borough}>
          <input
            id="borough"
            name="borough"
            defaultValue={initial?.borough ?? ''}
            className={inputBase}
          />
        </Field>

        <Field
          label="Latitude"
          name="lat"
          hint="49–61 (UK window)"
          error={errors.lat}
        >
          <input
            id="lat"
            name="lat"
            type="number"
            step="0.0001"
            required
            defaultValue={initial?.lat ?? ''}
            className={inputBase}
          />
        </Field>

        <Field
          label="Longitude"
          name="lng"
          hint="-8–2 (UK window)"
          error={errors.lng}
        >
          <input
            id="lng"
            name="lng"
            type="number"
            step="0.0001"
            required
            defaultValue={initial?.lng ?? ''}
            className={inputBase}
          />
        </Field>

        <Field
          label="Address"
          name="address"
          error={errors.address}
        >
          <input
            id="address"
            name="address"
            required
            defaultValue={initial?.address ?? ''}
            className={inputBase}
          />
        </Field>

        <Field label="City" name="city" hint="Defaults to London." error={errors.city}>
          <input
            id="city"
            name="city"
            defaultValue={initial?.city ?? 'London'}
            className={inputBase}
          />
        </Field>

        <Field
          label="Website"
          name="website"
          hint="Full URL incl. https://"
          error={errors.website}
        >
          <input
            id="website"
            name="website"
            type="url"
            required
            defaultValue={initial?.website ?? ''}
            className={inputBase}
          />
        </Field>

        <Field
          label="Logo URL"
          name="logoUrl"
          hint="Optional"
          error={errors.logoUrl}
        >
          <input
            id="logoUrl"
            name="logoUrl"
            defaultValue={initial?.logoUrl ?? ''}
            className={inputBase}
          />
        </Field>

        <Field
          label="What's on URL"
          name="whatsOnUrl"
          hint="Gallery's exhibition listing page. Used by the auto-scraper. Leave blank to skip."
          error={errors.whatsOnUrl}
        >
          <input
            id="whatsOnUrl"
            name="whatsOnUrl"
            type="url"
            defaultValue={initial?.whatsOnUrl ?? ''}
            className={inputBase}
          />
        </Field>
      </fieldset>

      <Field
        label="Tags"
        name="tags"
        hint="Comma-separated, e.g. 'contemporary, free-entry'"
        error={errors.tags}
      >
        <input
          id="tags"
          name="tags"
          defaultValue={tagsCsv}
          className={inputBase}
        />
      </Field>

      <Field
        label="Description"
        name="description"
        hint="Up to 400 characters"
        error={errors.description}
      >
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={400}
          defaultValue={initial?.description ?? ''}
          className="w-full rounded-md border border-border bg-surface p-3 text-sm outline-none focus:border-text"
        />
      </Field>

      <Field
        label="Opening hours (JSON)"
        name="openingHours"
        hint='Optional. Example: {"mon":"10:00-18:00","tue":"10:00-18:00",...}'
        error={errors.openingHours}
      >
        <textarea
          id="openingHours"
          name="openingHours"
          rows={4}
          defaultValue={openingHoursValue}
          className="w-full rounded-md border border-border bg-surface p-3 font-mono text-xs outline-none focus:border-text"
        />
      </Field>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <Link
          href="/admin/galleries"
          className="text-sm text-text-muted hover:text-text"
        >
          Cancel
        </Link>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
