import { useEffect } from 'react';
import { usesServerAuth } from '@/services/api';
import { idleLimitForRole, isIdleExpired, markActive } from '@/services/session';
import { useAuthStore } from '@/store/authStore';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'visibilitychange'] as const;
const CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Keep the "last active" marker fresh on user interaction and log out once the
 * idle window elapses on a tab left open. Cold starts are enforced separately in
 * authStore.bootstrap. No-op outside server-auth mode.
 */
export const useIdleTimeout = (): void => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!usesServerAuth || !isAuthenticated) return;

    const limit = idleLimitForRole(role);
    const touch = () => {
      if (document.visibilityState === 'hidden') return;
      // Enforce expiry before refreshing, so refocusing a long-idle tab logs
      // out rather than resetting the clock.
      if (isIdleExpired()) {
        logout();
        return;
      }
      markActive(limit);
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, touch, { passive: true }));

    const interval = window.setInterval(() => {
      if (isIdleExpired()) logout();
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, touch));
      window.clearInterval(interval);
    };
  }, [isAuthenticated, role, logout]);
};
