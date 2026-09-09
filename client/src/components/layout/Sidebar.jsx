import { Link, useLocation } from 'react-router-dom'
import { useAuthStore, useAppStore } from '../../store'
import {
  LayoutDashboard,
  Map,
  CalendarRange,
  Wrench,
  BarChart3,
  Brain,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react'

const navItems = [
  { label: 'Overview', section: true },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/map', label: 'Corridor Map', icon: Map },
  { label: 'Planning', section: true },
  { path: '/plans', label: 'Block Plans', icon: CalendarRange },
  { path: '/defects', label: 'Defect Explorer', icon: Wrench },
  { label: 'Intelligence', section: true },
  { path: '/analytics', label: 'Analytics Hub', icon: BarChart3 },
  { path: '/ai-studio', label: 'AI Studio', icon: Brain },
  { label: 'System', section: true },
  { path: '/admin', label: 'Admin Panel', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()
  const { logout, user } = useAuthStore()
  const { sidebarCollapsed, collapseSidebar, mobileSidebarOpen, closeMobileSidebar } = useAppStore()

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`} style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-primary)',
      transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: 90
    }}>
      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: 'var(--space-md) var(--space-sm)', overflowY: 'auto' }}>
        {navItems.map((item, index) => {
          if (item.section) {
            return !sidebarCollapsed ? (
              <div key={index} className="sidebar-section-label" style={{
                fontSize: '9px',
                fontWeight: 900,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                padding: '16px 12px 6px'
              }}>
                {item.label}
              </div>
            ) : (
              <div key={index} style={{ height: '16px' }} />
            )
          }

          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileSidebar}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-light)' : 'transparent',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.85rem',
                textDecoration: 'none',
                marginBottom: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--text-primary)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User & Sidebar Footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '12px 14px',
        background: 'rgba(0,0,0,0.015)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* User Card */}
        {!sidebarCollapsed ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.8rem',
                flexShrink: 0
              }}>
                {(user?.name || 'Admin').charAt(0)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Rail Controller'}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                  {user?.department || 'Ministry of Railways'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
            <div
              title={user?.name || 'Admin'}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--accent)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.85rem'
              }}
            >
              {(user?.name || 'A').charAt(0)}
            </div>
          </div>
        )}

        {/* Action Controls: Logout & Collapse */}
        {sidebarCollapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={collapseSidebar}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={logout}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dept-conflict)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              title="Logout"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>

            <button
              onClick={collapseSidebar}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
