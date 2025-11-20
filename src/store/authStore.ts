import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import type { User as AppUser } from '@/types'
import type { Database } from '@/types/database'

type UserInsert = Database['public']['Tables']['users']['Insert']

const getMetadataString = (metadata: User['user_metadata'] | null | undefined, key: string): string | null => {
  const value = metadata?.[key]
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

const getMetadataRole = (metadata: User['user_metadata'] | null | undefined): AppUser['role'] => {
  const raw = getMetadataString(metadata, 'role')
  return raw === 'admin' || raw === 'instructor' ? raw : 'student'
}

const buildFallbackProfile = (params: { id: string; email: string; full_name: string | null; role: AppUser['role'] }): AppUser => ({
  id: params.id,
  email: params.email,
  full_name: params.full_name,
  avatar_url: null,
  role: params.role,
  phone: null,
  bio: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

const buildProfileInsert = (sessionUser: User) => {
  const metadata = sessionUser.user_metadata
  const fullName = getMetadataString(metadata, 'full_name') || sessionUser.email || null
  const role = getMetadataRole(metadata)
  const payload: UserInsert = {
    id: sessionUser.id,
    email: sessionUser.email ?? '',
    full_name: fullName,
    role,
    avatar_url: null,
    phone: null,
    bio: null,
  }
  const fallback = buildFallbackProfile({ id: sessionUser.id, email: sessionUser.email ?? '', full_name: fullName, role })
  return { payload, fallback }
}

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
    const metadataRole = state.user ? getMetadataRole(state.user.user_metadata) : null
    return state.appUser?.role || metadataRole
  },

  initialize: async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        set({ user: session.user, loading: false })

        // Fetch user profile; if not present, create a lightweight profile
        const { data: profile, error: profileErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileErr) {
          console.error('Error fetching profile during initialize:', profileErr)
        }

        if (profile) {
          set({ appUser: profile as AppUser })
        } else {
          // Attempt to create a profile row using auth metadata (if any)
          const { payload, fallback } = buildProfileInsert(session.user)

          try {
            const { data: inserted, error: insertErr } = await supabase
              .from('users')
              .insert([payload])
              .select('*')
              .single()

            if (insertErr) {
              console.warn('Profile insert failed during initialize, falling back to metadata', insertErr)
              set({ appUser: fallback })
            } else if (inserted) {
              set({ appUser: inserted as AppUser })
            } else {
              set({ appUser: fallback })
            }
          } catch (e) {
            console.error('Unexpected error inserting profile during initialize:', e)
            set({ appUser: fallback })
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

      const { data: profile, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileErr) {
        console.error('Error fetching profile on auth change:', profileErr)
      }

      if (profile) {
        set({ appUser: profile as AppUser })
      } else {
        const { payload, fallback } = buildProfileInsert(session.user)
        // try to insert profile (best-effort). If it fails because of RLS, fall back to metadata
        try {
          const { data: inserted, error: insertErr } = await supabase
            .from('users')
            .insert([payload])
            .select('*')
            .single()

          if (insertErr) {
            console.warn('Profile insert failed during auth change, falling back to metadata', insertErr)
            set({ appUser: fallback })
          } else if (inserted) {
            set({ appUser: inserted as AppUser })
          } else {
            set({ appUser: fallback })
          }
        } catch (e) {
          console.error('Unexpected error inserting profile on auth change:', e)
          set({ appUser: fallback })
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

