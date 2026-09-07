import { create } from 'zustand';
import { UserDTO } from '@sports-social/types';
import { fetchApi } from '../lib/api-client';

interface AuthState {
  user: UserDTO | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: UserDTO, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null,
  isLoading: true,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `auth-token=${token}; path=/; max-age=604800; SameSite=Lax`;
    }
    set({ user, token, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      // 1. Expire all auth cookies
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

      // 2. Clear all localStorage items
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 3. Reset Zustand auth state
      set({ user: null, token: null, isLoading: false });

      // 4. Trigger full window redirect to /login to clear router cache
      window.location.href = '/login';
    } else {
      set({ user: null, token: null, isLoading: false });
    }
  },

  checkAuth: async () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
    if (!token) {
      set({ isLoading: false, user: null, token: null });
      return;
    }

    try {
      const user = await fetchApi<UserDTO>('/auth/me');
      set({ user, token, isLoading: false });
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      }
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
