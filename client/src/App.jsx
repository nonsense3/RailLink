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
import HomePage from './pages/HomePage'

// App Shell Layout (supports public defect viewing and protected worker routes)
function ProtectedLayout() {
  const { user, loading } = useAuthStore()
  const { sidebarCollapsed, mobileSidebarOpen, closeMobileSidebar } = useAppStore()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    )
  }

  // Publicly visible pages without login (Approved defects explorer)
  const isPublicPath = location.pathname === '/defects'

  if (!user && !isPublicPath) {
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
              {/* Publicly visible without login */}
              <Route path="/defects" element={<DefectPage />} />

              {/* Worker & Employee Authenticated Routes */}
              {user ? (
                <>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                </>
              ) : (
                <Route path="/" element={<Navigate to="/defects" replace />} />
              )}

              {/* Admin Exclusive: Block plans, AI Studio, and System Admin Panel */}
              {user?.role === 'admin' && (
                <>
                  <Route path="/plans" element={<BlockPlanPage />} />
                  <Route path="/ai-studio" element={<AIStudioPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </>
              )}

              {/* Fallback navigation */}
              <Route path="*" element={<Navigate to={user ? "/dashboard" : "/defects"} replace />} />
            </Routes>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  )
}
