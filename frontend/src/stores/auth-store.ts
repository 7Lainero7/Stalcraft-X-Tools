import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: null | {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  accessToken: string | null;
  setUser: (user: AuthState['user'], token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user, accessToken) => set({ user, accessToken }),
      logout: () => {
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);