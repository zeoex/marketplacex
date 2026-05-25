import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import Cookies from 'js-cookie';

export interface AuthUser {
  id: string;
  email?: string;
  username: string;
  name: string;
  avatarUrl?: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  hasHydrated: boolean;

  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        hasHydrated: false,

        setAuth: (user, accessToken, refreshToken) => {
          Cookies.set('access_token', accessToken, { expires: 1 / 96, secure: true, sameSite: 'Strict' });
          Cookies.set('refresh_token', refreshToken, { expires: 7, secure: true, sameSite: 'Strict' });
          set({ user, accessToken, refreshToken });
        },

        setUser: (user) => set({ user }),

        logout: () => {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          set({ user: null, accessToken: null, refreshToken: null });
        },

        setLoading: (v) => set({ isLoading: v }),
        setHasHydrated: (v) => set({ hasHydrated: v }),
      }),
      {
        name: 'mpx-auth',
        partialize: (state) => ({ user: state.user, refreshToken: state.refreshToken }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      },
    ),
  ),
);
