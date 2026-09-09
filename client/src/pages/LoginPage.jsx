import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { motion } from 'framer-motion'
import { Train, Zap, Shield, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [hoveredRole, setHoveredRole] = useState(null)
  const { login, register, demoLogin, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, { name: 'New User' })
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Authentication failed')
    }
  }

  const handleDemoLogin = async (role) => {
    try {
      await demoLogin(role)
      navigate('/dashboard')
    } catch (err) {
      navigate('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg-primary)',
    }}>
      {/* Left: Hero Section */}
      <div style={{
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'var(--space-4xl)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(228, 164, 189, 0.08)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(228, 164, 189, 0.05)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <p className="text-label" style={{ marginBottom: 'var(--space-lg)' }}>
            MINISTRY OF RAILWAYS
          </p>
          <h1 style={{ marginBottom: 'var(--space-xl)' }}>
            RAIL<br />
            <span className="text-italic-accent">LINK</span>
          </h1>
          <p className="text-body-lg" style={{ maxWidth: '480px', marginBottom: 'var(--space-2xl)' }}>
            AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {[
              { icon: Train, text: 'Integrated multi-department block coordination' },
              { icon: Zap, text: 'AI-optimized scheduling with XGBoost & OR-Tools' },
              { icon: Shield, text: 'Proactive conflict detection & safety assurance' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <item.icon size={18} color="var(--accent)" />
                </div>
                <span style={{ fontSize: '0.9375rem' }}>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>


      </div>

      {/* Right: Login Form */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-4xl)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h3>
          <p className="text-body-lg" style={{ marginBottom: 'var(--space-2xl)', fontSize: '1rem' }}>
            {mode === 'login'
              ? 'Sign in to access block planning intelligence.'
              : 'Register for a new RailLink account.'}
          </p>

          {error && (
            <div style={{
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(201, 79, 79, 0.1)',
              color: 'var(--status-overdue)',
              fontSize: '0.875rem',
              marginBottom: 'var(--space-lg)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@railways.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginBottom: 'var(--space-md)' }}
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight size={14} />
            </button>
          </form>

          <div style={{ textAlign: 'center', margin: 'var(--space-lg) 0' }}>
            <span className="text-small">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 600,
                }}
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </span>
          </div>

          {/* Demo Login Section */}
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 'var(--space-xl)',
            marginTop: 'var(--space-lg)',
          }}>
            <p className="text-label" style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>
              QUICK DEMO ACCESS
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: 'var(--space-sm)' }}>
              {[
                { role: 'admin', label: 'Admin', color: 'var(--text-primary)', hoverBg: 'var(--text-primary)', hoverText: 'var(--text-inverse)', shadow: 'rgba(0,0,0,0.2)' },
                { role: 'planner', label: 'Planner', color: 'var(--accent)', hoverBg: 'var(--accent)', hoverText: '#ffffff', shadow: 'rgba(228, 164, 189, 0.4)' },
                { role: 'engg', label: 'Engineering', color: 'var(--dept-engg)', hoverBg: 'var(--dept-engg)', hoverText: '#ffffff', shadow: 'rgba(74, 124, 89, 0.35)' },
                { role: 'snt', label: 'Signal & Telecom', color: 'var(--dept-snt)', hoverBg: 'var(--dept-snt)', hoverText: '#ffffff', shadow: 'rgba(69, 123, 157, 0.35)' },
                { role: 'trd', label: 'Traction', color: 'var(--dept-trd)', hoverBg: 'var(--dept-trd)', hoverText: '#ffffff', shadow: 'rgba(212, 160, 87, 0.35)' },
              ].map((demo) => {
                const isHovered = hoveredRole === demo.role
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleDemoLogin(demo.role)}
                    onMouseEnter={() => setHoveredRole(demo.role)}
                    onMouseLeave={() => setHoveredRole(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.02em',
                      padding: '8px 6px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${demo.color}`,
                      background: isHovered ? demo.hoverBg : 'var(--bg-card)',
                      color: isHovered ? demo.hoverText : demo.color,
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: isHovered ? `0 6px 16px ${demo.shadow}` : 'none',
                    }}
                  >
                    {demo.label}
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
