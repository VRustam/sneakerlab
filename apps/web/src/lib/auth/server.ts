import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { AuthIdentity } from '@/lib/auth/types';

/**
 * Resolves an identity on the server. Phase 2 replaces the defensive profile
 * fallback with generated database types and RLS-backed profile access.
 */
export async function getServerAuthIdentity(): Promise<AuthIdentity> {
  const client = await getSupabaseServerClient();
  if (!client) return { kind: 'anonymous' };

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return { kind: 'anonymous' };

  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  return {
    kind: 'authenticated',
    role: profile?.role === 'admin' ? 'admin' : 'customer',
  };
}
