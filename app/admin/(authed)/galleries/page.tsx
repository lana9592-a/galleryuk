import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Galleries — Admin',
  robots: { index: false, follow: false },
};

export default function AdminGalleriesPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-serif text-3xl font-bold">Galleries</h1>
        <p className="text-text-muted">List + CRUD lands in Phase C-8.</p>
      </header>
      <div className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-sm text-text-muted">
        <p className="font-medium text-text">Coming next milestone</p>
        <p className="mt-1">
          The galleries CRUD UI will live here. For now, manage gallery rows
          via Supabase Table Editor.
        </p>
      </div>
    </div>
  );
}
