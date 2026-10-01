import express from 'express'
const router = express.Router()

const ADMIN_EMAILS = ['ankitdey061@gmail.com', 'dasouvik122005@gmail.com'];

router.post('/login', (req, res) => {
  const { email } = req.body
  const user = { id: `usr-${Date.now()}`, email: email || 'guest@RailLink.in', name: email?.split('@')[0] || 'Guest User', department: 'Operations' }
  user.role = ADMIN_EMAILS.includes(user.email?.toLowerCase()) ? 'admin' : 'employee'
  res.json({ token: 'mock-jwt-token-RailLink-2025', user })
})

router.get('/me', (req, res) => {
  res.json({ user: null })
})

router.get('/users', (req, res) => {
  res.json({ users: [] })
})

export default router
