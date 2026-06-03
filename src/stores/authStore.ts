import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'Admin' | 'Editor' | 'Mangaka' | 'Assistant' | 'Board';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: User, token: string) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getRoleRedirectPath: () => string;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      setAuth: (user, token) => set({ user, token }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token,
      getRoleRedirectPath: () => {
        const role = get().user?.role;
        switch (role) {
          case 'Admin': return '/admin';
          case 'Editor': return '/editor';
          case 'Mangaka': return '/mangaka';
          case 'Assistant': return '/assistant';
          case 'Board': return '/board';
          default: return '/';
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }), // don't persist isLoading
    }
  )
);
