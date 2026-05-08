'use client';

import { Trash2 } from 'lucide-react';
import { deleteGallery } from './actions';

export function DeleteGalleryButton({
  id,
  name,
  exhibitionCount,
}: {
  id: string;
  name: string;
  exhibitionCount: number;
}) {
  return (
    <form action={deleteGallery}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-8 items-center gap-1 rounded-md border border-red-300 px-2 text-xs text-red-700 hover:bg-red-50"
        onClick={(event) => {
          const message =
            exhibitionCount > 0
              ? `Delete '${name}'? This will also delete its ${exhibitionCount} exhibition(s). This cannot be undone.`
              : `Delete '${name}'? This cannot be undone.`;
          if (!confirm(message)) {
            event.preventDefault();
          }
        }}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Delete
      </button>
    </form>
  );
}
