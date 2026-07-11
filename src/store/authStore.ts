import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthenticatedUser } from '@/services/api';

interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthenticatedUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'agrotech-auth' },
  ),
);
