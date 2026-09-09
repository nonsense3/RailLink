import { Link } from 'react-router-dom'
import { Train, Shield, Activity, Cpu } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
      padding: 'var(--space-2xl) var(--space-xl)',
      marginTop: 'auto',
      transition: 'var(--transition-base)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--space-xl)',
        alignItems: 'start'
      }}>
        {/* Brand info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-sm)' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
            }}>
              <Train size={18} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              RAIL<span style={{ color: 'var(--accent)' }}>LINK</span>
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-md)' }}>
            AI-Powered Automatic Block Planning System designed to maximize railway asset availability and synchronize cross-departmental maintenance windows.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(109, 184, 123, 0.12)',
            border: '1px solid rgba(109, 184, 123, 0.3)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--status-healthy)'
          }}>
            <Activity size={12} />
            <span>Automated Block Optimization & Corridor Coordination</span>
          </div>
        </div>

        {/* Quick Navigation */}
        <div>
          <h4 style={{
            fontSize: '0.75rem',
            fontWeight: 900,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-md)'
          }}>
            System Modules
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Dashboard Overview</Link></li>
            <li><Link to="/map" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Corridor Topology & GIS</Link></li>
            <li><Link to="/plans" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Block Plan Manager & Gantt</Link></li>
            <li><Link to="/defects" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>TMS / SMMS / TDMS Defects</Link></li>
            <li><Link to="/analytics" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Analytics Hub</Link></li>
            <li><Link to="/ai-studio" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>AI Optimization Studio</Link></li>
          </ul>
        </div>

        {/* Department Integrations */}
        <div>
          <h4 style={{
            fontSize: '0.75rem',
            fontWeight: 900,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-md)'
          }}>
            Integrated Systems
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dept-engg)' }}></span>
              TMS (Track Management System)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dept-snt)' }}></span>
              SMMS (Signal & Telecom)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dept-trd)' }}></span>
              TDMS (Traction Distribution)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></span>
              COA (Control Office Application)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dept-conflict)' }}></span>
              BDMS (Block Demarcation System)
            </li>
          </ul>
        </div>

        {/* AI & Infrastructure Engine */}
        <div>
          <h4 style={{
            fontSize: '0.75rem',
            fontWeight: 900,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-md)'
          }}>
            Engine Architecture
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              <Cpu size={16} color="var(--accent)" />
              <span>OR-Tools & XGBoost Optimization</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              <Shield size={16} color="var(--dept-snt)" />
              <span>Supabase Real-time Pipeline (PostgreSQL + Realtime)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              <Train size={16} color="var(--dept-trd)" />
              <span>Cloudinary Smart Media CDN (Field Photo Inspection)</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
              Enterprise data sync via Supabase PostgreSQL, paired with Cloudinary CDN for instant track defect photo verification.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: 'var(--space-xl) auto 0',
        paddingTop: 'var(--space-md)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-md)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          © 2025 Ministry of Railways, Government of India.
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
          <span>Security Protocol: IR-CRIS v4.2</span>
          <span>Latency: 18ms</span>
          <span>Environment: Production Sim</span>
        </div>
      </div>
    </footer>
  )
}
