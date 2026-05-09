import type { Metadata } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ScrapeRunner } from './ScrapeRunner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Scrape — Admin',
  robots: { index: false, follow: false },
};

async function getGalleries() {
  const { data, error } = await getSupabaseAdmin()
    .from('galleries')
    .select('id, name, whats_on_url')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((g) => ({
    id: g.id as string,
    name: g.name as string,
    whatsOnUrl: (g.whats_on_url as string | null) ?? null,
  }));
}

async function getRecentLog() {
  const { data, error } = await getSupabaseAdmin()
    .from('scrape_log')
    .select(
      'id, run_at, gallery_id, status, exhibitions_found, exhibitions_inserted, exhibitions_updated, exhibitions_skipped, error_message, duration_ms, prompt_tokens, completion_tokens',
    )
    .order('run_at', { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return data ?? [];
}

const statusBadge: Record<string, string> = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  skipped: 'bg-amber-100 text-amber-800',
};

export default async function AdminScrapePage() {
  const [galleries, log] = await Promise.all([getGalleries(), getRecentLog()]);

  const withUrl = galleries.filter((g) => g.whatsOnUrl).length;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-bold">Scrape</h1>
        <p className="text-sm text-text-muted">
          Run the LLM-powered scraper against one gallery. {withUrl} of{' '}
          {galleries.length} galleries have a{' '}
          <span className="font-mono">whats_on_url</span> set.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-surface p-6">
        <ScrapeRunner galleries={galleries} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Recent runs
        </h2>
        {log.length === 0 ? (
          <p className="text-sm text-text-muted">No runs yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">When</th>
                  <th className="px-3 py-2 text-left">Gallery</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Found</th>
                  <th className="px-3 py-2 text-right">+/~/skip</th>
                  <th className="px-3 py-2 text-right">ms</th>
                  <th className="px-3 py-2 text-right">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {log.map((row) => (
                  <tr
                    key={row.id as string}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-3 py-2 text-xs text-text-muted">
                      {new Date(row.run_at as string).toLocaleString('en-GB', {
                        timeZone: 'Europe/London',
                      })}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {(row.gallery_id as string) ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusBadge[row.status as string] ??
                          'bg-surface-muted text-text-muted'
                        }`}
                      >
                        {row.status as string}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {(row.exhibitions_found as number) ?? 0}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-xs text-text-muted">
                      {(row.exhibitions_inserted as number) ?? 0}/
                      {(row.exhibitions_updated as number) ?? 0}/
                      {(row.exhibitions_skipped as number) ?? 0}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-xs text-text-muted">
                      {(row.duration_ms as number) ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-xs text-text-muted">
                      {row.prompt_tokens && row.completion_tokens
                        ? `${(row.prompt_tokens as number).toLocaleString()} → ${(row.completion_tokens as number).toLocaleString()}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
