import { create } from 'zustand';
import type { ShortURL, Analytics } from '@/types/api';
import { urlsApi } from '@/api/urls';
import { getErrorMessage } from '@/lib/error';

interface UrlState {
  urls: ShortURL[];
  loading: boolean;
  error: string | null;
  analytics: Analytics | null;

  fetchUrls: () => Promise<void>;
  createUrl: (data: Partial<ShortURL>) => Promise<void>;
  updateUrl: (id: string, data: Partial<ShortURL>) => Promise<void>;
  deleteUrl: (id: string) => Promise<void>;
  fetchAnalytics: (id: string) => Promise<void>;
}

export const useUrlStore = create<UrlState>((set) => ({
  urls: [],
  loading: false,
  error: null,
  analytics: null,

  fetchUrls: async () => {
    set({ loading: true, error: null });
    try {
      const urls = await urlsApi.list();
      set({ urls, loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, 'Failed to fetch URLs') });
    }
  },

  createUrl: async (data) => {
    set({ loading: true, error: null });
    try {
      const newUrl = await urlsApi.create(data);
      set((state) => ({ urls: [newUrl, ...state.urls], loading: false }));
    } catch (error) {
        set({ loading: false, error: getErrorMessage(error, 'Failed to create URL') });
        throw error;
    }
  },

  updateUrl: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedUrl = await urlsApi.update(id, data);
      set((state) => ({
        urls: state.urls.map((u) => (u.id === id ? updatedUrl : u)),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, 'Failed to update URL') });
      throw error;
    }
  },

  deleteUrl: async (id) => {
    set({ loading: true, error: null });
    try {
      await urlsApi.delete(id);
      set((state) => ({
        urls: state.urls.filter((u) => u.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, 'Failed to delete URL') });
      throw error;
    }
  },

  fetchAnalytics: async (id) => {
    set({ loading: true, error: null, analytics: null });
    try {
      const analytics = await urlsApi.getAnalytics(id);
      set({ analytics, loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, 'Failed to fetch analytics') });
    }
  },
}));
