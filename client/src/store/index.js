import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const ADMIN_EMAILS = ['ankitdey061@gmail.com', 'dasouvik122005@gmail.com'];

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      let user = session?.user || null
      if (user) {
        user = { ...user, role: ADMIN_EMAILS.includes(user.email?.toLowerCase()) ? 'admin' : (user.user_metadata?.role || 'employee') }
      }
      set({ session, user, loading: false })

      supabase.auth.onAuthStateChange((_event, session) => {
        let authUser = session?.user || null
        if (authUser) {
          authUser = { ...authUser, role: ADMIN_EMAILS.includes(authUser.email?.toLowerCase()) ? 'admin' : (authUser.user_metadata?.role || 'employee') }
        }
        set({ session, user: authUser })
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      let user = data.user
      if (user) {
        user = { ...user, role: ADMIN_EMAILS.includes(user.email?.toLowerCase()) ? 'admin' : (user.user_metadata?.role || 'employee') }
      }
      set({ user, session: data.session, loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  register: async (email, password, metadata = {}) => {
    set({ loading: true, error: null })
    try {
      // Primary: Register directly through Supabase Auth (client-side)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      })

      if (signUpError) {
        // If Supabase hits an email rate limit, attempt backend admin creation if backend is reachable
        if (signUpError.message?.toLowerCase().includes('rate limit')) {
          try {
            const backendUrl = import.meta.env.VITE_API_URL || '/api'
            const res = await fetch(`${backendUrl}/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, metadata })
            })
            const contentType = res.headers.get('content-type') || ''
            if (contentType.includes('application/json')) {
              const resData = await res.json()
              if (!res.ok) throw new Error(resData.error || 'Failed to register via backend')
              // Sign in newly created confirmed user
              const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
              if (!signInErr && signInData?.user) {
                let user = { ...signInData.user, role: ADMIN_EMAILS.includes(signInData.user.email?.toLowerCase()) ? 'admin' : (signInData.user.user_metadata?.role || 'employee') }
                set({ user, session: signInData.session, loading: false })
                return signInData
              }
            }
          } catch {}
          throw new Error('Supabase email rate limit exceeded. Please disable "Confirm email" in Supabase Dashboard (Authentication > Providers > Email), or try again shortly.')
        }
        throw signUpError
      }

      // If user was created, attempt to sign in immediately (if auto-confirmed)
      let user = data?.user
      let session = data?.session

      if (!session && user) {
        try {
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (!signInErr && signInData?.session) {
            session = signInData.session
            user = signInData.user
          }
        } catch {}
      }

      if (user) {
        user = { ...user, role: ADMIN_EMAILS.includes(user.email?.toLowerCase()) ? 'admin' : (user.user_metadata?.role || 'employee') }
      }
      set({ user, session: session || null, loading: false })
      return { user, session }
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  logout: async () => {
    // Clear all local storage keys on logout (including legacy railsync_ keys)
    localStorage.removeItem('RailLink_demo_user')
    localStorage.removeItem('RailLink_token')
    // Clear any legacy keys from old naming
    localStorage.removeItem('railsync_demo_user')
    localStorage.removeItem('railsync_token')
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },


}))

const initialTheme = typeof window !== 'undefined'
  ? (localStorage.getItem('raillink_theme') || 'dark')
  : 'dark'

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialTheme)
}

export const useAppStore = create((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: initialTheme,
  currentPage: 'dashboard',
  notifications: [],

  // Theme Toggle (Dark / Light)
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('raillink_theme', nextTheme)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme)
    }
    return { theme: nextTheme }
  }),
  setTheme: (theme) => {
    localStorage.setItem('raillink_theme', theme)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
    set({ theme })
  },

  // Desktop sidebar collapse/expand
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  collapseSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Mobile drawer controls
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

  setCurrentPage: (page) => set({ currentPage: page }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { id: Date.now(), ...notification }],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))

