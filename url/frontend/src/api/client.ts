import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

export const client = axios.create({
  baseURL: '', // Relative to current origin/proxy
  withCredentials: true,
});

// Response Interceptor: Handle 401 & Logout
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
