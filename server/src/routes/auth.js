import express from 'express'
const router = express.Router()

const demoUsers = {
  admin: { id: 'usr-1', email: 'admin@RailLink.in', name: 'Rajesh Kumar', role: 'admin', department: 'Operations' },
  planner: { id: 'usr-2', email: 'planner@RailLink.in', name: 'Priya Sharma', role: 'planner', department: 'Planning' },
  engg: { id: 'usr-3', email: 'engg@RailLink.in', name: 'Vikram Singh', role: 'dept_head', department: 'Engineering' },
  snt: { id: 'usr-4', email: 'snt@RailLink.in', name: 'Anita Verma', role: 'dept_head', department: 'Signal & Telecom' },
  trd: { id: 'usr-5', email: 'trd@RailLink.in', name: 'Suresh Patel', role: 'dept_head', department: 'Traction Distribution' }
}

router.post('/login', (req, res) => {
  const { email, role } = req.body
  const selectedRole = role || 'admin'
  const user = demoUsers[selectedRole] || { id: 'usr-guest', email: email || 'guest@RailLink.in', name: 'Guest User', role: 'viewer', department: 'Operations' }
  res.json({ token: 'mock-jwt-token-RailLink-2025', user })
})

router.get('/me', (req, res) => {
  res.json({ user: demoUsers.admin })
})

router.get('/users', (req, res) => {
  res.json({ users: Object.values(demoUsers).map(u => ({ ...u, status: 'Active' })) })
})

export default router
