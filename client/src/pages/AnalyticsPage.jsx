import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RevealWrapper from '../components/layout/RevealWrapper'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import {
  TrendingUp,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Database,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import api from '../lib/api'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null
  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-md)',
      boxShadow: 'var(--shadow-lg)',
      fontFamily: 'var(--font-family)',
    }}>
      <p style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: '4px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ fontSize: '0.75rem', color: entry.color, margin: '2px 0' }}>
          {entry.name}: <strong>{entry.value}{typeof entry.value === 'number' && entry.value <= 100 && !label?.includes?.('Defect') ? '%' : ''}</strong>
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [analyticsData, setAnalyticsData] = useState({
    blockUtilization: [],
    assetAvailability: [],
    defectTrends: [],
    deptPerformance: [],
    blockDistribution: [],
    aiInsights: [],
    stats: {},
    source: 'Loading...',
  })

  const loadAnalytics = async () => {
    try {
      setRefreshing(true)
      const res = await api.get('/analytics/hub')
      if (res) {
        setAnalyticsData(res)
      }
    } catch (err) {
      console.error('Failed to load analytics hub data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const {
    blockUtilization = [],
    assetAvailability = [],
    defectTrends = [],
    deptPerformance = [],
    blockDistribution = [],
    aiInsights = [],
    source = 'RailLink Live API',
  } = analyticsData

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--space-md)',
      }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Aggregating intelligence from Supabase & RailLink DataStore...
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <p className="text-label">INTELLIGENCE</p>
            <span className="badge badge-healthy" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
              <Database size={10} /> {source}
            </span>
          </div>
          <h3>Analytics Hub</h3>
          <p className="text-small" style={{ marginTop: '4px' }}>
            Live Analytics & Forecasting — Powered by Supabase
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-strong)',
            overflow: 'hidden',
          }}>
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '8px 16px',
                  background: timeRange === range ? 'var(--accent)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family)',
                  fontSize: '10px',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                }}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(analyticsData, null, 2))}`
              const a = document.createElement('a')
              a.href = jsonStr
              a.download = `RailLink-analytics-${new Date().toISOString().slice(0, 10)}.json`
              a.click()
            }}
          >
            <Download size={14} /> Export
          </button>
          <button
            className="btn btn-secondary"
            onClick={loadAnalytics}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-two-col-grid">
        {/* Block Utilization */}
        <RevealWrapper>
          <div className="card" style={{ padding: 'var(--space-xl)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
              <div>
                <p className="text-label" style={{ marginBottom: '4px' }}>SUPABASE · LIVE DATA</p>
                <h5>Block Utilization</h5>
              </div>
              <span className="badge badge-healthy">
                <TrendingUp size={12} /> +8.2%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={blockUtilization} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="actual" name="Actual" fill="var(--border-strong)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="planned" name="Planned" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="optimized" name="AI Optimized" fill="var(--status-healthy)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </RevealWrapper>

        {/* Asset Availability */}
        <RevealWrapper delay={100}>
          <div className="card" style={{ padding: 'var(--space-xl)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
              <div>
                <p className="text-label" style={{ marginBottom: '4px' }}>REAL-TIME TRACKING</p>
                <h5>Asset Availability</h5>
              </div>
              <span className="badge badge-healthy">
                {assetAvailability[assetAvailability.length - 1]?.overall || 95.5}%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={assetAvailability}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[80, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="overall" name="Overall" stroke="#262626" fill="rgba(38,38,38,0.05)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="engg" name="Engineering" stroke="#e4a4bd" fill="rgba(228,164,189,0.1)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="snt" name="S&T" stroke="#7ec4cf" fill="rgba(126,196,207,0.1)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="trd" name="TRD" stroke="#d4a057" fill="rgba(212,160,87,0.1)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </RevealWrapper>

        {/* Defect Trends */}
        <RevealWrapper delay={200}>
          <div className="card" style={{ padding: 'var(--space-xl)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
              <div>
                <p className="text-label" style={{ marginBottom: '4px' }}>TREND ANALYSIS</p>
                <h5>Defect Trends</h5>
              </div>
              <span className="badge badge-healthy">
                <TrendingUp size={12} /> Declining
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={defectTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="track" name="Track Defects" stroke="#e4a4bd" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="signal" name="Signal Failures" stroke="#7ec4cf" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="ohe" name="OHE Issues" stroke="#d4a057" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </RevealWrapper>

        {/* Department Performance Radar */}
        <RevealWrapper delay={300}>
          <div className="card" style={{ padding: 'var(--space-xl)' }}>
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <p className="text-label" style={{ marginBottom: '4px' }}>DEPARTMENT SCORECARD</p>
              <h5>Performance Radar</h5>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart outerRadius={100} data={deptPerformance}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar name="Engineering" dataKey="engg" stroke="#e4a4bd" fill="#e4a4bd" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="S&T" dataKey="snt" stroke="#7ec4cf" fill="#7ec4cf" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="TRD" dataKey="trd" stroke="#d4a057" fill="#d4a057" fillOpacity={0.15} strokeWidth={2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </RevealWrapper>
      </div>

      {/* Block Distribution Pie + Summary */}
      <div className="analytics-split-grid">
        <RevealWrapper delay={400}>
          <div className="card" style={{ padding: 'var(--space-xl)' }}>
            <p className="text-label" style={{ marginBottom: '4px' }}>DISTRIBUTION</p>
            <h5 style={{ marginBottom: 'var(--space-lg)' }}>Block Allocation</h5>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={blockDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {blockDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'var(--space-md)' }}>
              {blockDistribution.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                  <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{item.name}</span>
                  <span style={{ fontWeight: 700 }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </RevealWrapper>

        <RevealWrapper delay={500}>
          <div className="card-flat" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p className="text-label" style={{ marginBottom: 'var(--space-md)' }}>AI INSIGHTS · LIVE ANALYSIS</p>
            <h4 style={{ marginBottom: 'var(--space-lg)' }}>Key Findings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {aiInsights.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  border: `1px solid ${item.positive ? 'rgba(109,184,123,0.2)' : 'rgba(201,79,79,0.2)'}`,
                }}>
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    {item.positive ? (
                      <CheckCircle2 size={16} color="var(--status-healthy)" />
                    ) : (
                      <AlertTriangle size={16} color="var(--status-overdue)" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '4px' }}>{item.insight}</p>
                    <span className={`badge ${item.positive ? 'badge-healthy' : 'badge-overdue'}`}>
                      {item.metric}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealWrapper>
      </div>
    </div>
  )
}
