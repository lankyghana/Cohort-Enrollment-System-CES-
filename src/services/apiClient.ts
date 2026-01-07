import axios from 'axios';

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';

  // Many call sites already include `/api/...` in the request URL.
  // Normalize common misconfigurations like `.../api` to avoid `/api/api/...`.
  if (trimmed === '/api') return '';
  if (trimmed.endsWith('/api')) return trimmed.slice(0, -4);

  return trimmed;
}

const apiBaseUrl = normalizeBaseUrl(
  // Default to same-origin (works in prod and in dev when Vite proxies to Laravel).
  import.meta.env.VITE_API_BASE_URL || ''
);

const apiClient = axios.create({
  // Use same-origin by default. In dev, Vite proxies /api and /sanctum to Laravel.
  baseURL: apiBaseUrl,
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
        const baseUrl = (config.baseURL ?? apiClient.defaults.baseURL ?? '') as string;
        await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
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

    // If backend indicates onboarding must continue (resume flow)
    const maybeData = error.response?.data as unknown;
    if (maybeData && typeof maybeData === 'object' && (maybeData as { next_step?: unknown }).next_step === 'select-course') {
      const intentId = (maybeData as { enrollment_intent_id?: unknown }).enrollment_intent_id;
      if (typeof intentId === 'string' && intentId.trim() !== '') {
        localStorage.setItem('enrollment_intent_id', intentId);
      }

      if (!window.location.pathname.startsWith('/select-course')) {
        const next = `${window.location.pathname}${window.location.search}`;
        sessionStorage.setItem('enrollment_next', next);
        window.location.href = '/select-course';
        return Promise.reject(error);
      }
    }

    // If we get 419 (CSRF token mismatch/expired)
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get fresh CSRF cookie
        const baseUrl = (apiClient.defaults.baseURL ?? '') as string;
        await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
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

    // If the backend indicates the enrolled course hasn't started yet
    if (error.response?.status === 403) {
      const data = error.response?.data as unknown;
      if (data && typeof data === 'object' && (data as { code?: unknown }).code === 'COURSE_NOT_STARTED') {
        const courseId = (data as { course_id?: unknown }).course_id;
        if (typeof courseId === 'string' && courseId.trim() !== '') {
          if (!window.location.pathname.startsWith('/course-starts-soon/')) {
            window.location.href = `/course-starts-soon/${courseId}`;
          }
        }
      }

      if (data && typeof data === 'object' && (data as { code?: unknown }).code === 'OUTSTANDING_BALANCE') {
        const courseId = (data as { course_id?: unknown }).course_id;
        if (typeof courseId === 'string' && courseId.trim() !== '') {
          if (!window.location.pathname.startsWith('/pay-balance/')) {
            const next = `${window.location.pathname}${window.location.search}`;
            sessionStorage.setItem('balance_next', next);
            window.location.href = `/pay-balance/${courseId}`;
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
