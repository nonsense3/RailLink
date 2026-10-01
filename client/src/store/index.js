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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      })
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

