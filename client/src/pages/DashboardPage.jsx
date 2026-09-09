import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import RevealWrapper from '../components/layout/RevealWrapper'
import api from '../lib/api'
import {
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Train,
  Wrench,
  Zap,
  CalendarRange,
  ArrowRight,
  Activity,
  Loader2,
} from 'lucide-react'

const iconMap = {
  'Asset Availability': Activity,
  'Blocks Planned': CalendarRange,
  'Overdue Tasks': AlertTriangle,
  'Conflicts Resolved': CheckCircle2,
}

const borderColorMap = {
  'Asset Availability': 'var(--status-healthy)',
  'Blocks Planned': 'var(--accent)',
  'Overdue Tasks': 'var(--status-due)',
  'Conflicts Resolved': 'var(--dept-snt)',
}

const cornerClassMap = {
  'Asset Availability': 'corner-healthy',
  'Blocks Planned': 'corner-engg',
  'Overdue Tasks': 'corner-conflict',
  'Conflicts Resolved': 'corner-snt',
}

const timeSlots = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']

export default function DashboardPage() {
  const [dashData, setDashData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/analytics/dashboard-summary')
      .then((res) => {
        setDashData(res)
      })
      .catch((err) => {
        console.error('Dashboard fetch error:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px', color: 'var(--text-muted)' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Dashboard...</span>
      </div>
    )
  }

  const kpiData = dashData?.kpis || []
  const activityFeed = dashData?.activityFeed || []
  const todayBlocks = dashData?.todayBlocks || []
  const deptSummary = dashData?.deptSummary || []
  const quickStats = dashData?.quickStats || {}

  return (
    <div>
      {/* Page Header */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-2xl)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p className="text-label" style={{ marginBottom: '4px' }}>OVERVIEW</p>
          <h3>Dashboard</h3>
          {dashData?.source && (
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Data: {dashData.source}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary">
            <Clock size={14} /> Last 7 Days
          </button>
          <button className="btn btn-primary">
            <Zap size={14} /> Generate AI Plan
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-kpi-grid">
        {kpiData.map((kpi, index) => {
          const Icon = iconMap[kpi.label] || Activity
          const iconColor = borderColorMap[kpi.label] || 'var(--accent)'
          return (
            <RevealWrapper key={kpi.label} delay={index * 80}>
              <div className="kpi-card">
                <div className="flex-between">
                  <span className="kpi-label">{kpi.label}</span>
                  <Icon size={18} color={iconColor} />
                </div>
                <p className="kpi-value">{kpi.value}</p>
                <span className={`kpi-trend ${kpi.trendUp ? 'up' : 'down'}`}>
                  {kpi.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {kpi.trend}
                </span>
              </div>
            </RevealWrapper>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Left: Gantt Timeline */}
        <RevealWrapper delay={200}>
          <div className="gantt-container">
            <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
              <div>
                <p className="text-label" style={{ marginBottom: '4px' }}>TODAY'S SCHEDULE</p>
                <h5>Block Timeline</h5>
              </div>
              <button className="arrow-cta">
                View Full Schedule <ArrowRight size={12} />
              </button>
            </div>

            {/* Time Header */}
            <div className="gantt-row" style={{ borderBottom: '1px solid var(--border-strong)' }}>
              <div className="gantt-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CORRIDOR</div>
              <div className="gantt-track" style={{ display: 'flex' }}>
                {timeSlots.map((slot) => (
                  <div key={slot} style={{
                    flex: 1,
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}>
                    {slot}
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Rows */}
            {todayBlocks.length > 0 ? todayBlocks.map((corridor) => (
              <div key={corridor.corridor} className="gantt-row">
                <div className="gantt-label" style={{ fontSize: '0.8125rem' }}>{corridor.corridor}</div>
                <div className="gantt-track">
                  {corridor.blocks.map((block, i) => (
                    <div
                      key={i}
                      className={`gantt-block dept-${block.dept} ${block.conflict ? 'conflict' : ''}`}
                      style={{
                        left: `${(block.start / 12) * 100}%`,
                        width: `${(Math.max(0.5, block.end - block.start) / 12) * 100}%`,
                      }}
                      title={`${block.label} (${block.dept.toUpperCase()})`}
                    >
                      {block.label}
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No block plans scheduled. Create one from the Block Plan page.
              </div>
            )}
          </div>
        </RevealWrapper>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Activity Feed */}
          <RevealWrapper delay={300}>
            <div className="card" style={{ padding: 'var(--space-xl)' }}>
              <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
                <div>
                  <p className="text-label" style={{ marginBottom: '4px' }}>LIVE</p>
                  <h5>Activity Feed</h5>
                </div>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--status-healthy)',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {activityFeed.length > 0 ? activityFeed.map((activity, index) => (
                  <motion.div
                    key={activity.id || index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-md)',
                      paddingBottom: 'var(--space-md)',
                      borderBottom: index < activityFeed.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: activity.color || 'var(--accent)',
                      marginTop: '6px',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.4 }}>
                        {activity.section}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {activity.dept} · {activity.time || 'recently'}
                      </p>
                    </div>
                  </motion.div>
                )) : (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No recent activity.</p>
                )}
              </div>
            </div>
          </RevealWrapper>

          {/* Department Summary */}
          <RevealWrapper delay={400}>
            <div className="card-flat" style={{ padding: 'var(--space-xl)' }}>
              <p className="text-label" style={{ marginBottom: 'var(--space-lg)' }}>DEPARTMENT OVERVIEW</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {deptSummary.map((dept) => (
                  <div key={dept.code} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-card)',
                      background: `${dept.color}20`,
                      color: dept.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      flexShrink: 0,
                    }}>
                      {dept.code}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{dept.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {dept.blocks} items · {dept.overdue} overdue
                      </p>
                    </div>
                    <span className={`badge ${dept.overdue > 10 ? 'badge-overdue' : 'badge-due'}`}>
                      {dept.overdue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </RevealWrapper>
        </div>
      </div>

      {/* Bottom: Quick Stats Row */}
      <RevealWrapper delay={500}>
        <div className="dashboard-quickstats-grid">
          {[
            { icon: Train, value: String(quickStats.trainsTracked || 0), label: 'Trains Tracked Today', sub: 'Passenger + Goods' },
            { icon: Wrench, value: String(quickStats.maintenanceTasks || 0), label: 'Maintenance Tasks Active', sub: 'Across all sections' },
            { icon: LayoutGrid, value: String(quickStats.corridorsUnderBlock || 0), label: 'Corridors Under Block', sub: 'Real-time monitoring' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="card"
              whileHover={{ y: -3 }}
              style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}
            >
              <stat.icon size={28} style={{ color: 'var(--accent)', margin: '0 auto var(--space-md)' }} />
              <p style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '4px', color: 'var(--text-primary)' }}>{stat.value}</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '2px', color: 'var(--text-primary)' }}>{stat.label}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </RevealWrapper>
    </div>
  )
}
