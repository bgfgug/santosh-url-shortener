import { client } from './client';
import { ENDPOINTS } from '@/utils/constants';
import type { AuthResponse } from '@/types/api';
import { useAuthStore } from '@/store/auth-store';

export const authApi = {
  login: async (credentials: Record<string, string>) => {
    const response = await client.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
    const { user } = response.data;
    useAuthStore.getState().loginSuccess(user);
    return response.data;
  },

  register: async (data: Record<string, string>) => {
    const response = await client.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, data);
    const { user } = response.data;
    useAuthStore.getState().loginSuccess(user);
    return response.data;
  },

  logout: async () => {
    try {
        await client.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
        console.error('Logout failed on backend:', error);
    }
    useAuthStore.getState().logout();
  },
};
