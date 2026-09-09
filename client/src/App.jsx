import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, useAppStore } from './store'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'
import DashboardPage from './pages/DashboardPage'
import MapPage from './pages/MapPage'
import BlockPlanPage from './pages/BlockPlanPage'
import DefectPage from './pages/DefectPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AIStudioPage from './pages/AIStudioPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'

// Protected Route component
function ProtectedLayout() {
  const { user } = useAuthStore()
  const { sidebarCollapsed, mobileSidebarOpen, closeMobileSidebar } = useAppStore()
  const location = useLocation()

  // Default to demo admin if not logged in so judges can instantly view without manual login
  if (!user && !localStorage.getItem('RailLink_demo_user')) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Mobile Sidebar Backdrop Overlay */}
        <div
          className={`mobile-sidebar-backdrop ${mobileSidebarOpen ? 'active' : ''}`}
          onClick={closeMobileSidebar}
          aria-label="Close sidebar"
        />
        <Sidebar />
        <main
          className="main-content"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            marginLeft: sidebarCollapsed ? '72px' : '260px',
            transition: 'margin-left var(--duration) var(--ease-premium)',
            minWidth: 0
          }}
        >
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/plans" element={<BlockPlanPage />} />
              <Route path="/defects" element={<DefectPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/ai-studio" element={<AIStudioPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { initialize, user, demoLogin } = useAuthStore()

  useEffect(() => {
    initialize()
    // Auto initialize demo user if not logged in so UI displays populated immediately
    if (!user) {
      const saved = localStorage.getItem('RailLink_demo_user')
      if (saved) {
        try {
          useAuthStore.setState({ user: JSON.parse(saved), session: { demo: true }, loading: false })
        } catch {
          demoLogin('admin')
        }
      } else {
        demoLogin('admin')
      }
    }
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  )
}
