export const API_BASE_URL = '/api';

export const AUTH_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    LOGOUT: '/api/auth/logout/',
    REFRESH: '/api/auth/token/refresh/',
  },
  URLS: {
    LIST_CREATE: '/api/urls/',
    DETAIL: (id: string) => `/api/urls/${id}/`,
    ANALYTICS: (id: string) => `/api/urls/${id}/analytics/`,
    QR_CODE: (id: string) => `/api/urls/${id}/qr/`,
    REDIRECT: (key: string) => `/${key}/`,
  },
};
