'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { SITE_URL } from '@/lib/constants';

const SendLinkSchema = z.object({
  email: z.string().trim().email().max(120),
});

export type SendLinkState = {
  status: 'idle' | 'error';
  message?: string;
};

export async function sendMagicLink(
  _prev: SendLinkState,
  formData: FormData,
): Promise<SendLinkState> {
  const parsed = SendLinkSchema.safeParse({
    email: formData.get('email'),
  });
  if (!parsed.success) {
    return { status: 'error', message: 'Enter a valid email address.' };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    return {
      status: 'error',
      message: 'Server is missing ADMIN_EMAIL. Contact the site owner.',
    };
  }

  // Don't reveal whether the email is the admin or not — but only actually
  // send the magic link if it is. Anyone can request, but only the admin
  // gets a usable link.
  if (parsed.data.email.toLowerCase() === adminEmail) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${SITE_URL}/admin/auth/callback`,
      },
    });
    if (error) {
      return {
        status: 'error',
        message: `Could not send the link: ${error.message}`,
      };
    }
  }

  redirect('/admin/login?sent=1');
}
