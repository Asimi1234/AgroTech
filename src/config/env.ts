const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return value.trim().toLowerCase() === 'true';
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * The Supabase client needs the bare project URL (`https://xxx.supabase.co`),
 * not the REST endpoint. Accept either `VITE_SUPABASE_URL` or an existing
 * `VITE_API_BASE_URL` pointed at `.../rest/v1/` and normalize to the project URL.
 */
const toProjectUrl = (value: string | undefined): string =>
  (value ?? '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  useMockApi: parseBoolean(import.meta.env.VITE_USE_MOCK_API, true),
  mockLatencyMs: parseNumber(import.meta.env.VITE_MOCK_LATENCY_MS, 600),
  supabaseUrl: toProjectUrl(
    import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.VITE_API_BASE_URL,
  ),
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
} as const;
