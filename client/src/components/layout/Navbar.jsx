import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, useAppStore } from '../../store'
import {
  Bell,
  Menu,
  Search,
  Zap,
  X,
  MapPin,
  CalendarRange,
  Wrench,
  LayoutDashboard,
  Brain,
  Settings,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
const shortcutKey = isMac ? '⌘K' : 'Ctrl+K'

const baseQuickItems = [
  { title: 'Dashboard Overview', path: '/dashboard', type: 'Page', icon: LayoutDashboard },
  { title: 'Corridor GIS Map (Leaflet Satellite)', path: '/map', type: 'Page', icon: MapPin },
  { title: 'Block Plan Manager (OR-Tools Scheduler)', path: '/plans', type: 'Page', icon: CalendarRange },
  { title: 'Defect Explorer & Field Upload', path: '/defects', type: 'Page', icon: Wrench },
  { title: 'AI Block Planning Studio', path: '/ai-studio', type: 'Page', icon: Brain },
  { title: 'Analytics & Speed Restrictions', path: '/analytics', type: 'Page', icon: Settings },
  { title: 'Admin Panel & Live Health', path: '/admin', type: 'Page', icon: Settings },
  { title: 'Delhi - Agra Semi High-Speed Corridor', path: '/map?c=delhi', type: 'Corridor', icon: MapPin },
  { title: 'Mumbai - Pune Expressway Section', path: '/map?c=mumbai', type: 'Corridor', icon: MapPin },
  { title: 'Howrah - Kharagpur Trunk Route', path: '/map?c=howrah', type: 'Corridor', icon: MapPin },
  { title: 'Chennai - Arakkonam Fast Line', path: '/map?c=chennai', type: 'Corridor', icon: MapPin },
  { title: 'Bengaluru - Jolarpettai Express Route', path: '/map?c=bengaluru', type: 'Corridor', icon: MapPin },
]

export default function Navbar() {
  const { user } = useAuthStore()
  const { toggleSidebar, toggleMobileSidebar, notifications, sidebarCollapsed, theme, toggleTheme } = useAppStore()
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleMenuToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      toggleMobileSidebar()
    } else {
      toggleSidebar()
    }
  }

  // Keyboard shortcut Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowSearchModal((prev) => !prev)
      } else if (e.key === 'Escape') {
        setShowSearchModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredItems = baseQuickItems.filter((item) =>
    !query || item.title.toLowerCase().includes(query.toLowerCase()) || item.type.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (path) => {
    navigate(path)
    setShowSearchModal(false)
    setQuery('')
  }

  return (
    <>
      <nav className="nav">
        {/* Left: Brand + Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button
            onClick={handleMenuToggle}
            className="btn-icon"
            style={{
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)'
            }}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
          <Link to="/dashboard" className="nav-brand" style={{ textDecoration: 'none' }}>
            RAIL<span>LINK</span>
          </Link>
        </div>

        {/* Center: Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
          <div className="nav-status-badge" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(109, 184, 123, 0.12)',
            border: '1px solid rgba(109, 184, 123, 0.25)',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--status-healthy)',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--status-healthy)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            SYSTEMS OPERATIONAL
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {/* Functional Search Bar - Desktop */}
          <div
            className="nav-search-desktop"
            onClick={() => setShowSearchModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setShowSearchModal(true) }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              minWidth: '220px',
              border: '1px solid var(--border)',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={14} color="var(--accent)" />
            <span>Search anything...</span>
            <span style={{
              marginLeft: 'auto',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)'
            }}>{shortcutKey}</span>
          </div>

          {/* Search Icon Button - Mobile */}
          <button
            className="btn-icon nav-search-mobile-btn"
            onClick={() => setShowSearchModal(true)}
            style={{
              display: 'none',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Search"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Theme Toggle Button (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: theme === 'dark' ? '#fbbf24' : 'var(--text-primary)',
              cursor: 'pointer',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Notifications */}
          <button
            className="btn-icon"
            style={{
              position: 'relative',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              cursor: 'pointer',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--dept-conflict)',
              }} />
            )}
          </button>

          {/* Authentication & Quick Action */}
          {user ? (
            user.role === 'admin' ? (
              <Link
                to="/admin"
                className="btn btn-primary"
                style={{
                  fontSize: '11px',
                  textDecoration: 'none',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 800
                }}
              >
                <Settings size={14} />
                ADMIN PANEL
              </Link>
            ) : (
              <Link
                to="/defects"
                className="btn btn-primary"
                style={{
                  fontSize: '11px',
                  textDecoration: 'none',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 800
                }}
              >
                <Wrench size={14} />
                REPORT DEFECT
              </Link>
            )
          ) : (
            <Link
              to="/login"
              className="btn btn-primary"
              style={{
                fontSize: '11px',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 800
              }}
            >
              WORKER LOGIN
            </Link>
          )}
        </div>
      </nav>

      {/* SEARCH COMMAND PALETTE MODAL */}
      <AnimatePresence>
        {showSearchModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(5px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '12vh'
            }}
            onClick={() => setShowSearchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                width: '100%',
                maxWidth: '620px',
                background: 'var(--bg-primary)',
                padding: '0',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                borderRadius: '16px',
                border: '1px solid var(--border)'
              }}
            >
              {/* Search Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <Search size={20} color="var(--accent)" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to search corridors, defects, block plans, or pages..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-family)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  onClick={() => setShowSearchModal(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Results List */}
              <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
                {filteredItems.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No results found for "{query}".
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <div
                        key={item.title + item.path}
                        onClick={() => handleSelect(item.path)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(228, 164, 189, 0.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <IconComponent size={16} color="var(--accent)" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.title}
                          </p>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: '4px' }}>
                          {item.type}
                        </span>
                        <ArrowRight size={14} color="var(--text-muted)" />
                      </div>
                    )
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '10px 18px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Use <strong>Enter</strong> to select</span>
                <span>Press <strong>ESC</strong> to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
