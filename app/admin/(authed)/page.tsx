import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Building2, Image as ImageIcon } from 'lucide-react';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const metadata: Metadata = {
  title: 'Admin dashboard',
  robots: { index: false, follow: false },
};

async function getCounts() {
  const admin = getSupabaseAdmin();
  const [galleries, exhibitions] = await Promise.all([
    admin.from('galleries').select('*', { count: 'exact', head: true }),
    admin.from('exhibitions').select('*', { count: 'exact', head: true }),
  ]);
  return {
    galleries: galleries.count ?? 0,
    exhibitions: exhibitions.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const counts = await getCounts();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
        <p className="text-text-muted">
          Manage galleries and exhibitions. Changes go live within a few
          minutes via revalidation.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/admin/galleries"
          className="group flex items-center justify-between rounded-lg border border-border bg-surface p-6 transition-colors hover:bg-surface-muted"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-muted text-text">
              <Building2 className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-bold">{counts.galleries}</p>
              <p className="text-sm text-text-muted">Galleries</p>
            </div>
          </div>
          <ArrowRight
            aria-hidden
            className="h-5 w-5 text-text-muted transition-transform group-hover:translate-x-0.5"
          />
        </Link>

        <Link
          href="/admin/exhibitions"
          className="group flex items-center justify-between rounded-lg border border-border bg-surface p-6 transition-colors hover:bg-surface-muted"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-muted text-text">
              <ImageIcon className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-bold">{counts.exhibitions}</p>
              <p className="text-sm text-text-muted">Exhibitions</p>
            </div>
          </div>
          <ArrowRight
            aria-hidden
            className="h-5 w-5 text-text-muted transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </section>

      <section className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-sm text-text-muted">
        <p className="font-medium text-text">Coming next</p>
        <p className="mt-1">
          CRUD forms for galleries and exhibitions land in the next milestone
          (Phase C-8/C-9). For now, this dashboard confirms admin auth + read
          access through the service-role client.
        </p>
      </section>
    </div>
  );
}
