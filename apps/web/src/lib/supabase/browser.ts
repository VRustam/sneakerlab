'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from '@/lib/env';
import type { Database } from '@/lib/supabase/database.types';

let browserClient: SupabaseClient<Database> | null | undefined;

/** Lazily creates the client so builds do not require local Supabase variables. */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (browserClient !== undefined) return browserClient;

  const config = getSupabasePublicConfig();
  browserClient = config ? createBrowserClient<Database>(config.url, config.anonKey) : null;
  return browserClient;
}
