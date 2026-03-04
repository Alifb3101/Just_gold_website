import { create } from 'zustand';
import { registerUnauthorizedHandler } from '@/services/api';

let unsubscribeUnauthorized = null;

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isReady: false,

  hydrate: () => {
    const token = (() => {
      try {
        return localStorage.getItem('auth_token');
      } catch {
        return null;
      }
    })();

    set({
      token,
      isAuthenticated: Boolean(token),
      isReady: true,
    });

    if (!unsubscribeUnauthorized) {
      unsubscribeUnauthorized = registerUnauthorizedHandler(() => {
        get().clearAuth();
      });
    }
  },

  setAuth: ({ token, user = null }) => {
    set({
      token: token ?? null,
      user,
      isAuthenticated: Boolean(token),
      isReady: true,
    });
  },

  clearAuth: () => {
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
