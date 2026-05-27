import { create } from 'zustand';
import { loginUser, registerUser, googleLogin, logoutUser, type LoginCredentials, type RegisterData } from '../../features/auth/api';
import type { AxiosError } from 'axios';

interface AuthUser {
  userId: number;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; role?: string; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; role?: string; error?: string }>;
  loginWithGoogle: (idToken: string, role?: string) => Promise<{ success: boolean; role?: string; needsRole?: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (userId && userRole) {
      return { userId: Number(userId), role: userRole };
    }
    return null;
  })(),
  isAuthenticated: !!localStorage.getItem('userId'),

  login: async (credentials: LoginCredentials) => {
    try {
      const data = await loginUser(credentials);
      const userData: AuthUser = { userId: data.userId, role: data.role.toLowerCase() };
      localStorage.setItem('userId', String(data.userId));
      localStorage.setItem('userRole', data.role.toLowerCase());
      set({ user: userData, isAuthenticated: true });
      return { success: true, role: data.role.toLowerCase() };
    } catch (err) {
      const error = err as AxiosError<string>;
      const message = typeof error.response?.data === 'string'
        ? error.response.data
        : 'Invalid email or password';
      return { success: false, error: message };
    }
  },

  register: async (data: RegisterData) => {
    try {
      const res = await registerUser(data);
      const userData: AuthUser = { userId: res.userId, role: res.role.toLowerCase() };
      localStorage.setItem('userId', String(res.userId));
      localStorage.setItem('userRole', res.role.toLowerCase());
      set({ user: userData, isAuthenticated: true });
      return { success: true, role: res.role.toLowerCase() };
    } catch (err) {
      const error = err as AxiosError<string>;
      const message = typeof error.response?.data === 'string'
        ? error.response.data
        : 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  },

  loginWithGoogle: async (idToken: string, role?: string) => {
    try {
      const res = await googleLogin(idToken, role);

      if (res.needsRole) {
        return { success: false, needsRole: true };
      }

      if (res.userId && res.role) {
        const userData: AuthUser = { userId: res.userId, role: res.role.toLowerCase() };
        localStorage.setItem('userId', String(res.userId));
        localStorage.setItem('userRole', res.role.toLowerCase());
        set({ user: userData, isAuthenticated: true });
        return { success: true, role: res.role.toLowerCase() };
      }

      return { success: false, error: 'Unexpected response from server' };
    } catch (err) {
      const error = err as AxiosError<string>;
      const message = typeof error.response?.data === 'string'
        ? error.response.data
        : 'Google sign-in failed. Please try again.';
      return { success: false, error: message };
    }
  },

  logout: async () => {
    await logoutUser();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updates };
      return { user: updated };
    });
  },
}));

export default useAuthStore;
