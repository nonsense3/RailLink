import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import RevealWrapper from '../components/layout/RevealWrapper'
import { useAuthStore } from '../store'
import api from '../lib/api'
import { supabase } from '../lib/supabase'
import {
  Users,
  RefreshCw,
  CheckCircle2,
  Shield,
  Sparkles,
  UserCheck,
  Activity,
  BarChart3,
  Bell,
  Lock,
  ChevronRight,
  Plus,
  Settings,
  Eye,
  Edit3,
  Trash2,
  TrendingUp,
  Database,
  Brain,
  Key,
  Globe,
  Copy,
  ExternalLink,
  Server,
  Check,
  Clock,
  AlertTriangle,
  XCircle,
  X,
  MapPin,
  Train,
  Tag,
  Search,
  ArrowRight,
  Wrench,
  Calendar
} from 'lucide-react'

export default function AdminPage() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)
  const initialDefectId = searchParams.get('defectId')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [usersList, setUsersList] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDefects: 0,
    totalPlans: 0
  })

  // Pending Defect Approvals Queue States
  const [pendingDefects, setPendingDefects] = useState([])
  const [pendingSearch, setPendingSearch] = useState('')
  const [pendingDeptFilter, setPendingDeptFilter] = useState('ALL')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [approvalMessage, setApprovalMessage] = useState(null)
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const [batchProcessing, setBatchProcessing] = useState(false)

  // Approved Defects & Block/Crew Allocation States
  const [approvedDefects, setApprovedDefects] = useState([])
  const [allocFilter, setAllocFilter] = useState('ALL') // 'ALL' | 'PENDING' | 'SCHEDULED'
  const [allocSearch, setAllocSearch] = useState('')
  const [allocatingDefect, setAllocatingDefect] = useState(null)
  const [savingAllocation, setSavingAllocation] = useState(false)
  const [allocationMsg, setAllocationMsg] = useState(null)

  // Allocation Form Fields
  const [allocDate, setAllocDate] = useState('2026-10-02')
  const [allocStartTime, setAllocStartTime] = useState('01:30')
  const [allocEndTime, setAllocEndTime] = useState('04:30')
  const [allocDuration, setAllocDuration] = useState('3h 00m')
  const [allocBlockType, setAllocBlockType] = useState('Night Shadow Curfew (01:30 - 04:30)')
  const [allocCrew, setAllocCrew] = useState('Track Gang #04 (PW Heavy Section)')
  const [allocSupervisor, setAllocSupervisor] = useState('R.K. Sharma (SSE/PW)')
  const [allocWorkersCount, setAllocWorkersCount] = useState(8)
  const [allocMachinery, setAllocMachinery] = useState('Plasser Tamper DUOMATIC & Rail Drill')

  // Settings & AI State
  const [aiStatus, setAiStatus] = useState(null)
  const [ollamaKey, setOllamaKey] = useState('')
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState('')
  const [ollamaModel, setOllamaModel] = useState('gemma4')
  const [savingAi, setSavingAi] = useState(false)
  const [aiSaveMsg, setAiSaveMsg] = useState(null)
  const [copiedUrl, setCopiedUrl] = useState(null)

  const loadAiStatus = async () => {
    try {
      const res = await api.get('/ai/status')
      if (res) {
        setAiStatus(res)
        if (res.baseUrl) setOllamaBaseUrl(res.baseUrl)
        if (res.model) setOllamaModel(res.model)
      }
    } catch (err) {
      console.error('Failed to load AI status:', err)
    }
  }

  const handleSaveAiConfig = async (e) => {
    e.preventDefault()
    setSavingAi(true)
    setAiSaveMsg(null)
    try {
      const res = await api.post('/ai/config-keys', {
        ollamaKey: ollamaKey.trim() || undefined,
        ollamaBaseUrl: ollamaBaseUrl.trim() || undefined,
        ollamaModel: ollamaModel.trim() || 'gemma4'
      })
      await loadAiStatus()
      setAiSaveMsg({
        type: 'success',
        text: `✓ AI Settings updated! Active Engine: ${res.ollamaConfigured ? 'Ollama (' + (res.ollamaModel || 'gemma4') + ')' : 'Local Engine'}`
      })
    } catch (err) {
      setAiSaveMsg({ type: 'error', text: `Failed to update: ${err.message}` })
    } finally {
      setSavingAi(false)
      setTimeout(() => setAiSaveMsg(null), 5000)
    }
  }

  const copyToClipboard = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
    }
    setCopiedUrl(label)
    setTimeout(() => setCopiedUrl(null), 2500)
  }

  const loadData = async () => {
    try {
      setRefreshing(true)

      // Load users
      try {
        const uRes = await api.get('/auth/users')
        if (uRes?.users) {
          setUsersList(uRes.users)
          setStats(prev => ({ ...prev, totalUsers: uRes.users.length, activeUsers: uRes.users.filter(u => u.status === 'Active').length }))
        }
      } catch {
        const fallback = [
          { id: 1, name: 'Ankit Dey', email: 'ankitdey061@gmail.com', role: 'admin', department: 'Operations', status: 'Active', lastLogin: '2026-10-01' },
          { id: 2, name: 'Souvik Das', email: 'dasouvik122005@gmail.com', role: 'admin', department: 'Operations', status: 'Active', lastLogin: '2026-10-01' },
          { id: 3, name: 'Employee User 1', email: 'employee1@raillink.in', role: 'employee', department: 'Planning', status: 'Active', lastLogin: '2026-10-01' },
          { id: 4, name: 'Employee User 2', email: 'employee2@raillink.in', role: 'employee', department: 'Engineering', status: 'Active', lastLogin: '2026-10-01' },
        ]
        setUsersList(fallback)
        setStats(prev => ({ ...prev, totalUsers: fallback.length, activeUsers: fallback.length }))
      }

      // Load approved / published defects for Block & Crew Allocation
      try {
        let appList = []
        try {
          const dRes = await api.get('/defects')
          if (dRes && Array.isArray(dRes.defects)) {
            appList = dRes.defects
            setStats(prev => ({ ...prev, totalDefects: dRes.defects.length }))
          }
        } catch {
          try {
            const { data, count, error } = await supabase
              .from('defects')
              .select('*')
              .neq('status', 'Pending Approval')
              .neq('status', 'Rejected')
              .order('created_at', { ascending: false })
            if (!error && Array.isArray(data)) {
              appList = data
              if (count !== null && count !== undefined) setStats(prev => ({ ...prev, totalDefects: count }))
              else setStats(prev => ({ ...prev, totalDefects: data.length }))
            }
          } catch {}
        }

        const formattedApproved = (appList || []).map(d => {
          const rawWork = d.workRequired || d.work_required || d.description || ''
          let scheduledDate = d.scheduledDate || null
          let scheduledTime = d.scheduledTime || null
          let allocatedCrew = d.allocatedCrew || null
          let supervisor = d.supervisor || null

          if (rawWork && rawWork.startsWith('[Scheduled:')) {
            const match = rawWork.match(/^\[Scheduled:\s*([^|]+)\|\s*Crew:\s*([^|]+)\|\s*Lead:\s*([^\]]+)\]\s*(.*)$/s)
            if (match) {
              const schedPart = match[1].trim()
              const schedSplit = schedPart.split(' ')
              if (!scheduledDate) scheduledDate = schedSplit[0]
              if (!scheduledTime) scheduledTime = schedSplit.slice(1).join(' ')
              if (!allocatedCrew) allocatedCrew = match[2].trim()
              if (!supervisor) supervisor = match[3].trim()
            }
          }

          return {
            id: d.id,
            department: d.department || 'Engineering',
            division: d.section_id || d.corridor_name?.split('|')[0]?.trim() || d.division || 'Northern Railway — Delhi Division (DLI)',
            corridorName: d.corridor_name?.split('|')[1]?.trim() || d.corridor_name || d.section || 'Delhi - Agra Semi High-Speed Corridor',
            location: d.location || (d.corridor_name?.includes('—') ? d.corridor_name.split('—')[1]?.trim() : 'Mathura Section'),
            kmMarker: d.kmMarker || (d.km_start ? `KM ${d.km_start}` : 'KM 104.2'),
            trackType: d.track_type || d.trackType || 'Up Main Line',
            assetType: d.defect_category || d.defectCategory || d.assetType || 'Track Infrastructure',
            severity: d.severity || 'Medium',
            status: d.status || 'Pending Block',
            workRequired: rawWork,
            scheduledDate,
            scheduledTime,
            allocatedCrew,
            supervisor,
            photoUrl: d.photo_url || d.photoUrl || ''
          }
        })
        setApprovedDefects(formattedApproved)

        // If URL requested a specific defectId, automatically open the allocation modal
        if (initialDefectId) {
          const target = formattedApproved.find(d => d.id === initialDefectId)
          if (target) {
            handleOpenAllocationModal(target)
          }
        }
      } catch (appErr) {
        console.warn('Failed to load approved defects for allocation:', appErr)
      }

      // Load pending defects for approval queue
      try {
        let pending = []
        try {
          const pRes = await api.get('/defects?includePending=true&status=Pending Approval')
          if (pRes && Array.isArray(pRes.defects)) {
            pending = pRes.defects
          }
        } catch (apiErr) {
          console.warn('[Admin Pending API Warning]:', apiErr)
        }

        if (pending.length === 0) {
          try {
            const { data, error } = await supabase
              .from('defects')
              .select('*')
              .eq('status', 'Pending Approval')
              .order('created_at', { ascending: false })
            if (!error && Array.isArray(data)) {
              pending = data.map(d => ({
                id: d.id,
                department: d.department || 'Engineering',
                sourceSystem: d.source_system || 'TMS',
                division: d.section_id || d.corridor_name?.split('|')[0]?.trim() || 'Northern Railway — Delhi Division (DLI)',
                corridorName: d.corridor_name?.split('|')[1]?.trim() || d.corridor_name || 'Delhi - Agra Semi High-Speed Corridor',
                location: d.location || (d.corridor_name?.includes('—') ? d.corridor_name.split('—')[1]?.trim() : 'Mathura Section'),
                kmMarker: d.km_start ? `KM ${d.km_start}` : 'KM 104.2',
                trackType: d.track_type || 'Up Main Line',
                assetType: d.defect_category || 'Track Infrastructure',
                severity: d.severity || 'Medium',
                status: d.status || 'Pending Approval',
                workRequired: d.work_required || 'Field defect reported for block planning.',
                description: d.work_required || 'Field defect reported for block planning.',
                photoUrl: d.photo_url || '',
                reportedDate: d.reported_at ? d.reported_at.split('T')[0] : (d.created_at ? d.created_at.split('T')[0] : '2026-10-01'),
                aiConfidence: d.ai_confidence || '96.5%'
              }))
            }
          } catch (sbErr) {
            console.warn('[Admin Pending Supabase Warning]:', sbErr)
          }
        }

        setPendingDefects(pending)
      } catch (pErr) {
        console.warn('Failed to load pending defects:', pErr)
      }

      // Load plans count
      try {
        const pRes = await api.get('/plans')
        if (pRes && Array.isArray(pRes.plans)) {
          setStats(prev => ({ ...prev, totalPlans: pRes.plans.length }))
        }
      } catch {
        try {
          const { count } = await supabase.from('block_plans').select('*', { count: 'exact', head: true })
          if (count !== null && count !== undefined) setStats(prev => ({ ...prev, totalPlans: count }))
        } catch {}
      }

    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const [dbActionLoading, setDbActionLoading] = useState(false)
  const [dbMessage, setDbMessage] = useState(null)

  const handleApproveDefect = async (id) => {
    try {
      setActionLoadingId(id)
      try {
        await api.patch(`/defects/${id}/approve`, { status: 'Pending Block' })
      } catch (apiErr) {
        console.warn('[Approve API Warning]: Falling back to direct Supabase:', apiErr)
      }

      try {
        await supabase.from('defects').update({ status: 'Pending Block' }).eq('id', id)
      } catch (sbErr) {
        console.warn('[Approve Supabase Warning]:', sbErr)
      }

      setPendingDefects(prev => prev.filter(d => d.id !== id))
      setStats(prev => ({ ...prev, totalDefects: (prev.totalDefects || 0) + 1 }))
      setApprovalMessage({
        type: 'success',
        text: `✓ Defect ${id} approved & published! It is now publicly visible in the Defect Explorer and queued for corridor block planning.`
      })
      setTimeout(() => setApprovalMessage(null), 5000)
    } catch (err) {
      setApprovalMessage({ type: 'error', text: `Failed to approve defect ${id}: ${err.message}` })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRejectDefect = async (id) => {
    const reason = window.prompt(`Provide reason for rejecting defect ${id}:`, 'Unclear photograph / Duplicate issue / Insufficient evidence')
    if (reason === null) return

    try {
      setActionLoadingId(id)
      try {
        await api.patch(`/defects/${id}/reject`, { reason })
      } catch (apiErr) {
        console.warn('[Reject API Warning]: Falling back to direct Supabase:', apiErr)
      }

      try {
        await supabase.from('defects').update({ status: 'Rejected' }).eq('id', id)
      } catch (sbErr) {
        console.warn('[Reject Supabase Warning]:', sbErr)
      }

      setPendingDefects(prev => prev.filter(d => d.id !== id))
      setApprovalMessage({ type: 'info', text: `Defect ${id} marked as Rejected and archived (${reason}).` })
      setTimeout(() => setApprovalMessage(null), 5000)
    } catch (err) {
      setApprovalMessage({ type: 'error', text: `Failed to reject defect ${id}: ${err.message}` })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeletePendingDefect = async (defect) => {
    if (!window.confirm(`Permanently delete defect ${defect.id}?`)) return
    try {
      setActionLoadingId(defect.id)
      try { await api.delete(`/defects/${defect.id}`, { data: { photoUrl: defect.photoUrl } }) } catch {}
      try { await supabase.from('defects').delete().eq('id', defect.id) } catch {}
      setPendingDefects(prev => prev.filter(d => d.id !== defect.id))
      setApprovalMessage({ type: 'info', text: `Defect ${defect.id} permanently removed.` })
      setTimeout(() => setApprovalMessage(null), 4000)
    } catch (err) {
      setApprovalMessage({ type: 'error', text: `Failed to delete: ${err.message}` })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleOpenAllocationModal = (defect) => {
    setAllocatingDefect(defect)
    setAllocDate(defect.scheduledDate || new Date(Date.now() + 86400000).toISOString().split('T')[0])
    if (defect.scheduledTime && defect.scheduledTime.includes('-')) {
      const parts = defect.scheduledTime.split('-').map(s => s.trim())
      if (parts[0]) setAllocStartTime(parts[0])
      if (parts[1]) setAllocEndTime(parts[1])
    } else {
      setAllocStartTime('01:30')
      setAllocEndTime('04:30')
    }
    if (defect.allocatedCrew) setAllocCrew(defect.allocatedCrew)
    if (defect.supervisor) setAllocSupervisor(defect.supervisor)
  }

  const handleSaveAllocation = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!allocatingDefect) return
    setSavingAllocation(true)
    setAllocationMsg(null)
    try {
      const payload = {
        scheduledDate: allocDate,
        startTime: allocStartTime,
        endTime: allocEndTime,
        duration: allocDuration,
        allocatedCrew: allocCrew,
        supervisor: allocSupervisor,
        workersCount: allocWorkersCount,
        blockType: allocBlockType,
        machinery: allocMachinery
      }

      // 1. Call backend allocate endpoint
      try {
        await api.patch(`/defects/${allocatingDefect.id}/allocate`, payload)
      } catch (apiErr) {
        console.warn('[Allocate API Warning]: Falling back to direct Supabase:', apiErr)
      }

      // 2. Direct Supabase update (format structured work_required)
      const structuredHeader = `[Scheduled: ${allocDate} ${allocStartTime}-${allocEndTime} | Crew: ${allocCrew} | Lead: ${allocSupervisor}]`
      const existingWork = allocatingDefect.workRequired?.replace(/^\[Scheduled:[^\]]+\]\s*/, '') || allocatingDefect.description?.replace(/^\[Scheduled:[^\]]+\]\s*/, '') || ''
      const updatedWork = `${structuredHeader} ${existingWork}`.trim()

      try {
        await supabase
          .from('defects')
          .update({
            status: 'Scheduled Block',
            work_required: updatedWork
          })
          .eq('id', allocatingDefect.id)
      } catch (sbErr) {
        console.warn('[Allocate Supabase Warning]:', sbErr)
      }

      // Also create/update block_plans entry in Supabase
      try {
        await supabase
          .from('block_plans')
          .insert({
            title: `Curfew Block: ${allocatingDefect.id} (${allocCrew})`,
            corridor_id: allocatingDefect.corridorName || allocatingDefect.division,
            section: allocatingDefect.corridorName,
            track_type: allocatingDefect.trackType || 'Up Main Line',
            start_km: allocatingDefect.kmMarker || 'KM 0.0',
            end_km: allocatingDefect.kmMarker || 'KM 0.0',
            window_start: `${allocDate}T${allocStartTime}:00`,
            window_end: `${allocDate}T${allocEndTime}:00`,
            department: allocatingDefect.department || 'Engineering',
            status: 'Approved',
            source_system: 'TMS',
            defects_covered: [allocatingDefect.id],
            crew_name: allocCrew,
            supervisor_name: allocSupervisor
          })
      } catch (planErr) {
        console.warn('[Block Plan Insert Supabase]:', planErr)
      }

      // Update local state
      setApprovedDefects(prev => prev.map(d => {
        if (d.id === allocatingDefect.id) {
          return {
            ...d,
            status: 'Scheduled Block',
            scheduledDate: allocDate,
            scheduledTime: `${allocStartTime} - ${allocEndTime}`,
            allocatedCrew: allocCrew,
            supervisor: allocSupervisor,
            workRequired: updatedWork
          }
        }
        return d
      }))

      // If it was a pending defect, remove from pending
      setPendingDefects(prev => prev.filter(d => d.id !== allocatingDefect.id))

      setAllocationMsg({
        type: 'success',
        text: `✓ Corridor Block (${allocDate} ${allocStartTime}-${allocEndTime}) & ${allocCrew} allocated to defect ${allocatingDefect.id}!`
      })

      setTimeout(() => {
        setAllocatingDefect(null)
        setAllocationMsg(null)
      }, 1500)
    } catch (err) {
      setAllocationMsg({ type: 'error', text: `Failed to save allocation: ${err.message}` })
    } finally {
      setSavingAllocation(false)
    }
  }

  // Filtered Approved Defects for Allocation Tab
  const filteredApprovedDefects = approvedDefects.filter(d => {
    const isAllocated = !!(d.scheduledDate || d.allocatedCrew)
    if (allocFilter === 'PENDING' && isAllocated) return false
    if (allocFilter === 'SCHEDULED' && !isAllocated) return false

    const q = allocSearch.toLowerCase()
    if (!q) return true
    return (
      d.id.toLowerCase().includes(q) ||
      (d.division && d.division.toLowerCase().includes(q)) ||
      (d.corridorName && d.corridorName.toLowerCase().includes(q)) ||
      (d.location && d.location.toLowerCase().includes(q)) ||
      (d.allocatedCrew && d.allocatedCrew.toLowerCase().includes(q)) ||
      (d.supervisor && d.supervisor.toLowerCase().includes(q)) ||
      (d.assetType && d.assetType.toLowerCase().includes(q))
    )
  })

  const awaitingAllocationCount = approvedDefects.filter(d => !d.scheduledDate || !d.allocatedCrew).length

  const handleBatchApproveAll = async () => {
    if (pendingDefects.length === 0) return
    if (!window.confirm(`Approve and publish ALL ${pendingDefects.length} pending defects to the public registry?`)) return
    setBatchProcessing(true)
    try {
      const ids = pendingDefects.map(d => d.id)
      for (const id of ids) {
        try { await api.patch(`/defects/${id}/approve`, { status: 'Pending Block' }) } catch {}
      }
      try {
        await supabase.from('defects').update({ status: 'Pending Block' }).in('id', ids)
      } catch {}
      setStats(prev => ({ ...prev, totalDefects: (prev.totalDefects || 0) + ids.length }))
      setPendingDefects([])
      setApprovalMessage({ type: 'success', text: `✓ Successfully approved and published all ${ids.length} defects!` })
      setTimeout(() => setApprovalMessage(null), 5000)
    } catch (err) {
      setApprovalMessage({ type: 'error', text: `Batch approve error: ${err.message}` })
    } finally {
      setBatchProcessing(false)
    }
  }

  const filteredPendingDefects = pendingDefects.filter(d => {
    const matchDept = pendingDeptFilter === 'ALL' || (d.department && d.department.toLowerCase().includes(pendingDeptFilter.toLowerCase()))
    const q = pendingSearch.toLowerCase()
    const matchSearch = !q ||
      d.id.toLowerCase().includes(q) ||
      (d.division && d.division.toLowerCase().includes(q)) ||
      (d.corridorName && d.corridorName.toLowerCase().includes(q)) ||
      (d.location && d.location.toLowerCase().includes(q)) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      (d.assetType && d.assetType.toLowerCase().includes(q))
    return matchDept && matchSearch
  })

  const handleAdminClearDefects = async () => {
    if (!window.confirm('Wipe ALL defects from Supabase? This will set defect count to 0.')) return
    setDbActionLoading(true)
    try {
      try { await api.delete('/defects') } catch {}
      await supabase.from('defects').delete().neq('id', '___PURGE___')
      setDbMessage('✓ Defects table cleared to 0 rows in Supabase.')
      await loadData()
    } catch (err) {
      setDbMessage('Error clearing defects: ' + err.message)
    } finally {
      setDbActionLoading(false)
      setTimeout(() => setDbMessage(null), 4000)
    }
  }

  const handleAdminClearPlans = async () => {
    if (!window.confirm('Wipe ALL block plans from Supabase? This will set plans count to 0.')) return
    setDbActionLoading(true)
    try {
      try { await api.delete('/plans') } catch {}
      await supabase.from('block_plans').delete().neq('id', '___PURGE___')
      setDbMessage('✓ Block plans table cleared to 0 rows in Supabase.')
      await loadData()
    } catch (err) {
      setDbMessage('Error clearing plans: ' + err.message)
    } finally {
      setDbActionLoading(false)
      setTimeout(() => setDbMessage(null), 4000)
    }
  }

  useEffect(() => {
    loadData()
    loadAiStatus()

    const channel = supabase
      .channel('admin-defects-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'defects' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return { bg: 'rgba(228, 164, 189, 0.18)', color: 'var(--accent)' }
      case 'employee': return { bg: 'rgba(126, 196, 207, 0.18)', color: 'var(--dept-snt)' }
      default: return { bg: 'rgba(150,150,150,0.15)', color: 'var(--text-muted)' }
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'System Admin'
      case 'employee': return 'Employee'
      default: return role
    }
  }

  const overviewCards = [
    {
      label: 'Pending Approvals',
      value: pendingDefects.length,
      icon: Clock,
      color: pendingDefects.length > 0 ? 'var(--accent)' : 'var(--status-healthy)',
      trend: pendingDefects.length > 0 ? 'Worker reports require admin review' : 'All defect reports verified',
      badge: pendingDefects.length > 0 ? 'ACTION NEEDED' : 'CLEAR',
      onClick: () => setActiveTab('approvals')
    },
    {
      label: 'Block & Crew Allocation',
      value: awaitingAllocationCount,
      icon: Wrench,
      color: awaitingAllocationCount > 0 ? 'var(--dept-conflict)' : 'var(--status-healthy)',
      trend: `${approvedDefects.length - awaitingAllocationCount} blocks scheduled & crews deployed`,
      badge: awaitingAllocationCount > 0 ? 'AWAITING SLOTS' : 'ALLOCATED',
      onClick: () => setActiveTab('allocations')
    },
    {
      label: 'Public Defects',
      value: stats.totalDefects || 0,
      icon: BarChart3,
      color: 'var(--dept-snt)',
      trend: 'Visible across corridors without login',
      onClick: () => setActiveTab('allocations')
    },
    {
      label: 'Total Users',
      value: stats.totalUsers || 4,
      icon: Users,
      color: 'var(--text-primary)',
      trend: `${stats.activeUsers || 4} active sessions`,
      onClick: () => setActiveTab('users')
    },
  ]

  const permissions = [
    { role: 'Admin', features: ['Full system access', 'User management', 'Role configuration', 'System settings'], color: 'var(--accent)' },
    { role: 'Planner', features: ['Block plan creation', 'AI Studio access', 'Analytics Hub', 'Corridor Map view'], color: 'var(--dept-snt)' },
    { role: 'TMS Engg', features: ['Defect submission', 'Track defect view', 'Block plan view', 'Corridor Map view'], color: 'var(--dept-engg)' },
    { role: 'SMMS S&T', features: ['Signal defect view', 'Defect submission', 'Block plan view', 'Limited analytics'], color: 'var(--dept-trd)' },
  ]

  return (
    <div style={{ padding: 'var(--space-2xl) var(--space-xl)', maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <RevealWrapper>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-xs)' }}>
              <span className="badge" style={{ background: 'rgba(228, 164, 189, 0.15)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                SYSTEM GOVERNANCE
              </span>
              <span className="badge" style={{ background: 'rgba(109, 184, 123, 0.15)', color: 'var(--status-healthy)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={11} /> SECURED
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Admin <span style={{ color: 'var(--accent)' }}>Panel</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', marginTop: 'var(--space-xs)', fontSize: '1rem' }}>
              Manage system users, approve worker defect submissions, configure role permissions, AI engines & redirection settings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { loadData(); loadAiStatus() }}
              disabled={refreshing}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

          </div>
        </div>
      </RevealWrapper>

      {/* Tabs */}
      <RevealWrapper delay={0.1}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-sm) var(--space-md)',
          display: 'flex',
          gap: '8px',
          marginBottom: 'var(--space-xl)',
          border: '1px solid var(--border)',
          overflowX: 'auto'
        }}>
          {[
            { key: 'overview', label: 'System Overview', icon: BarChart3 },
            {
              key: 'approvals',
              label: 'Pending Approvals',
              icon: Clock,
              badge: pendingDefects.length > 0 ? pendingDefects.length : null
            },
            {
              key: 'allocations',
              label: 'Block & Worker Allocation',
              icon: Wrench,
              badge: awaitingAllocationCount > 0 ? awaitingAllocationCount : null
            },
            { key: 'users', label: `User Roles & RBAC (${usersList.length})`, icon: Users },
            { key: 'permissions', label: 'Access Matrix', icon: Lock },
            { key: 'settings', label: 'Settings & Redirection', icon: Settings },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: activeTab === tab.key ? 'var(--text-primary)' : 'transparent',
                color: activeTab === tab.key ? 'var(--bg-primary)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
              {tab.badge ? (
                <span style={{
                  background: activeTab === tab.key ? 'var(--accent)' : 'var(--dept-conflict)',
                  color: activeTab === tab.key ? 'var(--bg-primary)' : '#fff',
                  borderRadius: '10px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  fontWeight: 900
                }}>
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </RevealWrapper>

      {/* Tab: System Overview */}
      {activeTab === 'overview' && (
        <RevealWrapper delay={0.2}>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
            {overviewCards.map((card, i) => (
              <motion.div
                key={card.label}
                onClick={card.onClick}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card"
                style={{ padding: 'var(--space-xl)', cursor: card.onClick ? 'pointer' : 'default' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-card)', background: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <card.icon size={20} color={card.color} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: card.color, background: `${card.color}15`, padding: '3px 8px', borderRadius: 'var(--radius-xs)' }}>
                    {card.badge || 'LIVE'}
                  </span>
                </div>
                <p style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{card.value}</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{card.label}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{card.trend}</p>
              </motion.div>
            ))}
          </div>

          {/* Supabase Live Database Governance & Sync Controls */}
          <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-card)', background: 'rgba(109, 184, 123, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={20} color="var(--status-healthy)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Supabase Database Synchronization</h3>
                    <span className="badge" style={{ background: 'rgba(109, 184, 123, 0.15)', color: 'var(--status-healthy)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={11} /> Connected & Realtime Active
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Inspect live PostgreSQL table records, test real-time data sync, and perform database maintenance.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAdminClearDefects}
                  disabled={dbActionLoading}
                  className="btn btn-secondary"
                  style={{ color: 'var(--dept-conflict)', borderColor: 'rgba(201, 79, 79, 0.35)', padding: '8px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={13} color="var(--dept-conflict)" />
                  <span>Clear Defects ({stats.totalDefects})</span>
                </button>
                <button
                  onClick={handleAdminClearPlans}
                  disabled={dbActionLoading}
                  className="btn btn-secondary"
                  style={{ color: 'var(--dept-conflict)', borderColor: 'rgba(201, 79, 79, 0.35)', padding: '8px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={13} color="var(--dept-conflict)" />
                  <span>Clear Block Plans ({stats.totalPlans})</span>
                </button>
                <button
                  onClick={loadData}
                  disabled={refreshing}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                  <span>Sync DB Counts</span>
                </button>
              </div>
            </div>

            {dbMessage && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(109, 184, 123, 0.12)', border: '1px solid rgba(109, 184, 123, 0.3)', color: 'var(--status-healthy)', fontWeight: 700, fontSize: '0.82rem', marginTop: '10px' }}>
                {dbMessage}
              </div>
            )}
          </div>

          {/* Platform Activity */}
          <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-lg)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-card)', background: 'rgba(228, 164, 189, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Platform Activity</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Recent system events and user actions</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { event: 'Block plan approved', user: 'Priya Sharma', time: '5 min ago', type: 'success' },
                { event: 'New defect submitted via TMS', user: 'Vikram Singh', time: '18 min ago', type: 'info' },
                { event: 'AI Studio plan generated', user: 'Priya Sharma', time: '42 min ago', type: 'ai' },
                { event: 'Corridor Map sync completed', user: 'System', time: '1 hr ago', type: 'success' },
                { event: 'User login — SMMS S&T role', user: 'Anita Patel', time: '2 hrs ago', type: 'info' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: item.type === 'success' ? 'var(--status-healthy)' : item.type === 'ai' ? 'var(--accent)' : 'var(--dept-snt)'
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.event}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>by {item.user}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{item.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </RevealWrapper>
      )}

      {/* Tab: Pending Approvals Queue */}
      {activeTab === 'approvals' && (
        <RevealWrapper delay={0.2}>
          <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-2xl)', border: '1px solid var(--border)' }}>
            {/* Queue Header & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge" style={{ background: 'rgba(228, 164, 189, 0.2)', color: 'var(--accent)', fontWeight: 800 }}>
                    TWO-STAGE DEFECT GOVERNANCE
                  </span>
                  <span className="badge" style={{ background: 'rgba(109, 184, 123, 0.15)', color: 'var(--status-healthy)' }}>
                    Ollama Gemma 4 Pre-Screened
                  </span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  Worker Defect Verification & Approval Queue
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, maxWidth: '750px', lineHeight: 1.5 }}>
                  Field issues submitted by track maintainers and inspectors are quarantined here until approved. Review photographic evidence and AI verification classifications before publishing to the public Defect Explorer and corridor block plans.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {pendingDefects.length > 0 && (
                  <button
                    onClick={handleBatchApproveAll}
                    disabled={batchProcessing}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', fontSize: '0.82rem' }}
                  >
                    {batchProcessing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>Approve All ({pendingDefects.length})</span>
                  </button>
                )}
                <button
                  onClick={loadData}
                  disabled={refreshing}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '0.82rem' }}
                >
                  <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>

            {/* Notification alert banner */}
            {approvalMessage && (
              <div style={{
                padding: '12px 18px',
                borderRadius: '8px',
                marginBottom: 'var(--space-lg)',
                background: approvalMessage.type === 'success' ? 'rgba(109, 184, 123, 0.15)' : 'rgba(228, 164, 189, 0.15)',
                border: `1px solid ${approvalMessage.type === 'success' ? 'rgba(109, 184, 123, 0.35)' : 'rgba(228, 164, 189, 0.35)'}`,
                color: approvalMessage.type === 'success' ? 'var(--status-healthy)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={16} color="var(--status-healthy)" />
                <span>{approvalMessage.text}</span>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
              padding: '12px 16px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--border)',
              marginBottom: 'var(--space-lg)'
            }}>
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by ID, corridor, location, or issue..."
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  className="input"
                  style={{ width: '100%', paddingLeft: '36px', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Department:</span>
                {['ALL', 'Engineering', 'Signal & Telecom', 'Traction Distribution'].map(dept => (
                  <button
                    key={dept}
                    onClick={() => setPendingDeptFilter(dept)}
                    className="btn btn-secondary"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      background: pendingDeptFilter === dept ? 'var(--text-primary)' : 'transparent',
                      color: pendingDeptFilter === dept ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      borderColor: pendingDeptFilter === dept ? 'transparent' : 'var(--border)'
                    }}
                  >
                    {dept === 'ALL' ? 'All Departments' : dept.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Pending Cards or Empty State */}
            {filteredPendingDefects.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-3xl) var(--space-xl)',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-card)',
                border: '1px dashed var(--border)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(109, 184, 123, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={32} color="var(--status-healthy)" />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                  {pendingDefects.length === 0 ? 'No Defects Pending Approval' : 'No Defects Match Your Filter'}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
                  {pendingDefects.length === 0
                    ? 'All field defect submissions have been reviewed and approved. When workers report new issues from the Defect Portal, they will appear here in real-time.'
                    : 'Try clearing your search query or department filter to view other pending reports.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                {filteredPendingDefects.map((defect) => (
                  <motion.div
                    key={defect.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-card)',
                      border: '1px solid var(--border)',
                      padding: 'var(--space-lg)',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(220px, 280px) 1fr',
                      gap: 'var(--space-lg)',
                      alignItems: 'stretch'
                    }}
                  >
                    {/* Left: Photo with click-to-preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div
                        onClick={() => setPreviewPhoto(defect.photoUrl)}
                        style={{
                          position: 'relative',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          height: '180px',
                          background: 'var(--bg-secondary)',
                          cursor: 'pointer',
                          border: '1px solid var(--border)'
                        }}
                        title="Click to view full photo"
                      >
                        {defect.photoUrl ? (
                          <img
                            src={defect.photoUrl}
                            alt={defect.id}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            No Photo Uploaded
                          </div>
                        )}
                        <div style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Eye size={11} /> Expand Photo
                        </div>
                      </div>

                      {/* Ollama AI Verification Tag */}
                      <div style={{
                        padding: '8px 12px',
                        background: 'rgba(228, 164, 189, 0.1)',
                        border: '1px solid rgba(228, 164, 189, 0.3)',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={11} /> Ollama Gemma 4
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--status-healthy)' }}>
                            {defect.aiConfidence || '96.5%'} Confidence
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {defect.aiDefectType || defect.assetType || 'Railway Track Defect'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Defect metadata and Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
                      <div>
                        {/* Top row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent)' }}>
                              {defect.id}
                            </span>
                            <span className="badge" style={{
                              background: defect.severity === 'Critical' ? 'rgba(201, 79, 79, 0.2)' : defect.severity === 'High' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(109, 184, 123, 0.15)',
                              color: defect.severity === 'Critical' ? 'var(--dept-conflict)' : defect.severity === 'High' ? '#f59e0b' : 'var(--status-healthy)',
                              fontWeight: 800
                            }}>
                              {defect.severity} Priority
                            </span>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                              {defect.department}
                            </span>
                          </div>

                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> Reported {defect.reportedDate || 'Today'}
                          </span>
                        </div>

                        {/* Location and Track details */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Division:</strong> {defect.division}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Corridor:</strong> {defect.corridorName || defect.section}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Location:</strong> {defect.location} ({defect.kmMarker})
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Track:</strong> {defect.trackType}
                          </div>
                        </div>

                        {/* Description */}
                        <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                            WORK REQUIRED / INSPECTION NOTES:
                          </span>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                            {defect.description || defect.workRequired || 'Field report awaiting safety verification.'}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Approving publishes this defect to the public explorer & activates corridor block protection.
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleDeletePendingDefect(defect)}
                            disabled={actionLoadingId === defect.id}
                            className="btn btn-secondary"
                            title="Delete permanently"
                            style={{ padding: '8px 12px', fontSize: '0.78rem', color: 'var(--dept-conflict)', borderColor: 'rgba(201, 79, 79, 0.3)' }}
                          >
                            <Trash2 size={13} />
                          </button>

                          <button
                            onClick={() => handleRejectDefect(defect.id)}
                            disabled={actionLoadingId === defect.id}
                            className="btn btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <XCircle size={13} color="var(--dept-conflict)" />
                            <span>Reject Issue</span>
                          </button>

                          <button
                            onClick={async () => {
                              await handleApproveDefect(defect.id)
                              handleOpenAllocationModal(defect)
                            }}
                            disabled={actionLoadingId === defect.id}
                            className="btn btn-secondary"
                            style={{
                              padding: '8px 16px',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              borderColor: 'rgba(228, 164, 189, 0.5)',
                              color: 'var(--accent)',
                              fontWeight: 700
                            }}
                            title="Approve defect and open Block & Crew Allocation modal immediately"
                          >
                            <Wrench size={13} color="var(--accent)" />
                            <span>Approve & Allocate Block</span>
                          </button>

                          <button
                            onClick={() => handleApproveDefect(defect.id)}
                            disabled={actionLoadingId === defect.id}
                            className="btn btn-primary"
                            style={{ padding: '8px 20px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderColor: '#22c55e', color: '#fff' }}
                          >
                            {actionLoadingId === defect.id ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                            <span>Approve & Publish</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </RevealWrapper>
      )}

      {/* Tab: Block & Worker Allocation */}
      {activeTab === 'allocations' && (
        <RevealWrapper delay={0.2}>
          <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-2xl)', border: '1px solid var(--border)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge" style={{ background: 'rgba(228, 164, 189, 0.2)', color: 'var(--accent)', fontWeight: 800 }}>
                    ADMIN CORRIDOR TRAFFIC CONTROL
                  </span>
                  <span className="badge" style={{ background: 'rgba(109, 184, 123, 0.15)', color: 'var(--status-healthy)' }}>
                    {approvedDefects.length} Approved Registry Defects
                  </span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  Block Plan & Worker Maintenance Gang Allocation
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
                  Only System Administrators have authorization to schedule traffic curfews, designate line possession time slots, and assign maintenance gangs, supervisors, and heavy machinery to approved defects. Allocations are synchronized to both the public Defect Explorer and corridor block plans.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={loadData}
                  disabled={refreshing}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '0.82rem' }}
                >
                  <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                  <span>Refresh Allocations</span>
                </button>
              </div>
            </div>

            {/* Notification alert banner */}
            {allocationMsg && (
              <div style={{
                padding: '12px 18px',
                borderRadius: '8px',
                marginBottom: 'var(--space-lg)',
                background: allocationMsg.type === 'success' ? 'rgba(109, 184, 123, 0.15)' : 'rgba(228, 164, 189, 0.15)',
                border: `1px solid ${allocationMsg.type === 'success' ? 'rgba(109, 184, 123, 0.35)' : 'rgba(228, 164, 189, 0.35)'}`,
                color: allocationMsg.type === 'success' ? 'var(--status-healthy)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={16} color="var(--status-healthy)" />
                <span>{allocationMsg.text}</span>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
              padding: '12px 16px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--border)',
              marginBottom: 'var(--space-lg)'
            }}>
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by defect ID, corridor, location, crew, or supervisor..."
                  value={allocSearch}
                  onChange={(e) => setAllocSearch(e.target.value)}
                  className="input"
                  style={{ width: '100%', paddingLeft: '36px', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Filter:</span>
                {[
                  { key: 'ALL', label: `All Approved (${approvedDefects.length})` },
                  { key: 'PENDING', label: `Awaiting Allocation (${awaitingAllocationCount})` },
                  { key: 'SCHEDULED', label: `Scheduled & Deployed (${approvedDefects.length - awaitingAllocationCount})` }
                ].map(flt => (
                  <button
                    key={flt.key}
                    onClick={() => setAllocFilter(flt.key)}
                    className="btn btn-secondary"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      background: allocFilter === flt.key ? 'var(--text-primary)' : 'transparent',
                      color: allocFilter === flt.key ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      borderColor: allocFilter === flt.key ? 'transparent' : 'var(--border)'
                    }}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List / Table of Approved Defects for Allocation */}
            {filteredApprovedDefects.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-3xl) var(--space-xl)',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-card)',
                border: '1px dashed var(--border)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(109, 184, 123, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={32} color="var(--status-healthy)" />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                  {allocFilter === 'PENDING' ? 'All Approved Defects are Allocated' : 'No Defects Match Your Filter'}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
                  {allocFilter === 'PENDING'
                    ? 'Every approved defect currently has a scheduled traffic curfew window and designated maintenance crew.'
                    : 'Try clearing your search query or switching tabs.'}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 10px' }}>DEFECT ID</th>
                      <th style={{ padding: '12px 10px' }}>LOCATION & CORRIDOR</th>
                      <th style={{ padding: '12px 10px' }}>ASSET & SEVERITY</th>
                      <th style={{ padding: '12px 10px' }}>SCHEDULED BLOCK WINDOW</th>
                      <th style={{ padding: '12px 10px' }}>ALLOCATED CREW & LEAD</th>
                      <th style={{ padding: '12px 10px' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApprovedDefects.map((d) => {
                      const isAllocated = !!(d.scheduledDate || d.allocatedCrew)
                      return (
                        <tr
                          key={d.id}
                          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                          className="table-row-hover"
                        >
                          <td style={{ padding: '14px 10px', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--accent)' }}>{d.id}</div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.department}</span>
                          </td>

                          <td style={{ padding: '14px 10px', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{d.location}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {d.corridorName} · {d.kmMarker} ({d.trackType})
                            </div>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(228, 164, 189, 0.1)',
                              color: 'var(--accent)',
                              marginTop: '4px'
                            }}>
                              <MapPin size={10} /> {d.division}
                            </span>
                          </td>

                          <td style={{ padding: '14px 10px', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{d.assetType}</div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                              <span className="badge" style={{
                                background: d.severity === 'Critical' ? 'rgba(201, 79, 79, 0.2)' : d.severity === 'High' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(109, 184, 123, 0.15)',
                                color: d.severity === 'Critical' ? 'var(--dept-conflict)' : d.severity === 'High' ? '#f59e0b' : 'var(--status-healthy)',
                                fontSize: '10px',
                                fontWeight: 800
                              }}>
                                {d.severity}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.status}</span>
                            </div>
                          </td>

                          <td style={{ padding: '14px 10px', verticalAlign: 'top' }}>
                            {d.scheduledDate ? (
                              <div style={{ background: 'rgba(228, 164, 189, 0.1)', border: '1px solid rgba(228, 164, 189, 0.3)', borderRadius: '6px', padding: '6px 10px', display: 'inline-block' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent)' }}>
                                  <Clock size={12} />
                                  <span>{d.scheduledDate}</span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                                  Slot: {d.scheduledTime || 'Curfew Block'}
                                </div>
                              </div>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'rgba(245, 158, 11, 0.12)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 700
                              }}>
                                <AlertTriangle size={11} /> Unallocated Block
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '14px 10px', verticalAlign: 'top' }}>
                            {d.allocatedCrew ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 800 }}>
                                  <Wrench size={12} color="var(--accent)" />
                                  <span>{d.allocatedCrew}</span>
                                </div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Supervisor: {d.supervisor || 'SSE In-Charge'}
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                No maintenance gang assigned
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '14px 10px', verticalAlign: 'top' }}>
                            <button
                              onClick={() => handleOpenAllocationModal(d)}
                              className="btn btn-primary"
                              style={{
                                padding: '7px 14px',
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Wrench size={12} />
                              <span>{isAllocated ? 'Edit Allocation' : 'Allocate Block & Crew'}</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </RevealWrapper>
      )}

      {/* Tab: User Roles & RBAC */}
      {activeTab === 'users' && (
        <RevealWrapper delay={0.2}>
          <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0' }}>User Roles & Department Permissions</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                  Manage role-based access control (RBAC) across departments and planning divisions.
                </p>
              </div>
              <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} /> Add User
              </button>
            </div>

            {/* User Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-md)' }}>
              {usersList.map((u, i) => {
                const roleStyle = getRoleColor(u.role)
                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      background: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-card)',
                      border: '1px solid var(--border)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: 'var(--radius-card)',
                          background: `${roleStyle.bg}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '1.1rem', color: roleStyle.color
                        }}>
                          {u.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0 }}>{u.name}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{u.email}</p>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: 'var(--radius-xs)',
                        background: roleStyle.bg, color: roleStyle.color, textTransform: 'uppercase'
                      }}>
                        {getRoleLabel(u.role)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <span>Dept: <strong style={{ color: 'var(--text-primary)' }}>{u.department}</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-healthy)' }}>
                        <CheckCircle2 size={12} /> {u.status || 'Active'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: '7px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Edit3 size={12} /> Edit Role
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--dept-snt)' }}>
                        <Eye size={12} /> Activity
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </RevealWrapper>
      )}

      {/* Tab: Access Matrix */}
      {activeTab === 'permissions' && (
        <RevealWrapper delay={0.2}>
          <div className="card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0' }}>Role Access Matrix</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                Feature-level permissions granted to each system role across the RailLink platform.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
              {permissions.map((perm, i) => (
                <motion.div
                  key={perm.role}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-card)',
                    border: '1px solid var(--border)',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-card)', background: `${perm.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={18} color={perm.color} />
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: perm.color }}>{perm.role}</h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {perm.features.map(feat => (
                      <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem' }}>
                        <CheckCircle2 size={14} color="var(--status-healthy)" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Role Assignment Legend */}
            <div style={{ marginTop: 'var(--space-xl)', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Sparkles size={16} color="var(--accent)" />
                <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>RBAC Governance Note</p>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Role assignments are enforced on both the client and server layers. All data mutations (block plan approvals, defect status changes) require appropriate role clearance and are fully audit-logged.
              </p>
            </div>
          </div>
        </RevealWrapper>
      )}

      {/* Tab: System & AI Settings */}
      {activeTab === 'settings' && (
        <RevealWrapper delay={0.2}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>

            {/* AI Engine Configuration (Ollama Gemma 4) */}
            <div className="card" style={{ padding: 'var(--space-xl)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-card)', background: 'rgba(228, 164, 189, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={22} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>AI Intelligence Engine (Ollama Gemma 4)</h3>
                      <span className="badge" style={{
                        background: aiStatus?.configured ? 'rgba(109, 184, 123, 0.15)' : 'rgba(228, 164, 189, 0.15)',
                        color: aiStatus?.configured ? 'var(--status-healthy)' : 'var(--accent)',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircle2 size={11} /> {aiStatus?.configured ? `Active: Ollama (${aiStatus?.model || 'gemma4'})` : 'Local Fallback'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Powers defect photo authenticity verification and AI schedule optimization exclusively using Ollama Gemma 4.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
                  <strong style={{ fontSize: '0.85rem', color: aiStatus?.status === 'Ready' ? 'var(--status-healthy)' : 'var(--dept-trd)' }}>
                    {aiStatus?.status || 'Ready'}
                  </strong>
                </div>
              </div>

              <form onSubmit={handleSaveAiConfig} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Ollama API Key (https://ollama.com)
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={ollamaKey}
                      onChange={(e) => setOllamaKey(e.target.value)}
                      placeholder="Optional — enter your remote Ollama bearer key"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Passed as Authorization: Bearer header to your Ollama cloud or proxy endpoint.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Ollama Endpoint / Base URL
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={ollamaBaseUrl}
                      onChange={(e) => setOllamaBaseUrl(e.target.value)}
                      placeholder="https://ollama.com or http://localhost:11434"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Default: https://ollama.com (or local http://localhost:11434)
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Ollama Model
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      placeholder="gemma4"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Target model tag (e.g. gemma4, gemma4:31b)
                    </span>
                  </div>
                </div>

                {aiSaveMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: aiSaveMsg.type === 'success' ? 'rgba(109, 184, 123, 0.12)' : 'rgba(201, 79, 79, 0.12)',
                    border: `1px solid ${aiSaveMsg.type === 'success' ? 'rgba(109, 184, 123, 0.3)' : 'rgba(201, 79, 79, 0.3)'}`,
                    color: aiSaveMsg.type === 'success' ? 'var(--status-healthy)' : 'var(--dept-conflict)',
                    fontWeight: 700,
                    fontSize: '0.82rem'
                  }}>
                    {aiSaveMsg.text}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-xs)' }}>
                  <button
                    type="submit"
                    disabled={savingAi}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
                  >
                    {savingAi ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{savingAi ? 'Saving & Testing...' : 'Save AI Configuration'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Supabase URL Configuration & Redirection Guide */}
            <div className="card" style={{ padding: 'var(--space-xl)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-md)' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-card)', background: 'rgba(126, 196, 207, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={22} color="var(--dept-snt)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    Supabase Authentication & Redirect URL Guide
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Follow these steps to configure production redirection in the Supabase Dashboard so users redirect properly after sign-in.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px 0' }}>Open Supabase URL Configuration</h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>Supabase Dashboard</a> &rarr; Select your Project &rarr; Click <strong>Authentication</strong> in the left sidebar &rarr; Select <strong>URL Configuration</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>
                    2
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px 0' }}>Set Site URL</h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                      Under <strong>Site URL</strong>, set your primary Render production domain:
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '520px' }}>
                      <code style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700 }}>
                        https://raillink.onrender.com
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('https://raillink.onrender.com', 'site-url')}
                        className="btn btn-secondary"
                        style={{ padding: '7px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {copiedUrl === 'site-url' ? <Check size={13} color="var(--status-healthy)" /> : <Copy size={13} />}
                        <span>{copiedUrl === 'site-url' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>
                    3
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px 0' }}>Add Redirect URLs (Wildcards)</h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                      Under <strong>Redirect URLs</strong>, click <em>Add URL</em> and add each of the following patterns so that both Render and local development authentication callbacks are whitelisted:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '560px' }}>
                      {[
                        { url: 'https://raillink.onrender.com/**', id: 'redir-render-wildcard', desc: 'Render Production Wildcard' },
                        { url: 'https://raillink.onrender.com/login', id: 'redir-render-login', desc: 'Render Direct Login' },
                        { url: 'http://localhost:5173/**', id: 'redir-local-vite', desc: 'Vite Local Development' },
                        { url: 'http://localhost:3001/**', id: 'redir-local-server', desc: 'Node Express Server' },
                      ].map((item) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ flex: 1, padding: '7px 12px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {item.url}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.url, item.id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {copiedUrl === item.id ? <Check size={12} color="var(--status-healthy)" /> : <Copy size={12} />}
                            <span>{copiedUrl === item.id ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--status-healthy)', color: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>
                    ✓
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px 0' }}>Save Changes</h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Click <strong>Save</strong> at the bottom of the Supabase URL Configuration page. Your users will now seamlessly authenticate on Render without any redirection mismatch errors!
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </RevealWrapper>
      )}

      {/* Lightbox Photo Preview Modal */}
      {/* Block & Worker Allocation Modal */}
      {allocatingDefect && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-md)'
          }}
          onClick={() => setAllocatingDefect(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{
              width: '100%',
              maxWidth: '680px',
              background: 'var(--bg-primary)',
              padding: 'var(--space-2xl)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span className="badge" style={{ background: 'rgba(228, 164, 189, 0.2)', color: 'var(--accent)', fontWeight: 800 }}>
                    ADMIN WORKFLOW
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)' }}>{allocatingDefect.id}</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0 }}>
                  Allocate Corridor Block & Maintenance Gang
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Assign traffic curfew time slot, gang personnel, SSE supervisor, and machinery.
                </p>
              </div>
              <button onClick={() => setAllocatingDefect(null)} className="btn-icon" style={{ border: 'none', background: 'var(--bg-secondary)' }}>
                ✕
              </button>
            </div>

            {/* Target Defect Context Card */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: 'var(--space-lg)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '8px',
              fontSize: '0.8rem'
            }}>
              <div>
                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>ASSET & SEVERITY</strong>
                <span style={{ fontWeight: 800 }}>{allocatingDefect.assetType} ({allocatingDefect.severity})</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>LOCATION / KM</strong>
                <span style={{ fontWeight: 700 }}>{allocatingDefect.location} ({allocatingDefect.kmMarker})</span>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>CORRIDOR / LINE</strong>
                <span style={{ fontWeight: 700 }}>{allocatingDefect.corridorName} ({allocatingDefect.trackType})</span>
              </div>
            </div>

            {/* Allocation Form */}
            <form onSubmit={handleSaveAllocation} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {/* Row 1: Date & Curfew Type */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    SCHEDULED BLOCK DATE *
                  </label>
                  <input
                    type="date"
                    required
                    value={allocDate}
                    onChange={(e) => setAllocDate(e.target.value)}
                    className="input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    CURFEW BLOCK TYPE *
                  </label>
                  <select
                    value={allocBlockType}
                    onChange={(e) => setAllocBlockType(e.target.value)}
                    className="input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="Night Shadow Curfew (01:30 - 04:30)">Night Shadow Curfew (01:30 - 04:30)</option>
                    <option value="Full Track Curfew (Bidirectional)">Full Track Curfew (Bidirectional)</option>
                    <option value="Turnout Point Interlocking Curfew">Turnout Point Interlocking Curfew</option>
                    <option value="OHE Power De-energization Block">OHE Power De-energization Block</option>
                    <option value="Emergency Urgent Track Curfew">Emergency Urgent Track Curfew</option>
                    <option value="Rolling Maintenance Window">Rolling Maintenance Window</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Time Window & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    START TIME *
                  </label>
                  <input
                    type="time"
                    required
                    value={allocStartTime}
                    onChange={(e) => setAllocStartTime(e.target.value)}
                    className="input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    END TIME *
                  </label>
                  <input
                    type="time"
                    required
                    value={allocEndTime}
                    onChange={(e) => setAllocEndTime(e.target.value)}
                    className="input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    DURATION
                  </label>
                  <input
                    type="text"
                    value={allocDuration}
                    onChange={(e) => setAllocDuration(e.target.value)}
                    placeholder="e.g. 3h 00m"
                    className="input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Row 3: Assigned Crew & Gang */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  ASSIGNED MAINTENANCE GANG / SQUAD *
                </label>
                <select
                  value={allocCrew}
                  onChange={(e) => setAllocCrew(e.target.value)}
                  className="input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="Track Gang #04 (PW Heavy Section)">Track Gang #04 (PW Heavy Section)</option>
                  <option value="Track Maintenance Squad #12 (NDLS Yard)">Track Maintenance Squad #12 (NDLS Yard)</option>
                  <option value="S&T Signal Relay & Interlocking Gang #03">S&T Signal Relay & Interlocking Gang #03</option>
                  <option value="TRD OHE Overhead Wire Inspection Crew #08">TRD OHE Overhead Wire Inspection Crew #08</option>
                  <option value="Bridge & Heavy Structural Gang #01">Bridge & Heavy Structural Gang #01</option>
                  <option value="Rapid Response Mechanized Squad #05">Rapid Response Mechanized Squad #05</option>
                  <option value="Points & Crossing Mechanized Gang #07">Points & Crossing Mechanized Gang #07</option>
                </select>
              </div>

              {/* Row 4: Supervisor & Worker Count */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    SUPERVISOR / SSE IN-CHARGE *
                  </label>
                  <input
                    type="text"
                    required
                    value={allocSupervisor}
                    onChange={(e) => setAllocSupervisor(e.target.value)}
                    placeholder="e.g. R.K. Sharma (SSE/PW)"
                    className="input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-muted)' }}>
                    CREW HEADCOUNT
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={allocWorkersCount}
                    onChange={(e) => setAllocWorkersCount(Number(e.target.value))}
                    className="input"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Row 5: Machinery */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  HEAVY MACHINERY & EQUIPMENT
                </label>
                <input
                  type="text"
                  value={allocMachinery}
                  onChange={(e) => setAllocMachinery(e.target.value)}
                  placeholder="e.g. Plasser Tamper DUOMATIC, Rail Saw, Tamping Machine, OHE Ladder Tower"
                  className="input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* Submit Footer */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setAllocatingDefect(null)}
                  className="btn btn-secondary"
                  disabled={savingAllocation}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAllocation}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
                >
                  {savingAllocation ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  <span>{savingAllocation ? 'Saving Schedule...' : 'Save Block & Crew Allocation'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <img
              src={previewPhoto}
              alt="Track Inspection Preview"
              style={{ width: '100%', height: '100%', maxHeight: '85vh', objectFit: 'contain', display: 'block' }}
            />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="btn btn-secondary"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.75)',
                color: '#fff',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
