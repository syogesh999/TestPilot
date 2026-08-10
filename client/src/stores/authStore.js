import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('testpilot_user') || 'null'),
  token: localStorage.getItem('testpilot_token') || null,
  isAuthenticated: !!localStorage.getItem('testpilot_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;

      localStorage.setItem('testpilot_token', token);
      localStorage.setItem('testpilot_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { user, token } = res.data;

      localStorage.setItem('testpilot_token', token);
      localStorage.setItem('testpilot_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message || 'Registration failed', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('testpilot_token');
    localStorage.removeItem('testpilot_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
