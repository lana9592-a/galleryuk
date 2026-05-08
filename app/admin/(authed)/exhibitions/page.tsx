import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exhibitions — Admin',
  robots: { index: false, follow: false },
};

export default function AdminExhibitionsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-serif text-3xl font-bold">Exhibitions</h1>
        <p className="text-text-muted">List + CRUD lands in Phase C-9.</p>
      </header>
      <div className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-sm text-text-muted">
        <p className="font-medium text-text">Coming next milestone</p>
        <p className="mt-1">
          The exhibitions CRUD UI will live here. For now, manage exhibition
          rows via Supabase Table Editor.
        </p>
      </div>
    </div>
  );
}
