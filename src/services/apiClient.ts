import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Request interceptor to handle CSRF token for state-changing requests
apiClient.interceptors.request.use(
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
        await axios.get(`${config.baseURL}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });
      }
    }

    // Add auth token from localStorage if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 419 errors and authentication
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get 419 (CSRF token mismatch/expired)
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get fresh CSRF cookie
        await axios.get(`${apiClient.defaults.baseURL}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });

        // Retry the original request
        return apiClient(originalRequest);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    // If we get 401 (Unauthorized), redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
