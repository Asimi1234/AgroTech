import type { UserRole } from '@/types';

/**
 * Client-side inactivity timeout. Complements the server-enforced session
 * inactivity limit in Supabase Auth (Dashboard → Authentication → Sessions);
 * keep both in sync with the values below. This layer gives immediate UX — a
 * user returning after the window is logged out and lands on the landing page
 * instead of resuming straight into the dashboard — and works on any plan.
 *
 * We track a "last active" timestamp in localStorage (survives browser restarts)
 * rather than trusting the Supabase token's long-lived auto-refresh. The idle
 * window that applied is stored alongside it, so a cold start can enforce the
 * right (role-specific) limit before the session — and thus the role — is known.
 */

/** Idle window before a persisted session expires: tighter for admins. */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // regular users: 30 minutes
export const ADMIN_IDLE_TIMEOUT_MS = 15 * 60 * 1000; // admins: 15 minutes

export const idleLimitForRole = (role: UserRole | undefined): number =>
  role === 'admin' ? ADMIN_IDLE_TIMEOUT_MS : IDLE_TIMEOUT_MS;

const LAST_ACTIVE_KEY = 'agrotech-last-active';

/** Record activity now, tagged with the idle limit in force for this session. */
export const markActive = (limitMs: number): void => {
  try {
    localStorage.setItem(
      LAST_ACTIVE_KEY,
      JSON.stringify({ t: Date.now(), l: limitMs }),
    );
  } catch {
    // Storage unavailable (private mode / quota) — degrade to no timeout.
  }
};

/** Forget the activity marker so the next login starts a fresh window. */
export const clearActive = (): void => {
  try {
    localStorage.removeItem(LAST_ACTIVE_KEY);
  } catch {
    // ignore
  }
};

/**
 * True when a previous session exists but has been idle past its window. Absent
 * or unparseable marker → not expired (nothing to expire, e.g. a fresh session).
 */
export const isIdleExpired = (): boolean => {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(LAST_ACTIVE_KEY);
  } catch {
    return false;
  }
  if (!raw) return false;
  try {
    const { t, l } = JSON.parse(raw) as { t?: number; l?: number };
    if (typeof t !== 'number' || !Number.isFinite(t)) return false;
    const limit =
      typeof l === 'number' && Number.isFinite(l) ? l : IDLE_TIMEOUT_MS;
    return Date.now() - t > limit;
  } catch {
    return false;
  }
};
