import type { User } from '@supabase/supabase-js';
import { SupabaseCommerceRepository } from '@/lib/commerce/commerce-repository';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function getCommerceSession(): Promise<{
  repository: SupabaseCommerceRepository | null;
  user: User | null;
}> {
  const client = await getSupabaseServerClient();
  if (!client) return { repository: null, user: null };

  const { data, error } = await client.auth.getUser();
  return { repository: new SupabaseCommerceRepository(client), user: error ? null : data.user };
}
