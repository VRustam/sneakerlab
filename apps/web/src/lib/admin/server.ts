import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { getRouteDecision } from '@/lib/auth/authorization';
import { getServerAuthIdentity } from '@/lib/auth/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export interface AdminContext {
  client: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>;
  user: User;
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const client = await getSupabaseServerClient();
  if (!client) return null;

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return null;

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileError || profile?.role !== 'admin') return null;

  return { client, user: userData.user };
}

export async function requireAdminPage(): Promise<AdminContext> {
  const context = await getAdminContext();
  if (context) return context;
  const decision = getRouteDecision('admin', await getServerAuthIdentity());
  redirect(decision.allowed ? '/admin' : decision.redirectTo);
}
