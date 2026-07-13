import { createClient } from '@supabase/supabase-js';

import { env } from '@/config/env';

/**
 * Shared Supabase client. Reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
 * (see `.env.example`). Placeholder values keep `createClient` from throwing at
 * import time when Supabase is not configured — the mock/HTTP backends are then
 * selected in `api.ts` and this client is never used.
 */
export const supabase = createClient(
  env.supabaseUrl || 'https://placeholder.supabase.co',
  env.supabaseAnonKey || 'public-anon-key',
);

/** True when real Supabase credentials are present. */
export const supabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
