import { create } from 'zustand'
import { api } from '@/lib/api'
import type { User as AppUser } from '@/types'
import axios from 'axios'

interface AuthState {
  user: AppUser | null
  appUser: AppUser | null
  loading: boolean
  initialized: boolean
  token: string | null
  setUser: (user: AppUser | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  getUserRole: () => string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, phone: string, password: string, role?: string) => Promise<void>
  signOut: () => Promise<void>
}

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as unknown

    if (data && typeof data === 'object') {
      const maybeErrors = (data as { errors?: unknown }).errors
      if (maybeErrors && typeof maybeErrors === 'object') {
        const errorsObj = maybeErrors as Record<string, unknown>
        const firstKey = Object.keys(errorsObj)[0]
        const firstVal = firstKey ? errorsObj[firstKey] : undefined

        if (Array.isArray(firstVal) && typeof firstVal[0] === 'string') {
          return firstVal[0]
        }
        if (typeof firstVal === 'string') {
          return firstVal
        }
      }

      const maybeMessage = (data as { message?: unknown }).message
      if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
        return maybeMessage
      }
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message
    }
  }

  if (error instanceof Error && typeof error.message === 'string' && error.message.trim()) {
    return error.message
  }

  return 'An unexpected error occurred'
}


export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  appUser: null,
  token: localStorage.getItem('auth_token'),
  loading: true,
  initialized: false,

  setUser: (user) => set({ user, appUser: user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
    set({ token })
  },
  setLoading: (loading) => set({ loading }),

  getUserRole: (): string | null => {
    return get().user?.role || null
  },

  initialize: async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (token) {
        // Fetch current user
        const response = await api.get('/user')
        set({ user: response.data, appUser: response.data, loading: false, initialized: true })
      } else {
        set({ user: null, appUser: null, loading: false, initialized: true })
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      localStorage.removeItem('auth_token')
      set({ user: null, appUser: null, token: null, loading: false, initialized: true })
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const response = await api.post('/login', { email, password })
      const { user, token } = response.data

      get().setToken(token)
      set({ user, appUser: user })
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  signUp: async (name: string, email: string, phone: string, password: string, role = 'student') => {
    try {
      const response = await api.post('/register', {
        name,
        email,
        phone,
        password,
        password_confirmation: password,
        role,
      })
      const { user, token } = response.data

      get().setToken(token)
      set({ user, appUser: user })
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  signOut: async () => {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      get().setToken(null)
      set({ user: null, appUser: null })
    }
  },
}))



