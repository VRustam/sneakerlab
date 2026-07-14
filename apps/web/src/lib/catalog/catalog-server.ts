import type { User } from '@supabase/supabase-js';
import { SupabaseCatalogRepository } from '@/lib/catalog/catalog-repository';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export interface CatalogSession {
  repository: SupabaseCatalogRepository | null;
  user: User | null;
}

export async function getCatalogSession(): Promise<CatalogSession> {
  const client = await getSupabaseServerClient();
  if (!client) return { repository: null, user: null };

  const { data, error } = await client.auth.getUser();
  return { repository: new SupabaseCatalogRepository(client), user: error ? null : data.user };
}
