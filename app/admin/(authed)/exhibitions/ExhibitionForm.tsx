'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import {
  CategoryEnum,
  type Exhibition,
  type Gallery,
} from '@/lib/schemas';
import type { ExhibitionFormState } from './actions';

const initial: ExhibitionFormState = { status: 'idle' };

type Mode = 'create' | 'edit';

export type ExhibitionFormProps = {
  mode: Mode;
  initial?: Exhibition;
  galleries: Pick<Gallery, 'id' | 'name'>[];
  action: (
    state: ExhibitionFormState,
    formData: FormData,
  ) => Promise<ExhibitionFormState>;
};

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60"
    >
      {pending ? 'Saving…' : mode === 'create' ? 'Create exhibition' : 'Save changes'}
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

export function ExhibitionForm({
  mode,
  initial: initialData,
  galleries,
  action,
}: ExhibitionFormProps) {
  const [state, formAction] = useFormState(action, initial);
  const errors = state.fieldErrors ?? {};
  const tagsCsv = (initialData?.tags ?? []).join(', ');
  const artistsCsv = (initialData?.artists ?? []).join(', ');
  const imagesJson = initialData?.images
    ? JSON.stringify(initialData.images, null, 2)
    : '';

  return (
    <form action={formAction} className="space-y-8">
      {mode === 'edit' ? (
        <input type="hidden" name="originalId" value={initialData?.id ?? ''} />
      ) : null}

      {state.status === 'error' && state.message ? (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800"
        >
          {state.message}
        </div>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Identity
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              defaultValue={initialData?.id ?? ''}
              pattern="[a-z0-9-]+"
              className={`${inputBase} ${mode === 'edit' ? 'bg-surface-muted' : ''}`}
            />
          </Field>

          <Field label="Title" name="title" error={errors.title}>
            <input
              id="title"
              name="title"
              required
              defaultValue={initialData?.title ?? ''}
              className={inputBase}
            />
          </Field>

          <Field label="Gallery" name="galleryId" error={errors.galleryId}>
            <select
              id="galleryId"
              name="galleryId"
              required
              defaultValue={initialData?.galleryId ?? ''}
              className={inputBase}
            >
              <option value="" disabled>
                — Select a gallery —
              </option>
              {galleries.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category" name="category" error={errors.category}>
            <select
              id="category"
              name="category"
              required
              defaultValue={initialData?.category ?? ''}
              className={inputBase}
            >
              <option value="" disabled>
                — Select category —
              </option>
              {CategoryEnum.options.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Dates &amp; pricing
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Start date" name="startDate" error={errors.startDate}>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              defaultValue={initialData?.startDate ?? ''}
              className={inputBase}
            />
          </Field>

          <Field label="End date" name="endDate" error={errors.endDate}>
            <input
              id="endDate"
              name="endDate"
              type="date"
              required
              defaultValue={initialData?.endDate ?? ''}
              className={inputBase}
            />
          </Field>

          <Field
            label="Price from (£)"
            name="priceFrom"
            hint="Leave blank for free admission"
            error={errors.priceFrom}
          >
            <input
              id="priceFrom"
              name="priceFrom"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialData?.priceFrom ?? ''}
              className={inputBase}
            />
          </Field>

          <Field
            label="Price to (£)"
            name="priceTo"
            hint="Optional — only set if there is a price range"
            error={errors.priceTo}
          >
            <input
              id="priceTo"
              name="priceTo"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialData?.priceTo ?? ''}
              className={inputBase}
            />
          </Field>

          <Field
            label="Ticket URL"
            name="ticketUrl"
            hint="Optional. Public booking page."
            error={errors.ticketUrl}
          >
            <input
              id="ticketUrl"
              name="ticketUrl"
              type="url"
              defaultValue={initialData?.ticketUrl ?? ''}
              className={inputBase}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Content
        </h2>
        <Field
          label="Summary"
          name="summary"
          hint="Up to 200 characters. Shown on cards."
          error={errors.summary}
        >
          <textarea
            id="summary"
            name="summary"
            required
            maxLength={200}
            rows={2}
            defaultValue={initialData?.summary ?? ''}
            className="w-full rounded-md border border-border bg-surface p-3 text-sm outline-none focus:border-text"
          />
        </Field>

        <Field
          label="Description"
          name="description"
          hint="Full body. Markdown allowed."
          error={errors.description}
        >
          <textarea
            id="description"
            name="description"
            required
            rows={8}
            defaultValue={initialData?.description ?? ''}
            className="w-full rounded-md border border-border bg-surface p-3 text-sm outline-none focus:border-text"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Artists"
            name="artists"
            hint="Comma-separated. e.g. 'David Hockney, Lucian Freud'"
            error={errors.artists}
          >
            <input
              id="artists"
              name="artists"
              defaultValue={artistsCsv}
              className={inputBase}
            />
          </Field>

          <Field label="Curator" name="curator" error={errors.curator}>
            <input
              id="curator"
              name="curator"
              defaultValue={initialData?.curator ?? ''}
              className={inputBase}
            />
          </Field>
        </div>

        <Field
          label="Tags"
          name="tags"
          hint="Comma-separated. e.g. 'contemporary, group-show'"
          error={errors.tags}
        >
          <input
            id="tags"
            name="tags"
            defaultValue={tagsCsv}
            className={inputBase}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Media
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Hero image URL"
            name="heroImage"
            hint="Full URL incl. https://"
            error={errors.heroImage}
          >
            <input
              id="heroImage"
              name="heroImage"
              type="url"
              required
              defaultValue={initialData?.heroImage ?? ''}
              className={inputBase}
            />
          </Field>

          <Field label="Hero image alt" name="heroImageAlt" error={errors.heroImageAlt}>
            <input
              id="heroImageAlt"
              name="heroImageAlt"
              required
              defaultValue={initialData?.heroImageAlt ?? ''}
              className={inputBase}
            />
          </Field>
        </div>

        <Field
          label="Gallery images (JSON)"
          name="images"
          hint='Optional. Array of { "url": "...", "alt": "...", "caption": "..." }, max 8.'
          error={errors.images}
        >
          <textarea
            id="images"
            name="images"
            rows={5}
            defaultValue={imagesJson}
            className="w-full rounded-md border border-border bg-surface p-3 font-mono text-xs outline-none focus:border-text"
          />
        </Field>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Flags
        </h2>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initialData?.featured === true}
            className="h-4 w-4 rounded border-border"
          />
          Featured (used by the home page hero)
        </label>
      </section>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <Link
          href="/admin/exhibitions"
          className="text-sm text-text-muted hover:text-text"
        >
          Cancel
        </Link>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
