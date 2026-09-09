import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ session, user: session?.user || null, loading: false })

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user || null })
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
      set({ user: data.user, session: data.session, loading: false })
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
      set({ user: data.user, session: data.session, loading: false })
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

  // Demo login (with live Supabase Auth session & fallback)
  demoLogin: async (role = 'admin') => {
    const demoUsers = {
      admin: { id: 'c3e8dcef-1fed-42f8-ad8d-c795cc4952a6', email: 'admin@raillink.in', name: 'Rajesh Kumar', role: 'admin', department: 'Operations', designation: 'Chief Operations Manager' },
      planner: { id: 'b703b4f0-4e9c-4ac6-b715-c99377a443a1', email: 'planner@raillink.in', name: 'Priya Sharma', role: 'planner', department: 'Planning', designation: 'Senior Block Planner' },
      engg: { id: 'a636818b-5b51-41c1-ad70-7770eb302531', email: 'engg@raillink.in', name: 'Vikram Singh', role: 'dept_head', department: 'Engineering', designation: 'Divisional Engineer (Track)' },
      snt: { id: 'ecd6b7bb-34ec-4f91-9c3e-e1804c474283', email: 'snt@raillink.in', name: 'Anita Verma', role: 'dept_head', department: 'Signal & Telecom', designation: 'Senior Divisional Signal Engineer' },
      trd: { id: '7d965d33-5859-44f6-873c-53efee0d0e46', email: 'trd@raillink.in', name: 'Suresh Patel', role: 'dept_head', department: 'Traction Distribution', designation: 'Senior Electrical Engineer (TRD)' },
    }
    const user = demoUsers[role] || demoUsers.admin
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: 'RailLink@2025'
      })
      if (!error && data?.session) {
        set({ user: { ...user, ...data.user?.user_metadata }, session: data.session, loading: false })
        localStorage.setItem('RailLink_demo_user', JSON.stringify(user))
        return user
      }
    } catch (e) {
      console.warn('Supabase auth sign-in fallback to local demo session:', e.message)
    }

    set({ user, session: { demo: true }, loading: false })
    localStorage.setItem('RailLink_demo_user', JSON.stringify(user))
    return user
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

