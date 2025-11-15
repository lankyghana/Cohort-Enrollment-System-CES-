import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import type { User as AppUser } from '@/types'

interface AuthState {
  user: User | null
  appUser: AppUser | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setAppUser: (appUser: AppUser | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  appUser: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setAppUser: (appUser) => set({ appUser }),
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        set({ user: session.user, loading: false })
        
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          set({ appUser: profile as AppUser })
        }
      } else {
        set({ user: null, appUser: null, loading: false })
      }

  // Listen for auth changes
  // Prefix the first param with `_` because we don't use the event name
  // (we only care about the session payload) and TypeScript flags unused
  // parameters.
  supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          set({ user: session.user })
          
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profile) {
            set({ appUser: profile as AppUser })
          }
        } else {
          set({ user: null, appUser: null })
        }
      })

      set({ initialized: true })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ loading: false, initialized: true })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, appUser: null })
  },
}))

