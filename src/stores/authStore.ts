import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export type UserRole = 'Admin' | 'Editor' | 'Mangaka' | 'Assistant' | 'Board';

export interface User {
  id: string | number;
  userName?: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  penName?: string;
  portfolioUrl?: string;
  skills?: string;
  phoneNumber?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  rememberMe: boolean;
}

interface AuthActions {
  setAuth: (user: User, token: string, refreshToken: string, rememberMe?: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getRoleRedirectPath: () => string;
  updateUser: (data: Partial<User>) => void;
}

type AuthStore = AuthState & AuthActions;

const customStorage: StateStorage = {
  getItem: (name: string) => {
    return localStorage.getItem(name) || sessionStorage.getItem(name) || null;
  },
  setItem: (name: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (parsed?.state?.rememberMe) {
        localStorage.setItem(name, value);
        sessionStorage.removeItem(name);
      } else {
        sessionStorage.setItem(name, value);
        localStorage.removeItem(name);
      }
    } catch {
      sessionStorage.setItem(name, value);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      rememberMe: false,
      setAuth: (user, token, refreshToken, rememberMe = false) => set({ user, token, refreshToken, rememberMe }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, token: null, refreshToken: null, rememberMe: false }),
      updateUser: (data) => set((state) => ({ 
        user: state.user ? { ...state.user, ...data } : null 
      })),
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
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken, rememberMe: state.rememberMe }),
    }
  )
);
