import { create } from 'zustand'
import { api } from '@/lib/api'
import type { User as AppUser } from '@/types'

interface AuthState {
  user: AppUser | null
  loading: boolean
  initialized: boolean
  token: string | null
  setUser: (user: AppUser | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  getUserRole: () => string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string, role?: string) => Promise<void>
  signOut: () => Promise<void>
}


export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
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
        set({ user: response.data, loading: false, initialized: true })
      } else {
        set({ user: null, loading: false, initialized: true })
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      localStorage.removeItem('auth_token')
      set({ user: null, token: null, loading: false, initialized: true })
    }
  },

  signIn: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password })
    const { user, token } = response.data
    
    get().setToken(token)
    set({ user })
  },

  signUp: async (name: string, email: string, password: string, role = 'student') => {
    const response = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation: password,
      role,
    })
    const { user, token } = response.data
    
    get().setToken(token)
    set({ user })
  },

  signOut: async () => {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      get().setToken(null)
      set({ user: null })
    }
  },
}))



