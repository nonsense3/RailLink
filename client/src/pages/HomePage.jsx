import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Train, CalendarCheck, ShieldCheck, Activity, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  }

  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 90, damping: 15 } }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fcfaf9',
      color: '#2d2d2d',
      fontFamily: '"Inter", sans-serif',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Soft Background Blobs matching Login Page aesthetic */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, rgba(235, 219, 219, 0.4) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(228, 179, 194, 0.2) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(100px)', zIndex: 0
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '1.5rem 4rem',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        backgroundColor: 'rgba(252, 250, 249, 0.8)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: '#e4a5b8',
            padding: '0.4rem', borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(228, 165, 184, 0.3)'
          }}>
            <Train size={22} color="white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#e4a5b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ministry of Railways</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginTop: '0.1rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#222', letterSpacing: '-0.02em' }}>RAIL</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#e4a5b8', fontStyle: 'italic', letterSpacing: '-0.02em' }}>LINK</span>
            </div>
          </div>
        </div>
        <div>
          <Link to="/login" style={{
            textDecoration: 'none', color: '#fff', fontWeight: 600, fontSize: '0.9rem',
            padding: '0.6rem 1.4rem', backgroundColor: '#e4a5b8',
            borderRadius: '6px', transition: 'all 0.2s ease',
            boxShadow: '0 4px 10px rgba(228, 165, 184, 0.25)',
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#d392a8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#e4a5b8'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Access Portal <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{
        position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem',
        textAlign: 'center'
      }}>
        <motion.div variants={containerVars} initial="hidden" animate="show" style={{ maxWidth: '850px' }}>
          
          <motion.div variants={itemVars} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            backgroundColor: 'rgba(228, 165, 184, 0.15)', color: '#b56d83',
            padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem',
            fontWeight: 700, marginBottom: '2rem', letterSpacing: '0.02em',
            border: '1px solid rgba(228, 165, 184, 0.3)'
          }}>
            <Activity size={14} />
            AI-Powered Operations
          </motion.div>

          <motion.h1 variants={itemVars} style={{
            fontSize: '4rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.5rem',
            color: '#1a1a1a', letterSpacing: '-0.03em'
          }}>
            Maximize Asset Availability <br/> for Train Operations
          </motion.h1>

          <motion.p variants={itemVars} style={{
            fontSize: '1.2rem', color: '#666', lineHeight: 1.6, marginBottom: '3rem',
            maxWidth: '650px', margin: '0 auto 3rem auto', fontWeight: 400
          }}>
            An intelligent platform engineered for Indian Railways to generate optimized block plans, monitor track defects, and seamlessly coordinate multi-department workflows.
          </motion.p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          variants={containerVars} initial="hidden" animate="show"
          style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem', width: '100%', maxWidth: '1000px', marginTop: '3rem' 
          }}>
          
          <FeatureCard 
            icon={<CalendarCheck size={24} color="#b56d83" />}
            title="AI-Optimized Scheduling"
            description="Automatic block planning leveraging Gemma AI, XGBoost & OR-Tools for conflict-free maintenance windows."
          />
          <FeatureCard 
            icon={<ShieldCheck size={24} color="#b56d83" />}
            title="Proactive Safety Assurance"
            description="Proactive conflict detection ensuring maximum safety and operational integrity across all sectors."
          />
          <FeatureCard 
            icon={<Activity size={24} color="#b56d83" />}
            title="Multi-Department Coordination"
            description="Integrated dashboards for TRD, Engineering, and S&T to collaborate and track defects in real-time."
          />

        </motion.div>
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
      style={{
      backgroundColor: '#ffffff',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      borderRadius: '16px',
      padding: '2rem',
      textAlign: 'left',
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        backgroundColor: 'rgba(228, 165, 184, 0.12)', display: 'inline-flex',
        padding: '0.8rem', borderRadius: '12px', marginBottom: '1.25rem'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: '#2d2d2d' }}>{title}</h3>
      <p style={{ color: '#666', lineHeight: 1.5, fontSize: '0.95rem' }}>{description}</p>
    </motion.div>
  )
}
