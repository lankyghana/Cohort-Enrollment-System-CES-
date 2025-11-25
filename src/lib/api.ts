import { env } from '@/config/env';
import axios from 'axios'

const API_URL = env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to handle CSRF token and auth
api.interceptors.request.use(
  async (config) => {
    // Check if this is a state-changing request (POST, PUT, PATCH, DELETE)
    const isStateChanging = ['post', 'put', 'patch', 'delete'].includes(
      config.method?.toLowerCase() || ''
    );

    // Skip CSRF only for the csrf-cookie endpoint itself
    const skipCsrf = config.url?.includes('/sanctum/csrf-cookie');

    // Get CSRF cookie before state-changing requests
    if (isStateChanging && !skipCsrf) {
      // Check if we already have a CSRF token cookie
      const hasToken = document.cookie.includes('XSRF-TOKEN');
      
      if (!hasToken) {
        const baseURL = API_URL.replace('/api', '');
        await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });
      }
    }

    // Add auth token from localStorage
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling and CSRF retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get 419 (CSRF token mismatch/expired)
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get fresh CSRF cookie
        const baseURL = API_URL.replace('/api', '');
        await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });

        // Retry the original request
        return api(originalRequest);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    // If we get 401 (Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api

