import { create } from 'zustand';
import type { User, LoginResponse } from 'synapse-shared';
import { clearAllPerformanceCache } from '../services/performanceCache';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

async function parseResponseBody(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await parseResponseBody(response);
        throw new Error(errorData?.error || 'Login failed');
      }
      const data = (await parseResponseBody(response)) as LoginResponse | null;
      if (!data?.token || !data?.user) {
        throw new Error('Login failed: invalid server response');
      }
      set({ user: data.user, token: data.token, isLoading: false });
      localStorage.setItem('token', data.token);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) {
        const errorData = await parseResponseBody(response);
        throw new Error(errorData?.error || 'Registration failed');
      }
      const data = (await parseResponseBody(response)) as LoginResponse | null;
      if (!data?.token || !data?.user) {
        throw new Error('Registration failed: invalid server response');
      }
      set({ user: data.user, token: data.token, isLoading: false });
      localStorage.setItem('token', data.token);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
    clearAllPerformanceCache();
  },
}));