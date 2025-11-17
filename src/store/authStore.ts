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
  getUserRole: () => string | null
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  appUser: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setAppUser: (appUser) => set({ appUser }),
  setLoading: (loading) => set({ loading }),

  getUserRole: (): string | null => {
    const state = get()
    // prefer the profile role, fall back to auth metadata
    return (state.appUser && state.appUser.role) || (state.user && (state.user.user_metadata as any)?.role) || null
  },

  initialize: async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        set({ user: session.user, loading: false })

        // Fetch user profile; if not present, create a lightweight profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          set({ appUser: profile as AppUser })
        } else {
          // Attempt to create a profile row using auth metadata (if any)
          const fullName = (session.user.user_metadata as any)?.full_name || session.user.user_metadata?.full_name || session.user.email || null
          const role = (session.user.user_metadata as any)?.role || 'student'

          try {
            const { error: insertErr } = await (supabase.from('users') as any).insert([
              { id: session.user.id, email: session.user.email, full_name: fullName, role },
            ] as any)

            if (!insertErr) {
              set({ appUser: { id: session.user.id, email: session.user.email, full_name: fullName, role } as unknown as AppUser })
            } else {
              // If insertion fails (e.g., RLS), still set appUser from metadata
              set({ appUser: { id: session.user.id, email: session.user.email, full_name: fullName, role } as unknown as AppUser })
            }
          } catch (e) {
            set({ appUser: { id: session.user.id, email: session.user.email, full_name: fullName, role } as unknown as AppUser })
          }
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
          } else {
            const fullName = (session.user.user_metadata as any)?.full_name || session.user.email || null
            const role = (session.user.user_metadata as any)?.role || 'student'
            // try to insert profile (best-effort). If it fails because of RLS, fall back to metadata
            try {
              const { error: insertErr } = await (supabase.from('users') as any).insert([
                { id: session.user.id, email: session.user.email, full_name: fullName, role },
              ] as any)

              if (!insertErr) {
                set({ appUser: { id: session.user.id, email: session.user.email, full_name: fullName, role } as unknown as AppUser })
              } else {
                set({ appUser: { id: session.user.id, email: session.user.email, full_name: fullName, role } as unknown as AppUser })
              }
            } catch (e) {
              set({ appUser: { id: session.user.id, email: session.user.email, full_name: fullName, role } as unknown as AppUser })
            }
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

