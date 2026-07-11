const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return value.trim().toLowerCase() === 'true';
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  useMockApi: parseBoolean(import.meta.env.VITE_USE_MOCK_API, true),
  mockLatencyMs: parseNumber(import.meta.env.VITE_MOCK_LATENCY_MS, 600),
} as const;
