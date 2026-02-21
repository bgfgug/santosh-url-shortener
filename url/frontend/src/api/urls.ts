import { client } from './client';
import { ENDPOINTS } from '@/utils/constants';
import type { ShortURL, Analytics, PaginatedResponse } from '@/types/api';

export const urlsApi = {
  list: async () => {
    const response = await client.get<PaginatedResponse<ShortURL> | ShortURL[]>(ENDPOINTS.URLS.LIST_CREATE);
    // Handle both raw array and paginated response
    if (Array.isArray(response.data)) {
        return response.data;
    }
    return response.data.results || [];
  },

  create: async (data: Partial<ShortURL>) => {
    const response = await client.post<ShortURL>(ENDPOINTS.URLS.LIST_CREATE, data);
    return response.data;
  },

  update: async (id: string, data: Partial<ShortURL>) => {
    const response = await client.patch<ShortURL>(ENDPOINTS.URLS.DETAIL(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    await client.delete(ENDPOINTS.URLS.DETAIL(id));
  },

  getAnalytics: async (id: string) => {
    const response = await client.get<Analytics>(ENDPOINTS.URLS.ANALYTICS(id));
    return response.data;
  },

  getQrCode: async (id: string) => {
      // Return blob for image
    const response = await client.get(ENDPOINTS.URLS.QR_CODE(id), { responseType: 'blob' });
    return URL.createObjectURL(response.data);
  },
};
