import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,   // <-- full URL including /api prefix
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF handling for Django
apiClient.interceptors.request.use((config) => {
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };
  
  const csrftoken = getCookie('csrftoken');
  if (csrftoken && config.headers) {
    config.headers['X-CSRFToken'] = csrftoken;
  }
  return config;
});

// Centralized Response Error Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.type === 'system_error') {
      window.dispatchEvent(new CustomEvent('app:system_error', { 
        detail: { message: error.response.data.message } 
      }));
    }

    if (!error.response) {
      window.dispatchEvent(new CustomEvent('app:system_error', { 
        detail: { message: 'Unable to reach the server. Please check your internet connection.' } 
      }));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
