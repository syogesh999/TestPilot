import { create } from 'zustand';
import api from '../services/api';

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  endpoints: [],
  tests: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/projects');
      set({ projects: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createProject: async (name, description, baseUrl) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/projects', { name, description, baseUrl });
      await get().fetchProjects();
      set({ loading: false });
      return res.data.project;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  fetchProjectDetails: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/projects/${projectId}`);
      set({ currentProject: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchEndpoints: async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}/endpoints`);
      set({ endpoints: res.data.endpoints || [] });
    } catch (err) {
      set({ endpoints: [] });
    }
  },

  fetchTests: async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}/tests`);
      set({ tests: res.data.tests || [] });
    } catch (err) {
      set({ tests: [] });
    }
  },
}));
