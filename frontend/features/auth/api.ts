
import apiClient from '../../shared/apiClient';
import { User } from './types';

export const authApi = {
  signup: async (data: any) => {
    return apiClient.post('/auth/signup/', data);
  },
  verifyOtp: async (data: { email: string; otp_code: string }) => {
    return apiClient.post('/auth/verify-otp/', data);
  },
  login: async (data: any) => {
    return apiClient.post('/auth/login/', data);
  },
  logout: async () => {
    return apiClient.post('/auth/logout/');
  },
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },
};
