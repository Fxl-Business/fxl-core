// ============================================================
// Supabase client factory for Cloudflare Worker
// Uses service role key to bypass RLS
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Env } from './types.js';

// Use untyped client — tables are accessed via service role key and
// results are cast to our own types in the tool handlers.
// This avoids complex generic issues with supabase-js v2.99+.
export type DbClient = SupabaseClient;

export function createSupabaseClient(env: Env): DbClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
