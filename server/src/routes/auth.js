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

router.get('/users', (req, res) => {
  res.json({ users: [] })
})

export default router
