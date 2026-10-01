import express from 'express'
import { supabase } from '../lib/supabase.js'
const router = express.Router()

const ADMIN_EMAILS = ['ankitdey061@gmail.com', 'dasouvik122005@gmail.com'];

router.post('/login', (req, res) => {
  const { email } = req.body
  const user = { id: `usr-${Date.now()}`, email: email || 'guest@RailLink.in', name: email?.split('@')[0] || 'Guest User', department: 'Operations' }
  user.role = ADMIN_EMAILS.includes(user.email?.toLowerCase()) ? 'admin' : 'employee'
  res.json({ token: 'mock-jwt-token-RailLink-2025', user })
})

router.post('/register', async (req, res) => {
  try {
    const { email, password, metadata } = req.body
    
    if (!supabase || !supabase.auth?.admin) {
      return res.status(503).json({ error: 'Supabase admin client not initialized (missing SUPABASE_SERVICE_ROLE_KEY)' })
    }

    // Create user via admin API to bypass rate limits and email confirmation
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata || {}
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ user: data.user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', (req, res) => {
  res.json({ user: null })
})

router.get('/users', async (req, res) => {
  try {
    if (supabase && supabase.auth?.admin) {
      const { data, error } = await supabase.auth.admin.listUsers()
      if (!error && Array.isArray(data?.users)) {
        const users = data.users.map(u => {
          const email = u.email || ''
          const name = u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0]
          const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase()) || u.user_metadata?.role === 'admin'
          return {
            id: u.id,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email: email,
            role: isAdmin ? 'admin' : (u.user_metadata?.role || 'employee'),
            department: u.user_metadata?.department || (isAdmin ? 'Operations' : 'Engineering'),
            status: u.banned_until ? 'Suspended' : 'Active',
            lastLogin: u.last_sign_in_at ? u.last_sign_in_at.split('T')[0] : (u.created_at ? u.created_at.split('T')[0] : '2026-10-01')
          }
        })
        return res.json({ users, count: users.length, source: 'Supabase Auth' })
      }
    }
  } catch (err) {
    console.warn('[Auth Users Error]:', err.message)
  }
  res.json({ users: [], count: 0, source: 'RailLink Gateway' })
})

export default router
