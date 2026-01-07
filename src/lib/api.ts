import axios from 'axios'

// API URL configuration:
// - Production builds default to same-origin '/api' to avoid CORS
// - Dev mode defaults to same-origin '/api' (Vite proxies to Laravel)
// - Can override production URL via VITE_API_URL (e.g., for separate API domain)
const API_URL = import.meta.env.VITE_API_URL || '/api'

const getSanctumBaseUrl = (): string => {
  if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
    return API_URL.replace(/\/api\/?$/, '')
  }
  return ''
}

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
        const baseURL = getSanctumBaseUrl();
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

    // If backend indicates onboarding must continue (resume flow)
    const maybeData = error.response?.data as unknown
    if (
      maybeData &&
      typeof maybeData === 'object' &&
      (maybeData as { next_step?: unknown }).next_step === 'select-course'
    ) {
      const intentId = (maybeData as { enrollment_intent_id?: unknown }).enrollment_intent_id
      if (typeof intentId === 'string' && intentId.trim() !== '') {
        localStorage.setItem('enrollment_intent_id', intentId)
      }

      if (!window.location.pathname.startsWith('/select-course')) {
        const next = `${window.location.pathname}${window.location.search}`
        sessionStorage.setItem('enrollment_next', next)
        window.location.href = '/select-course'
        return Promise.reject(error)
      }
    }

    // If we get 419 (CSRF token mismatch/expired)
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get fresh CSRF cookie
        const baseURL = getSanctumBaseUrl();
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

    // If the backend indicates the enrolled course hasn't started yet
    if (error.response?.status === 403) {
      const data = error.response?.data as unknown
      if (
        data &&
        typeof data === 'object' &&
        (data as { code?: unknown }).code === 'COURSE_NOT_STARTED'
      ) {
        const courseId = (data as { course_id?: unknown }).course_id
        if (typeof courseId === 'string' && courseId.trim() !== '') {
          if (!window.location.pathname.startsWith('/course-starts-soon/')) {
            window.location.href = `/course-starts-soon/${courseId}`
          }
        }
      }

      if (data && typeof data === 'object' && (data as { code?: unknown }).code === 'OUTSTANDING_BALANCE') {
        const courseId = (data as { course_id?: unknown }).course_id
        if (typeof courseId === 'string' && courseId.trim() !== '') {
          if (!window.location.pathname.startsWith('/pay-balance/')) {
            const next = `${window.location.pathname}${window.location.search}`
            sessionStorage.setItem('balance_next', next)
            window.location.href = `/pay-balance/${courseId}`
          }
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default api

