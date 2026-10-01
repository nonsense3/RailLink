import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Train, Shield, Activity, Sparkles, ArrowRight, Zap, Globe } from 'lucide-react'

export default function HomePage() {
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  }

  const itemVars = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80 } }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: 'white',
      fontFamily: '"Inter", sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background Decorative Elements */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '1.5rem 4rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            padding: '0.5rem', borderRadius: '12px',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Train size={24} color="white" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, tracking: '-0.05em' }}>RailLink</span>
        </div>
        <div>
          <Link to="/login" style={{
            textDecoration: 'none', color: 'white', fontWeight: 600, fontSize: '0.95rem',
            padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)',
            borderRadius: '999px', transition: 'all 0.3s ease',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          >
            Access Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{
        position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem',
        textAlign: 'center', minHeight: 'calc(100vh - 80px)'
      }}>
        <motion.div variants={containerVars} initial="hidden" animate="show" style={{ maxWidth: '800px' }}>
          <motion.div variants={itemVars} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc',
            padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.85rem',
            fontWeight: 600, marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <Sparkles size={14} />
            Powered by Gemma AI
          </motion.div>

          <motion.h1 variants={itemVars} style={{
            fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem',
            background: 'linear-gradient(to right, #ffffff, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            The Future of Railway <br/> Operations & Planning
          </motion.h1>

          <motion.p variants={itemVars} style={{
            fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '3rem',
            maxWidth: '600px', margin: '0 auto 3rem auto'
          }}>
            An intelligent, AI-driven platform for generating optimized block plans, managing track defects, and coordinating seamless departmental workflows.
          </motion.p>

          <motion.div variants={itemVars} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white',
              padding: '1rem 2.5rem', borderRadius: '999px', fontWeight: 600, fontSize: '1.1rem',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)', transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Get Started <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          variants={containerVars} initial="hidden" animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px', marginTop: '6rem' }}>
          
          <FeatureCard 
            icon={<Zap size={28} color="#f43f5e" />}
            title="AI Schedule Generation"
            description="Leverage Gemma AI to automatically generate conflict-free, highly optimized block maintenance schedules."
          />
          <FeatureCard 
            icon={<Shield size={28} color="#10b981" />}
            title="Secure Role Management"
            description="Enterprise-grade authentication with strict role-based access controls for Administrators and Employees."
          />
          <FeatureCard 
            icon={<Activity size={28} color="#3b82f6" />}
            title="Real-Time Defect Tracking"
            description="Monitor live infrastructure health and track defects with dynamic prioritization and heatmaps."
          />

        </motion.div>
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      whileHover={{ y: -5, background: 'rgba(255, 255, 255, 0.08)' }}
      style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '20px',
      padding: '2rem',
      textAlign: 'left',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)', display: 'inline-flex',
        padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem', color: '#f8fafc' }}>{title}</h3>
      <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>{description}</p>
    </motion.div>
  )
}
