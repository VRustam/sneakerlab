'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from '@/lib/env';

let browserClient: SupabaseClient | null | undefined;

/** Lazily creates the client so builds do not require local Supabase variables. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const config = getSupabasePublicConfig();
  browserClient = config ? createBrowserClient(config.url, config.anonKey) : null;
  return browserClient;
}
