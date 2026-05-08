import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function AuthedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = user?.email?.trim().toLowerCase();

  if (!user || !adminEmail || userEmail !== adminEmail) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-serif text-lg font-bold">
            GalleryUK admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/admin/galleries"
              className="text-text-muted hover:text-text"
            >
              Galleries
            </Link>
            <Link
              href="/admin/exhibitions"
              className="text-text-muted hover:text-text"
            >
              Exhibitions
            </Link>
            <span className="hidden text-text-muted md:inline">·</span>
            <span className="hidden text-xs text-text-muted md:inline">
              {user.email}
            </span>
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-text-muted hover:text-text"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
