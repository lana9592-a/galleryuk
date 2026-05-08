import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { GalleryForm } from '../GalleryForm';
import { createGallery } from '../actions';

export const metadata: Metadata = {
  title: 'New gallery — Admin',
  robots: { index: false, follow: false },
};

export default function NewGalleryPage() {
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
        <h1 className="font-serif text-3xl font-bold">New gallery</h1>
        <p className="text-sm text-text-muted">
          Add a new venue. The slug must be lowercase and hyphenated, and is
          permanent once created.
        </p>
      </header>

      <GalleryForm mode="create" action={createGallery} />
    </div>
  );
}
