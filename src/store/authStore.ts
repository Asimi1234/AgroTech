import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, usesServerAuth } from '@/services/api';
import type { AuthenticatedUser } from '@/services/api';
import { clearActive, idleLimitForRole, isIdleExpired, markActive } from '@/services/session';

interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  /** False until the initial session check completes (server-auth mode only). */
  hydrated: boolean;
  setUser: (user: AuthenticatedUser) => void;
  logout: () => void;
  /** Restore the server session on app load; no-op for mock/HTTP backends. */
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      // Mock/HTTP: the persisted store IS the session, so it's ready immediately.
      hydrated: !usesServerAuth,
      setUser: (user) => {
        markActive(idleLimitForRole(user.role));
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        void api.logout();
        clearActive();
        set({ user: null, isAuthenticated: false });
      },
      bootstrap: async () => {
        if (!usesServerAuth) return;
        try {
          // Idle too long since last activity — drop the stale session so the
          // user re-authenticates instead of resuming straight into the app.
          if (isIdleExpired()) {
            await api.logout();
            clearActive();
            set({ user: null, isAuthenticated: false });
            return;
          }
          const user = await api.restoreSession();
          if (user) {
            markActive(idleLimitForRole(user.role));
            set({ user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          // Never let a bootstrap failure wedge the app on the loader.
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ hydrated: true });
        }
      },
    }),
    {
      name: 'agrotech-auth',
      // In server-auth mode the Supabase session is authoritative; don't trust
      // persisted auth flags across reloads (bootstrap re-derives them).
      partialize: (state) =>
        usesServerAuth
          ? {}
          : { user: state.user, isAuthenticated: state.isAuthenticated },
    },
  ),
);
