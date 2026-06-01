import { create } from 'zustand';

export type UserRole = 'Admin' | 'Editor' | 'Mangaka' | 'Assistant' | 'Board';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
  isAuthenticated: () => !!get().token,
}));
