
import apiClient from '../../shared/apiClient';
import { ShortLink } from './types';

export interface CreateLinkData {
  original_url: string;
  short_code?: string;
  expires_at?: string;
}

export const linksApi = {
  getLinks: async (): Promise<ShortLink[]> => {
    const response = await apiClient.get('/links/');
    return response.data;
  },
  createLink: async (data: CreateLinkData): Promise<ShortLink> => {
    // API now expects a structured object instead of just a string
    const response = await apiClient.post('/links/', data);
    return response.data;
  },
  updateLink: async (id: number, data: Partial<CreateLinkData>): Promise<ShortLink> => {
    const response = await apiClient.patch(`/links/${id}/`, data);
    return response.data;
  },
  deleteLink: async (id: number): Promise<void> => {
    await apiClient.delete(`/links/${id}/`);
  },
};
