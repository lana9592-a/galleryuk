'use client';

import { Trash2 } from 'lucide-react';
import { deleteExhibition } from './actions';

export function DeleteExhibitionButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <form action={deleteExhibition}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-8 items-center gap-1 rounded-md border border-red-300 px-2 text-xs text-red-700 hover:bg-red-50"
        onClick={(event) => {
          if (!confirm(`Delete '${title}'? This cannot be undone.`)) {
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
