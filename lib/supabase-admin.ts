import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Service-role Supabase client. RLS-bypassing.
// NEVER import in any module that ends up in the client bundle.
// Used only in Server Actions / Route Handlers that have already verified
// the caller is the admin (email match in session).

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      'Admin Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
