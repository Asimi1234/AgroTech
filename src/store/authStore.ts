import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, usesServerAuth } from '@/services/api';
import type { AuthenticatedUser } from '@/services/api';

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
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        void api.logout();
        set({ user: null, isAuthenticated: false });
      },
      bootstrap: async () => {
        if (!usesServerAuth) return;
        try {
          const user = await api.restoreSession();
          set(
            user
              ? { user, isAuthenticated: true }
              : { user: null, isAuthenticated: false },
          );
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
