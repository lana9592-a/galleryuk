import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// Supabase magic links land here with a `code` query string. We exchange
// the code for a session, which sets the auth cookies on the response,
// then redirect to /admin (or to the `next` param if provided).
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/admin';

  if (!code) {
    return NextResponse.redirect(new URL('/admin/login', url.origin));
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const fail = new URL('/admin/login', url.origin);
    fail.searchParams.set('error', 'callback');
    return NextResponse.redirect(fail);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
