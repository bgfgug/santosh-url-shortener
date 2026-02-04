
import apiClient from '../../shared/apiClient';

export const profilesApi = {
  getProfile: async () => {
    const response = await apiClient.get('/profiles/');
    return response.data;
  },
  updateProfile: async (formData: FormData) => {
    const response = await apiClient.patch('/profiles/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  changePassword: async (data: any) => {
    return apiClient.post('/profiles/change-password/', data);
  },
};
