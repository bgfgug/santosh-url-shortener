
import apiClient from '../../shared/apiClient';
import { LinkClickLog } from './types';

export const analyticsApi = {
  getGlobalLogs: async (): Promise<LinkClickLog[]> => {
    const response = await apiClient.get('/analytics/logs/');
    return response.data;
  },
  getLinkLogs: async (linkId: number): Promise<LinkClickLog[]> => {
    const response = await apiClient.get(`/analytics/logs/${linkId}/`);
    return response.data;
  },
};
