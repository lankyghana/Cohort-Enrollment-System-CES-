import { create } from 'zustand'
import { api } from '@/lib/api'
import type { User as AppUser } from '@/types'
import axios from 'axios'

export class NextStepError extends Error {
  next_step: string
  enrollment_intent_id?: string

  constructor(message: string, next_step: string, enrollment_intent_id?: string) {
    super(message)
    this.name = 'NextStepError'
    this.next_step = next_step
    this.enrollment_intent_id = enrollment_intent_id
  }
}

export class RoleMismatchError extends Error {
  code = 'ROLE_MISMATCH' as const
  login_as: string
  actual_role?: string

  constructor(message: string, login_as: string, actual_role?: string) {
    super(message)
    this.name = 'RoleMismatchError'
    this.login_as = login_as
    this.actual_role = actual_role
  }
}

interface AuthState {
  user: AppUser | null
  appUser: AppUser | null
  loading: boolean
  initialized: boolean
  token: string | null
  enrollmentIntentId: string | null
  setUser: (user: AppUser | null) => void
  setToken: (token: string | null) => void
  setEnrollmentIntentId: (enrollmentIntentId: string | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  getUserRole: () => string | null
  signIn: (params: { email: string; password: string; login_as: 'student' | 'instructor' | 'admin' }) => Promise<void>
  signUp: (fullName: string, email: string, phone: string, password: string, role?: string) => Promise<{ enrollment_intent_id: string; next_step: string }>
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
  enrollmentIntentId: localStorage.getItem('enrollment_intent_id'),
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
  setEnrollmentIntentId: (enrollmentIntentId) => {
    if (enrollmentIntentId) {
      localStorage.setItem('enrollment_intent_id', enrollmentIntentId)
    } else {
      localStorage.removeItem('enrollment_intent_id')
    }
    set({ enrollmentIntentId })
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

  signIn: async ({ email, password, login_as }) => {
    try {
      const response = await api.post('/login', { email, password, login_as })
      const data = response.data as unknown

      // Pending students can receive an onboarding response (no token).
      if (data && typeof data === 'object') {
        const nextStep = (data as { next_step?: unknown }).next_step
        if (nextStep === 'select-course') {
          const rawIntentId = (data as { enrollment_intent_id?: unknown }).enrollment_intent_id
          const intentId = typeof rawIntentId === 'string' ? rawIntentId : undefined

          if (intentId) {
            get().setEnrollmentIntentId(intentId)
          }

          throw new NextStepError(
            (data as { message?: unknown }).message && typeof (data as { message?: unknown }).message === 'string'
              ? ((data as { message?: unknown }).message as string)
              : 'Continue your enrollment.',
            'select-course',
            intentId
          )
        }
      }

      const { user, token } = data as { user: AppUser; token: string }

      get().setToken(token)
      get().setEnrollmentIntentId(null)
      set({ user, appUser: user })
    } catch (error) {
      if (error instanceof NextStepError) {
        throw error
      }

      if (error instanceof RoleMismatchError) {
        throw error
      }

      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data as unknown

        if (status === 403 && data && typeof data === 'object') {
          const code = (data as { code?: unknown }).code

          if (code === 'ROLE_MISMATCH') {
            const actualRole = (data as { actual_role?: unknown }).actual_role
            const actualRoleStr = typeof actualRole === 'string' ? actualRole : undefined

            const friendlyRole = actualRoleStr ? actualRoleStr : 'a different role'
            const friendlyLoginAs = login_as

            // NOTE: do NOT store any token or redirect on mismatch.
            throw new RoleMismatchError(
              `This email is registered as ${friendlyRole}. Please use the ${friendlyRole} login.`,
              friendlyLoginAs,
              actualRoleStr
            )
          }
        }

        if (status === 403 && data && typeof data === 'object') {
          const nextStep = (data as { next_step?: unknown }).next_step
          if (nextStep === 'select-course') {
            const rawIntentId = (data as { enrollment_intent_id?: unknown }).enrollment_intent_id
            const intentId = typeof rawIntentId === 'string' ? rawIntentId : undefined

            if (intentId) {
              get().setEnrollmentIntentId(intentId)
            }

            throw new NextStepError(getApiErrorMessage(error), 'select-course', intentId)
          }
        }
      }

      throw new Error(getApiErrorMessage(error))
    }
  },

  signUp: async (fullName: string, email: string, phone: string, password: string, role = 'student') => {
    try {
      const response = await api.post('/register', {
        full_name: fullName,
        email,
        phone,
        password,
        role,
      })
      const { enrollment_intent_id, next_step } = response.data as {
        enrollment_intent_id: string
        next_step: string
      }

      // Per spec: do not log user in yet.
      // Students proceed to course selection; admins/instructors proceed to login.
      if (next_step === 'select-course') {
        get().setEnrollmentIntentId(enrollment_intent_id)
      } else {
        get().setEnrollmentIntentId(null)
      }

      return { enrollment_intent_id, next_step }
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
      get().setEnrollmentIntentId(null)
      set({ user: null, appUser: null })
    }
  },
}))



