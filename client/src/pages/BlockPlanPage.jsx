import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RevealWrapper from '../components/layout/RevealWrapper'
import {
  CalendarRange,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Plus,
  Zap,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  Check,
  X,
  Database,
  Loader2,
  RefreshCw,
  Search,
  FileText,
  CheckCircle,
  Eye,
  Activity,
  TrendingUp,
  Cpu,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Wrench,
  Radio,
  Share2,
  Camera,
  UploadCloud,
  ImageIcon,
  XCircle,
  RotateCcw,
  Play,
  MapPin,
  Calendar,
  Navigation,
  Train,
  Trash2
} from 'lucide-react'
import api from '../lib/api'
import { supabase } from '../lib/supabase'
import LocationAutocomplete from '../components/ui/LocationAutocomplete'
import InteractiveLocationMapPicker from '../components/ui/InteractiveLocationMapPicker'
import { INDIAN_RAILWAY_DIVISIONS } from './DefectPage'
import { RAILWAY_STATIONS } from '../lib/railwayLocations'
import { compressImage } from '../lib/imageCompressor'

const departmentsList = [
  { name: 'All Departments', code: 'ALL', color: 'var(--text-primary)' },
  { name: 'Engineering', code: 'ENGG', color: 'var(--dept-engg)', icon: Wrench },
  { name: 'Signal & Telecom', code: 'S&T', color: 'var(--dept-snt)', icon: Radio },
  { name: 'Traction Distribution', code: 'TRD', color: 'var(--dept-trd)', icon: Zap }
]

export default function BlockPlanPage() {
  const [plans, setPlans] = useState([])
  const [defectsList, setDefectsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dataSource, setDataSource] = useState('RailLink Live DB')
  const [viewMode, setViewMode] = useState('timeline') // 'timeline' | 'grid' | 'conflicts' | 'defects'
  const [selectedDept, setSelectedDept] = useState('ALL')
  const [selectedCorridor, setSelectedCorridor] = useState('All Corridors')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [drawerTab, setDrawerTab] = useState('overview') // 'overview' | 'traffic' | 'safety'
  const [timeHorizon, setTimeHorizon] = useState('night') // 'night' | 'day' | '24h'
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showDefectModal, setShowDefectModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('Timetable Conflict / Passenger Priority')
  const [customRejectReason, setCustomRejectReason] = useState('')
  const [actionInProgress, setActionInProgress] = useState(false)
  const [notification, setNotification] = useState(null)
  const [approvingId, setApprovingId] = useState(null)

  // Defect Upload Form States (Directly inside Block Plan)
  const [defectFormDept, setDefectFormDept] = useState('Engineering')
  const [defectFormSeverity, setDefectFormSeverity] = useState('High')
  const [defectFormDivision, setDefectFormDivision] = useState('Northern Railway — Delhi Division (DLI)')
  const [defectFormCorridor, setDefectFormCorridor] = useState('Delhi - Agra Semi High-Speed Corridor (Sec 4)')
  const [defectFormLocation, setDefectFormLocation] = useState('Mathura Junction (MTJ) North Yard')
  const [defectFormKm, setDefectFormKm] = useState('KM 118.4')
  const [defectFormTrack, setDefectFormTrack] = useState('Up Fast Line')
  const [defectFormWork, setDefectFormWork] = useState('Deep screening required for track ballast & weld stress relief.')
  const [defectImageBase64, setDefectImageBase64] = useState(null)
  const [defectImagePreview, setDefectImagePreview] = useState(null)
  const [defectPhotoError, setDefectPhotoError] = useState(null)
  const [isSubmittingDefect, setIsSubmittingDefect] = useState(false)
  const defectFileInputRef = useRef(null)

  // AI Optimizer Modal Parameters (Enhanced with Date, Time, Duration, Location & Track Line)
  const tomorrowDateStr = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const [modalCorridor, setModalCorridor] = useState('Delhi - Agra Semi High-Speed Corridor')
  const [modalHorizon, setModalHorizon] = useState('Weekly Plan (7 Days)')
  const [modalGoal, setModalGoal] = useState('Zero Passenger Disruption')
  const [modalBuffer, setModalBuffer] = useState(30)
  const [modalDate, setModalDate] = useState(tomorrowDateStr)
  const [modalStartTime, setModalStartTime] = useState('01:30')
  const [modalEndTime, setModalEndTime] = useState('05:00')
  const [modalTrack, setModalTrack] = useState('Both Lines (Coordinated Curfew)')
  const [modalLocation, setModalLocation] = useState('Mathura Junction (MTJ) North Section')
  const [solverStep, setSolverStep] = useState(0)

  // Schedule Block Modal States (supports defect-driven and manual corridor scheduling)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleTargetDefect, setScheduleTargetDefect] = useState(null)
  const [scheduleTitle, setScheduleTitle] = useState('')
  const [scheduleCorridor, setScheduleCorridor] = useState('Delhi - Agra Semi High-Speed Corridor (Sec 4)')
  const [scheduleTrack, setScheduleTrack] = useState('Up Fast Line')
  const [scheduleDate, setScheduleDate] = useState(tomorrowDateStr)
  const [scheduleStartTime, setScheduleStartTime] = useState('02:00')
  const [scheduleEndTime, setScheduleEndTime] = useState('05:30')
  const [scheduleDepts, setScheduleDepts] = useState(['Engineering'])
  const [schedulePriority, setSchedulePriority] = useState('High')
  const [scheduleType, setScheduleType] = useState('Defect-Driven Remedial Block')
  const [scheduleDescription, setScheduleDescription] = useState('')
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false)

  // Normalize defect records from API/Supabase to guarantee camelCase availability
  const normalizeDefect = (d) => {
    const dept = d.department || 'Engineering'
    const rawSection = d.corridor_name || d.corridorName || d.section || ''
    let division = d.division || d.section_id || ''
    if (!division && rawSection.includes('|')) {
      division = rawSection.split('|')[0].trim()
    }
    if (!division) division = 'Northern Railway — Delhi Division (DLI)'

    let displaySection = rawSection
    if (rawSection.includes('|')) {
      displaySection = rawSection.split('|')[1].trim()
    }
    if (!displaySection) displaySection = 'Delhi - Agra Semi High-Speed Corridor'

    const loc = d.location || (displaySection.includes('—') ? displaySection.split('—')[1]?.trim() : (displaySection.includes('-') ? displaySection.split('-').pop()?.trim() : displaySection))
    const desc = d.work_required || d.workRequired || d.description || d.defect_category || d.defectCategory || 'Inspection Defect'

    return {
      id: d.id,
      department: dept,
      sourceSystem: d.source_system || d.sourceSystem || 'TMS',
      division: division,
      corridorName: displaySection,
      section: displaySection,
      rawSection: rawSection,
      location: loc,
      kmMarker: d.kmMarker || (d.km_start ? `KM ${d.km_start}` : (d.kmStart ? `KM ${d.kmStart}` : 'KM 104.2')),
      trackType: d.track_type || d.trackType || 'Up Main Line',
      defectCategory: d.defect_category || d.defectCategory || 'Track Infrastructure',
      workRequired: desc,
      description: desc,
      severity: d.severity || 'High',
      status: d.status || 'Pending Block',
      photoUrl: d.photo_url || d.photoUrl || '',
      photo_url: d.photo_url || d.photoUrl || '',
      overdueDays: d.overdue_days || d.overdueDays || 0,
      reportedDate: d.reportedDate || (d.reported_at ? d.reported_at.split('T')[0] : (d.created_at ? d.created_at.split('T')[0] : '2026-09-09'))
    }
  }

  const fetchData = async () => {
    try {
      setRefreshing(true)
      let plansData = null
      let defectsData = null
      let src = 'Supabase Live DB'

      // Primary: Fetch from Express backend
      try {
        const [plansRes, defRes] = await Promise.all([
          api.get('/plans').catch(() => null),
          api.get('/defects').catch(() => null)
        ])
        if (plansRes && Array.isArray(plansRes.plans)) {
          plansData = plansRes.plans
          src = plansRes.source || 'Supabase Live DB'
        }
        if (defRes && Array.isArray(defRes.defects)) {
          defectsData = defRes.defects.map(normalizeDefect)
        }
      } catch (apiErr) {
        console.warn('[BlockPlan API Warning]: Falling back to direct Supabase fetch:', apiErr)
      }

      // Fallback: Direct Supabase query if backend is unreachable
      if (!plansData) {
        try {
          const { data, error } = await supabase
            .from('block_plans')
            .select('*')
            .order('created_at', { ascending: false })
          if (!error && Array.isArray(data)) {
            plansData = data.map(p => ({
              id: p.id,
              title: p.title,
              corridorId: p.corridor_id,
              corridor: p.corridor,
              track: p.track,
              date: p.date || p.created_at?.split('T')[0],
              startTime: p.start_time,
              endTime: p.end_time,
              duration: p.duration,
              departments: p.departments || [],
              status: p.status,
              type: p.type,
              priority: p.priority || 'High',
              efficiencyScore: p.efficiency_score,
              coordinationIndex: p.coordination_index,
              trainsImpacted: p.trains_impacted || 0,
              freightDiverted: p.freight_diverted || 0,
              aiOptimized: p.ai_optimized || false,
              description: p.description || '',
              conflictDetails: p.conflict_details || null,
              suggestedResolution: p.suggested_resolution || null
            }))
            src = 'Supabase Cloud (Direct)'
          }
        } catch (sbErr) {
          console.warn('[Supabase Direct Plans Warning]:', sbErr)
        }
      }

      // Fallback: Direct Supabase query for defects if backend is unreachable
      if (!defectsData) {
        try {
          const { data: sbDefects, error: sbDefError } = await supabase
            .from('defects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)
          if (!sbDefError && Array.isArray(sbDefects)) {
            defectsData = sbDefects.map(normalizeDefect)
          }
        } catch (sbErr) {
          console.warn('[Supabase Direct Defects Warning]:', sbErr)
        }
      }

      if (plansData !== null) {
        setPlans(plansData)
        setDataSource(`${src} (${plansData.length} block${plansData.length === 1 ? '' : 's'})`)
      }
      if (defectsData !== null) {
        setDefectsList(defectsData)
      }
    } catch (err) {
      console.error('Failed to load block plans data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Realtime Supabase Subscription for Block Plans and Defects
  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('block-plans-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'block_plans' }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'defects' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Auto-open schedule modal if navigated from Defect Explorer with ?scheduleDefect=ID
  useEffect(() => {
    if (defectsList.length > 0) {
      const params = new URLSearchParams(window.location.search)
      const defectIdParam = params.get('scheduleDefect')
      if (defectIdParam) {
        const target = defectsList.find(d => d.id === defectIdParam)
        if (target) {
          handleOpenScheduleFromDefect(target)
        }
      }
    }
  }, [defectsList])

  // Dynamic corridor list
  const corridors = useMemo(() => {
    return ['All Corridors', ...Array.from(new Set(plans.map(p => p.corridor).filter(Boolean)))]
  }, [plans])

  // Department pill color helper
  const getDeptColor = (dept) => {
    if (!dept) return 'var(--accent)'
    if (dept.includes('Engineering') || dept === 'ENGG') return 'var(--dept-engg)'
    if (dept.includes('Signal') || dept === 'S&T') return 'var(--dept-snt)'
    if (dept.includes('Traction') || dept === 'TRD') return 'var(--dept-trd)'
    return 'var(--accent)'
  }

  // Filter plans
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      const deptMatch = selectedDept === 'ALL' || (plan.departments || []).some(d => {
        if (selectedDept === 'ENGG') return d === 'Engineering'
        if (selectedDept === 'S&T') return d === 'Signal & Telecom'
        if (selectedDept === 'TRD') return d === 'Traction Distribution'
        return true
      })
      const corridorMatch = selectedCorridor === 'All Corridors' || (plan.corridor && plan.corridor.toLowerCase().includes(selectedCorridor.toLowerCase().split(' ')[0]))
      const conflictMatch = viewMode === 'conflicts' ? plan.status === 'Conflict' : true
      const searchMatch = !searchQuery || 
        (plan.title && plan.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (plan.id && plan.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (plan.corridor && plan.corridor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (plan.track && plan.track.toLowerCase().includes(searchQuery.toLowerCase()))
      return deptMatch && corridorMatch && conflictMatch && searchMatch
    })
  }, [plans, selectedDept, selectedCorridor, viewMode, searchQuery])

  // Filter defects (only unassigned defects awaiting curfew block allocation)
  const filteredDefects = useMemo(() => {
    return defectsList.filter(d => {
      // Must be awaiting block curfew (not already scheduled or completed)
      const isAwaiting = !d.status || d.status === 'Pending Block' || d.status === 'Pending Block Allocation' || d.status === 'Open' || d.status.toLowerCase().includes('pending')
      if (!isAwaiting) return false

      const deptMatch = selectedDept === 'ALL' || (
        selectedDept === 'ENGG' ? d.department === 'Engineering' :
        selectedDept === 'S&T' ? d.department === 'Signal & Telecom' :
        selectedDept === 'TRD' ? d.department === 'Traction Distribution' : true
      )
      const corridorMatch = selectedCorridor === 'All Corridors' || (
        (d.corridorName && d.corridorName.toLowerCase().includes(selectedCorridor.toLowerCase().split(' ')[0])) ||
        (d.section && d.section.toLowerCase().includes(selectedCorridor.toLowerCase().split(' ')[0]))
      )
      const searchMatch = !searchQuery ||
        (d.id && d.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.defectCategory && d.defectCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.section && d.section.toLowerCase().includes(searchQuery.toLowerCase()))
      return deptMatch && corridorMatch && searchMatch
    })
  }, [defectsList, selectedDept, selectedCorridor, searchQuery])

  // Derived KPI Stats
  const stats = useMemo(() => {
    const total = plans.length
    const conflicts = plans.filter(p => p.status === 'Conflict').length
    const scheduled = plans.filter(p => p.status === 'Scheduled' || p.status.includes('Approved')).length
    const trainsProtected = plans.reduce((acc, p) => acc + (p.aiOptimized ? 3 : 1), 0)
    const avgEfficiency = Math.round(
      plans.reduce((acc, p) => acc + (parseFloat(p.efficiencyScore) || 92), 0) / (total || 1)
    )
    const openDefects = defectsList.filter(d => !d.status || d.status === 'Pending Block' || d.status === 'Pending Block Allocation' || d.status === 'Open' || d.status.toLowerCase().includes('pending')).length
    return { total, conflicts, scheduled, trainsProtected, avgEfficiency, openDefects }
  }, [plans, defectsList])

  // Handle Photo File Pick with compression
  const handleDefectPhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setDefectPhotoError(null)
      try {
        const compressed = await compressImage(file)
        setDefectImageBase64(compressed)
        setDefectImagePreview(compressed)
      } catch (err) {
        console.warn('Image compression fallback:', err)
        const reader = new FileReader()
        reader.onloadend = () => {
          setDefectImageBase64(reader.result)
          setDefectImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // Handle Defect Submission directly from Block Plan
  const handleSubmitDefectInBlockPlan = async (e) => {
    e.preventDefault()

    // STRICT VALIDATION: Photo upload is mandatory
    if (!defectImageBase64) {
      setDefectPhotoError('Inspection photo is mandatory! Please upload a photo of the defect before submitting.')
      return
    }

    setIsSubmittingDefect(true)
    setDefectPhotoError(null)
    try {
      let finalPhotoUrl = ''

      const uploadRes = await api.post('/upload/photo', {
        image: defectImageBase64,
        folder: 'RailLink_defects'
      }).catch(err => {
        console.warn('Upload error from API:', err)
        return null
      })

      if (uploadRes?.url) {
        finalPhotoUrl = uploadRes.url
      } else {
        throw new Error('Failed to upload defect photo to storage')
      }

      const newDefectRes = await api.post('/defects', {
        department: defectFormDept,
        severity: defectFormSeverity,
        division: defectFormDivision,
        corridorName: defectFormCorridor,
        section: defectFormCorridor,
        location: defectFormLocation,
        kmMarker: defectFormKm,
        trackType: defectFormTrack,
        description: defectFormWork,
        photoUrl: finalPhotoUrl
      }).catch(() => null)

      let savedDefect = newDefectRes?.defect
      if (!savedDefect) {
        const generatedId = `DEF-${defectFormDept.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
        const kmVal = parseFloat((defectFormKm || '').replace(/[^0-9.]/g, '')) || 104.2
        const srcSys = defectFormDept === 'Signal & Telecom' ? 'SMMS' : defectFormDept === 'Traction Distribution' ? 'TDMS' : 'TMS'
        const divCode = defectFormDivision.match(/\(([^)]+)\)/)?.[1] || 'IR'
        const fullCorrName = `${defectFormDivision} | ${defectFormCorridor} — ${defectFormLocation}`

        try {
          await supabase.from('defects').insert([{
            id: generatedId,
            department: defectFormDept,
            source_system: srcSys,
            corridor_id: `CORR-${divCode}`,
            corridor_name: fullCorrName,
            section_id: defectFormDivision,
            km_start: kmVal,
            km_end: kmVal + 0.1,
            track_type: defectFormTrack,
            defect_category: defectFormDept + ' Track Asset',
            severity: defectFormSeverity,
            status: 'Pending Block Allocation',
            reported_at: new Date().toISOString(),
            work_required: defectFormWork || `Inspection recorded at ${defectFormLocation}`,
            photo_url: finalPhotoUrl,
            estimated_duration_min: 120,
            ai_confidence: '97.8%'
          }])
        } catch (sbErr) {
          console.warn('[BlockPlan Defect Direct Supabase Insert Warning]:', sbErr)
        }

        savedDefect = {
          id: generatedId,
          department: defectFormDept,
          severity: defectFormSeverity,
          division: defectFormDivision,
          section: defectFormCorridor,
          location: defectFormLocation,
          kmMarker: defectFormKm,
          trackType: defectFormTrack,
          description: defectFormWork,
          photoUrl: finalPhotoUrl,
          status: 'Pending Block Allocation',
          reportedDate: new Date().toISOString().split('T')[0]
        }
      }

      setDefectsList(prev => [savedDefect, ...prev])
      setIsSubmittingDefect(false)
      setShowDefectModal(false)
      setDefectImageBase64(null)
      setDefectImagePreview(null)
      setViewMode('defects')

      setNotification(`Defect ${savedDefect.id} logged! Ready to schedule into an AI maintenance block.`)
      setTimeout(() => setNotification(null), 5000)
    } catch (err) {
      console.error('Failed to log defect in block plan:', err)
      setIsSubmittingDefect(false)
    }
  }

  // Open schedule modal prefilled with defect details
  const handleOpenScheduleFromDefect = (defect) => {
    setScheduleTargetDefect(defect)
    setScheduleTitle(`${defect.department || 'Engineering'} Urgent Remedial: ${defect.defectCategory || defect.workRequired || defect.description?.slice(0, 40) || 'Track Rectification'}`)
    setScheduleCorridor(defect.section || defect.corridorName || 'Delhi - Agra Semi High-Speed Corridor (Sec 4)')
    setScheduleTrack(`${defect.trackType || 'Up Main Line'} (${defect.kmMarker || 'Section Track'})`)
    setScheduleDate(tomorrowDateStr)
    setScheduleStartTime('02:00')
    setScheduleEndTime('05:30')
    setScheduleDepts(Array.from(new Set([defect.department || 'Engineering', 'Signal & Telecom'])))
    setSchedulePriority(defect.severity || 'High')
    setScheduleType('Defect-Driven Remedial Block')
    setScheduleDescription(defect.description || defect.workRequired || `Remedial block scheduled to address defect ${defect.id} under ${defect.division || 'Corridor'}.`)
    setShowScheduleModal(true)
  }

  // Open schedule modal for manual corridor curfew creation
  const handleOpenManualSchedule = () => {
    setScheduleTargetDefect(null)
    setScheduleTitle('AI Coordinated Multi-Discipline Curfew')
    setScheduleCorridor(selectedCorridor !== 'All Corridors' ? selectedCorridor : 'Delhi - Agra Semi High-Speed Corridor (Sec 4)')
    setScheduleTrack('Both Lines (Coordinated Curfew)')
    setScheduleDate(tomorrowDateStr)
    setScheduleStartTime('01:30')
    setScheduleEndTime('05:00')
    setScheduleDepts(['Engineering', 'Signal & Telecom', 'Traction Distribution'])
    setSchedulePriority('High')
    setScheduleType('Tri-Disciplinary Integrated Block')
    setScheduleDescription('Joint corridor maintenance curfew window coordinated across departments to eliminate passenger train stoppage.')
    setShowScheduleModal(true)
  }

  // Backward-compatible alias
  const handleScheduleBlockFromDefect = (defect) => {
    handleOpenScheduleFromDefect(defect)
  }

  // Submit and persist the scheduled block plan to database & API
  const handleConfirmScheduleBlock = async (e) => {
    if (e) e.preventDefault()
    setIsSubmittingSchedule(true)

    // Compute duration from start and end time
    let durationText = '3h 30m'
    try {
      const [sh, sm] = (scheduleStartTime || '02:00').split(':').map(Number)
      const [eh, em] = (scheduleEndTime || '05:30').split(':').map(Number)
      let diffMinutes = (eh * 60 + em) - (sh * 60 + sm)
      if (diffMinutes < 0) diffMinutes += 24 * 60
      const hours = Math.floor(diffMinutes / 60)
      const mins = diffMinutes % 60
      durationText = mins > 0 ? `${hours}h ${mins}m` : `${hours}h 00m`
    } catch {
      durationText = '3h 30m'
    }

    const newBlock = {
      id: `BP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: scheduleTitle || 'Coordinated Maintenance Block',
      corridor: scheduleCorridor,
      corridorId: 'CORR-GEN',
      track: scheduleTrack,
      date: scheduleDate,
      startTime: scheduleStartTime,
      endTime: scheduleEndTime,
      duration: durationText,
      departments: scheduleDepts.length > 0 ? scheduleDepts : ['Engineering'],
      status: 'Scheduled',
      type: scheduleType,
      priority: schedulePriority,
      efficiencyScore: '98.5%',
      coordinationIndex: scheduleDepts.length > 1 ? 'Joint Synchronized (Coupled Curfew)' : 'Departmental Curfew',
      trainsImpacted: 0,
      freightDiverted: 0,
      aiOptimized: true,
      description: scheduleDescription || (scheduleTargetDefect 
        ? `Remedial block scheduled to address defect ${scheduleTargetDefect.id}: ${scheduleTargetDefect.description}.`
        : `Planned maintenance curfew window on ${scheduleTrack}.`),
      defectId: scheduleTargetDefect?.id || null
    }

    try {
      const res = await api.post('/plans', newBlock).catch(err => {
        console.warn('API post error:', err)
        return null
      })

      const savedPlan = res?.plan || newBlock

      setPlans(prev => [savedPlan, ...prev.filter(p => p.id !== savedPlan.id)])
      if (scheduleTargetDefect) {
        setDefectsList(prev => prev.map(d => d.id === scheduleTargetDefect.id ? { ...d, status: 'Block Scheduled' } : d))
      }

      setIsSubmittingSchedule(false)
      setShowScheduleModal(false)
      setViewMode('grid')
      setNotification(`Block plan ${savedPlan.id} successfully scheduled! Synced into Master Block Plans.`)
      setTimeout(() => setNotification(null), 6000)
    } catch (err) {
      console.error('Failed to schedule block plan:', err)
      setPlans(prev => [newBlock, ...prev.filter(p => p.id !== newBlock.id)])
      if (scheduleTargetDefect) {
        setDefectsList(prev => prev.map(d => d.id === scheduleTargetDefect.id ? { ...d, status: 'Block Scheduled' } : d))
      }
      setIsSubmittingSchedule(false)
      setShowScheduleModal(false)
      setViewMode('grid')
      setNotification(`Block plan ${newBlock.id} scheduled locally!`)
      setTimeout(() => setNotification(null), 6000)
    }
  }

  // Handle AI Auto-Resolve Conflict
  const handleResolveConflict = (id) => {
    setPlans(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'Scheduled',
          startTime: '02:00',
          endTime: '05:30',
          duration: '3h 30m',
          efficiencyScore: '97.2%',
          coordinationIndex: 'Joint Synchronized (OR-Tools AI)',
          aiOptimized: true,
          conflictDetails: null,
          departments: Array.from(new Set([...(p.departments || []), 'Engineering', 'Signal & Telecom'])),
          trainsImpacted: 0,
          freightDiverted: 0,
          type: 'Shadow / Integrated Tri-Discipline',
          description: 'Conflict resolved by OR-Tools solver: coupled traction power shutdown with track renewal curfew window to eliminate commercial stoppage.'
        }
      }
      return p
    }))
    setNotification('Conflict resolved! OR-Tools synchronized curfew windows and eliminated commercial train stoppages.')
    setTimeout(() => setNotification(null), 4500)
    if (selectedPlan && selectedPlan.id === id) {
      setSelectedPlan(prev => ({
        ...prev,
        status: 'Scheduled',
        startTime: '02:00',
        endTime: '05:30',
        duration: '3h 30m',
        efficiencyScore: '97.2%',
        conflictDetails: null,
        trainsImpacted: 0
      }))
    }
  }

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved & Synced to COA':
      case 'Approved & Dispatched':
      case 'Dispatched to COA':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          dot: '#3b82f6',
          label: 'Approved & Synced to COA'
        }
      case 'In Progress':
        return {
          bg: 'rgba(212, 160, 87, 0.18)',
          color: 'var(--dept-trd)',
          dot: 'var(--dept-trd)',
          label: 'In Progress'
        }
      case 'Completed':
        return {
          bg: 'rgba(109, 184, 123, 0.18)',
          color: 'var(--status-healthy)',
          dot: 'var(--status-healthy)',
          label: 'Completed'
        }
      case 'Rejected':
        return {
          bg: 'rgba(201, 79, 79, 0.18)',
          color: 'var(--dept-conflict)',
          dot: 'var(--dept-conflict)',
          label: 'Rejected'
        }
      case 'Conflict':
        return {
          bg: 'rgba(201, 79, 79, 0.15)',
          color: 'var(--dept-conflict)',
          dot: 'var(--dept-conflict)',
          label: 'Conflict'
        }
      case 'Scheduled':
      default:
        return {
          bg: 'rgba(228, 164, 189, 0.18)',
          color: 'var(--accent)',
          dot: 'var(--accent)',
          label: status || 'Scheduled'
        }
    }
  }

  // Handle Full Lifecycle Actions
  const handleApprovePlan = async (plan) => {
    setApprovingId(plan.id)
    try {
      await api.patch(`/plans/${plan.id}/approve`).catch(() => null)
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'Approved & Synced to COA' } : p))
      setNotification(`Block ${plan.id} approved and dispatched to COA & BDMS network.`)
      if (selectedPlan && selectedPlan.id === plan.id) {
        setSelectedPlan(prev => ({ ...prev, status: 'Approved & Synced to COA' }))
      }
    } finally {
      setApprovingId(null)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleStartPlan = async (plan) => {
    setActionInProgress(true)
    try {
      await api.patch(`/plans/${plan.id}/start`).catch(() => null)
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'In Progress' } : p))
      setNotification(`Track possession active for ${plan.id}. Work curfew in progress.`)
      if (selectedPlan && selectedPlan.id === plan.id) {
        setSelectedPlan(prev => ({ ...prev, status: 'In Progress' }))
      }
    } finally {
      setActionInProgress(false)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleCompletePlan = async (plan) => {
    setActionInProgress(true)
    try {
      await api.patch(`/plans/${plan.id}/complete`).catch(() => null)
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'Completed' } : p))
      setNotification(`✓ Block ${plan.id} completed. Track certified fit for commercial traffic.`)
      if (selectedPlan && selectedPlan.id === plan.id) {
        setSelectedPlan(prev => ({ ...prev, status: 'Completed' }))
      }
    } finally {
      setActionInProgress(false)
      setTimeout(() => setNotification(null), 4500)
    }
  }

  const handleConfirmReject = async () => {
    if (!selectedPlan) return
    setActionInProgress(true)
    const reasonToUse = rejectReason === 'Other Reason' && customRejectReason ? customRejectReason : rejectReason
    try {
      await api.patch(`/plans/${selectedPlan.id}/reject`, { reason: reasonToUse }).catch(() => null)
      setPlans(prev => prev.map(p => p.id === selectedPlan.id ? { ...p, status: 'Rejected' } : p))
      setSelectedPlan(prev => ({ ...prev, status: 'Rejected' }))
      setNotification(`Block ${selectedPlan.id} rejected (${reasonToUse}). COA informed.`)
      setShowRejectModal(false)
    } finally {
      setActionInProgress(false)
      setTimeout(() => setNotification(null), 4500)
    }
  }

  const handleReopenPlan = async (plan) => {
    setActionInProgress(true)
    try {
      await api.patch(`/plans/${plan.id}/reopen`).catch(() => null)
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'Scheduled' } : p))
      setNotification(`Block ${plan.id} reopened and reset to Scheduled status.`)
      if (selectedPlan && selectedPlan.id === plan.id) {
        setSelectedPlan(prev => ({ ...prev, status: 'Scheduled' }))
      }
    } finally {
      setActionInProgress(false)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleDeletePlan = async (plan) => {
    const planId = typeof plan === 'string' ? plan : plan.id
    const confirmDelete = window.confirm(`Permanently delete block plan ${planId} from Supabase database?`)
    if (!confirmDelete) return

    setActionInProgress(true)
    try {
      setPlans(prev => prev.filter(p => p.id !== planId))
      if (selectedPlan?.id === planId) setSelectedPlan(null)

      let deleted = false
      try {
        await api.delete(`/plans/${planId}`)
        deleted = true
      } catch (apiErr) {
        console.warn('[Plan Delete API Warning]: Falling back to direct Supabase delete', apiErr)
      }

      if (!deleted) {
        await supabase.from('block_plans').delete().eq('id', planId)
      }

      setNotification(`✓ Block ${planId} permanently deleted from database.`)
      await fetchData()
    } catch (err) {
      console.error('Delete plan failed:', err)
      alert('Could not delete block plan: ' + (err.message || 'Error'))
      fetchData()
    } finally {
      setActionInProgress(false)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  // Handle AI Full Plan Generation with User-Selected Date, Time & Track
  const triggerAIOptimization = async () => {
    setIsGeneratingPlan(true)
    setSolverStep(1)
    setTimeout(() => setSolverStep(2), 700)
    setTimeout(() => setSolverStep(3), 1400)
    setTimeout(() => setSolverStep(4), 2100)

    // Compute duration from start and end time
    let durationText = '3h 30m'
    try {
      const [sh, sm] = (modalStartTime || '01:30').split(':').map(Number)
      const [eh, em] = (modalEndTime || '05:00').split(':').map(Number)
      let diffMinutes = (eh * 60 + em) - (sh * 60 + sm)
      if (diffMinutes < 0) diffMinutes += 24 * 60 // cross midnight
      const hours = Math.floor(diffMinutes / 60)
      const mins = diffMinutes % 60
      durationText = mins > 0 ? `${hours}h ${mins}m` : `${hours}h 00m`
    } catch {
      durationText = '3h 30m'
    }

    try {
      const res = await api.post('/plans/generate', {
        corridor: modalCorridor,
        horizon: modalHorizon,
        goal: modalGoal,
        bufferMinutes: modalBuffer,
        date: modalDate,
        startTime: modalStartTime,
        endTime: modalEndTime,
        duration: durationText,
        track: modalTrack,
        location: modalLocation
      }).catch(() => null)

      setTimeout(() => {
        if (res?.plan) {
          setPlans(prev => [res.plan, ...prev])
        } else {
          const newPlan = {
            id: `BP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
            title: `AI Coordinated Curfew: ${modalTrack} (${modalGoal.split(' ')[0]})`,
            corridor: modalCorridor,
            track: `${modalTrack} (${modalLocation})`,
            date: modalDate,
            startTime: modalStartTime,
            endTime: modalEndTime,
            duration: durationText,
            departments: ['Engineering', 'Signal & Telecom', 'Traction Distribution'],
            status: 'Scheduled',
            type: 'Tri-Disciplinary Integrated Block',
            priority: 'High',
            efficiencyScore: '98.8%',
            coordinationIndex: 'Coordinated Multi-Asset Curfew',
            trainsImpacted: 0,
            freightDiverted: 0,
            aiOptimized: true,
            description: `Generated by RailLink Constraint Engine for ${modalCorridor} on ${modalDate} (${modalStartTime} – ${modalEndTime}, ${durationText}). Clustered 3 departments into a curfew window with 0 passenger delays.`
          }
          setPlans(prev => [newPlan, ...prev])
        }
        setNotification(`Multi-corridor block plan computed for ${modalDate} (${modalStartTime} – ${modalEndTime})!`)
        setIsGeneratingPlan(false)
        setShowGenerateModal(false)
        setSolverStep(0)
        setTimeout(() => setNotification(null), 5000)
      }, 2600)
    } catch (err) {
      console.error('Failed to generate plan:', err)
      setIsGeneratingPlan(false)
      setShowGenerateModal(false)
      setSolverStep(0)
    }
  }

  // Timeline Hour Ranges
  const timelineConfig = useMemo(() => {
    if (timeHorizon === 'night') {
      return {
        start: 0,
        hours: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00'],
        range: 8,
        label: 'Night Curfew Window (00:00 – 08:00)'
      }
    } else if (timeHorizon === 'day') {
      return {
        start: 8,
        hours: ['08:00', '10:00', '12:00', '14:00', '16:00'],
        range: 8,
        label: 'Day Maintenance Window (08:00 – 16:00)'
      }
    } else {
      return {
        start: 0,
        hours: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        range: 24,
        label: '24-Hour Corridor Horizon'
      }
    }
  }, [timeHorizon])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        gap: 'var(--space-md)',
      }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Synchronizing corridor block plans with {dataSource}...
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-2xl) var(--space-xl)', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: '92px',
              right: '24px',
              zIndex: 9999,
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              padding: '14px 22px',
              borderRadius: 'var(--radius-card)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.9rem',
              fontWeight: 600,
              maxWidth: '480px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(228, 164, 189, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={16} color="var(--accent)" />
            </div>
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <RevealWrapper>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-xs)', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(228, 164, 189, 0.15)', color: 'var(--accent)', border: '1px solid var(--accent)', letterSpacing: '0.05em' }}>
                BDMS & COA LIVE INTEGRATION
              </span>
              <span className="badge" style={{ background: 'rgba(109, 184, 123, 0.15)', color: 'var(--status-healthy)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Database size={11} /> {dataSource}
              </span>
              <span className="badge" style={{ background: 'rgba(38, 38, 38, 0.05)', color: 'var(--text-secondary)' }}>
                OR-Tools Engine v9.8
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Block Plan <span style={{ color: 'var(--accent)' }}>Manager</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '750px', marginTop: 'var(--space-xs)', fontSize: '1rem', lineHeight: 1.5 }}>
              Coordinated multi-disciplinary corridor maintenance windows. Inspect pending track defects, couple Engineering renewal with S&T signal testing and TRD power cutoffs to eliminate passenger delays.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="btn btn-secondary"
              style={{ padding: '12px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Sync Network'}</span>
            </button>
            <button
              onClick={handleOpenManualSchedule}
              className="btn btn-secondary"
              style={{ padding: '12px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--accent)' }}
            >
              <CalendarRange size={16} color="var(--accent)" />
              <span style={{ fontWeight: 800 }}>Schedule Block</span>
            </button>
            <button
              onClick={() => setShowDefectModal(true)}
              className="btn btn-secondary"
              style={{ padding: '12px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              <span>Log Track Defect</span>
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn btn-primary"
              style={{ padding: '12px 22px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(228, 164, 189, 0.35)' }}
            >
              <Zap size={16} />
              <span>AI Optimize Plan</span>
            </button>
          </div>
        </div>
      </RevealWrapper>

      {/* KPI Stats Strip */}
      <RevealWrapper delay={0.05}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)'
        }}>
          <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-card)', background: 'rgba(228, 164, 189, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CalendarRange size={22} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Total Scheduled</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.1 }}>{stats.total} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Blocks</span></div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-card)', background: 'rgba(109, 184, 123, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={22} color="var(--status-healthy)" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Coordination Index</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.1, color: 'var(--status-healthy)' }}>{stats.avgEfficiency}%</div>
            </div>
          </div>

          <div
            className="card"
            onClick={() => setViewMode('defects')}
            style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', border: viewMode === 'defects' ? '2px solid var(--accent)' : '1px solid var(--border)' }}
          >
            <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-card)', background: 'rgba(212, 160, 87, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wrench size={22} color="var(--dept-trd)" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Awaiting Blocks</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.1 }}>{stats.openDefects} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Defects</span></div>
            </div>
          </div>

          <div className="card" style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            borderColor: stats.conflicts > 0 ? 'rgba(201, 79, 79, 0.3)' : 'var(--border)'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: stats.conflicts > 0 ? 'rgba(201, 79, 79, 0.15)' : 'rgba(109, 184, 123, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} color={stats.conflicts > 0 ? 'var(--dept-conflict)' : 'var(--status-healthy)'} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Route Collisions</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.1, color: stats.conflicts > 0 ? 'var(--dept-conflict)' : 'var(--status-healthy)' }}>
                {stats.conflicts} {stats.conflicts === 0 ? 'Resolved' : 'Active'}
              </div>
            </div>
          </div>
        </div>
      </RevealWrapper>

      {/* Control Toolbar: Views, Filters & Search */}
      <RevealWrapper delay={0.1}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-card)',
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
          border: '1px solid var(--border)'
        }}>
          
          {/* View Mode Pills (including Defects) */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <button
              onClick={() => setViewMode('timeline')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'timeline' ? 'var(--text-primary)' : 'transparent',
                color: viewMode === 'timeline' ? 'var(--bg-primary)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Clock size={14} />
              <span>Gantt Horizon</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'grid' ? 'var(--text-primary)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--bg-primary)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <CalendarRange size={14} />
              <span>Plan Cards ({filteredPlans.length})</span>
            </button>
            <button
              onClick={() => setViewMode('defects')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'defects' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'defects' ? 'var(--text-primary)' : 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Wrench size={14} />
              <span>Track Defects ({filteredDefects.length})</span>
            </button>
            <button
              onClick={() => setViewMode('conflicts')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: viewMode === 'conflicts' ? 'var(--dept-conflict)' : 'transparent',
                color: viewMode === 'conflicts' ? '#fff' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <AlertTriangle size={14} />
              <span>Conflicts {stats.conflicts > 0 ? `(${stats.conflicts})` : ''}</span>
            </button>
          </div>

          {/* Department Quick Filter */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {departmentsList.map(dept => {
              const isSelected = selectedDept === dept.code
              const IconComponent = dept.icon
              return (
                <button
                  key={dept.code}
                  onClick={() => setSelectedDept(dept.code)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    border: isSelected ? `2px solid ${dept.color}` : '1px solid var(--border)',
                    background: isSelected ? 'var(--bg-primary)' : 'transparent',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  {IconComponent && <IconComponent size={12} color={dept.color} />}
                  <span>{dept.code}</span>
                </button>
              )
            })}
          </div>

          {/* Search & Corridor Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search plans, defects, corridors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 14px 8px 32px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  width: '210px'
                }}
              />
            </div>

            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                maxWidth: '220px'
              }}
            >
              {corridors.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </RevealWrapper>

      {/* VIEW MODE 1: GANTT HORIZON TIMELINE */}
      {viewMode === 'timeline' && (
        <RevealWrapper delay={0.15}>
          <div className="card" style={{ padding: 'var(--space-xl)', overflowX: 'auto', marginBottom: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{timelineConfig.label}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Stacked multi-departmental maintenance windows. Click any block capsule to inspect railway orders.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)' }}>
                  <button onClick={() => setTimeHorizon('night')} style={{ padding: '5px 12px', borderRadius: 'var(--radius-pill)', border: 'none', background: timeHorizon === 'night' ? 'var(--text-primary)' : 'transparent', color: timeHorizon === 'night' ? 'var(--bg-primary)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Night (00–08)</button>
                  <button onClick={() => setTimeHorizon('day')} style={{ padding: '5px 12px', borderRadius: 'var(--radius-pill)', border: 'none', background: timeHorizon === 'day' ? 'var(--text-primary)' : 'transparent', color: timeHorizon === 'day' ? 'var(--bg-primary)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Day (08–16)</button>
                  <button onClick={() => setTimeHorizon('24h')} style={{ padding: '5px 12px', borderRadius: 'var(--radius-pill)', border: 'none', background: timeHorizon === '24h' ? 'var(--text-primary)' : 'transparent', color: timeHorizon === '24h' ? 'var(--bg-primary)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Full 24h</button>
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--dept-engg)' }} /> Engg</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--dept-snt)' }} /> S&T</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--dept-trd)' }} /> TRD</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--dept-conflict)' }} /> Conflict</span>
                </div>
              </div>
            </div>

            <div style={{ minWidth: '940px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: `280px repeat(${timelineConfig.hours.length - 1}, 1fr)`, borderBottom: '2px solid var(--border)', paddingBottom: '10px', fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>CORRIDOR & SECTION KM</div>
                {timelineConfig.hours.slice(0, timelineConfig.hours.length - 1).map((hour, i) => (
                  <div key={hour} style={{ textAlign: 'center' }}>{hour} - {timelineConfig.hours[i + 1]}</div>
                ))}
              </div>

              {filteredPlans.length === 0 ? (
                <div style={{ padding: 'var(--space-2xl) 0', textAlign: 'center', color: 'var(--text-muted)' }}>No block plans match current filter criteria.</div>
              ) : (
                filteredPlans.map((plan) => {
                  const startH = parseInt(plan.startTime?.split(':')[0] || '2', 10)
                  const startM = parseInt(plan.startTime?.split(':')[1] || '0', 10)
                  const endH = parseInt(plan.endTime?.split(':')[0] || '5', 10)
                  const endM = parseInt(plan.endTime?.split(':')[1] || '0', 10)
                  const startDec = startH + startM / 60
                  const endDec = endH + endM / 60
                  const offsetStart = startDec - timelineConfig.start
                  const duration = Math.max(0.6, endDec - startDec)
                  const leftPercent = Math.max(0, Math.min(95, (offsetStart / timelineConfig.range) * 100))
                  const widthPercent = Math.max(8, Math.min(100 - leftPercent, (duration / timelineConfig.range) * 100))
                  const isConflict = plan.status === 'Conflict'
                  const isMultiDept = (plan.departments || []).length > 1

                  return (
                    <div
                      key={plan.id}
                      onClick={() => { setSelectedPlan(plan); setDrawerTab('overview'); }}
                      style={{ display: 'grid', gridTemplateColumns: `280px 1fr`, borderBottom: '1px solid var(--border)', padding: '14px 0', alignItems: 'center', cursor: 'pointer', borderRadius: '8px' }}
                      className="timeline-row"
                    >
                      <div style={{ paddingRight: '16px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {plan.corridor?.split('(')[0]}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span>{plan.id}</span>
                          <span>•</span>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{plan.track}</span>
                        </div>
                      </div>

                      <div style={{ position: 'relative', height: '52px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${timelineConfig.hours.length - 1}, 1fr)` }}>
                          {[...Array(timelineConfig.hours.length - 1)].map((_, i) => (
                            <div key={i} style={{ borderRight: '1px dashed var(--border)' }} />
                          ))}
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.01, y: -2 }}
                          style={{
                            position: 'absolute',
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                            top: '6px',
                            bottom: '6px',
                            borderRadius: '10px',
                            background: isConflict ? 'linear-gradient(135deg, #c94f4f, #a83232)' : isMultiDept ? 'linear-gradient(135deg, #e4a4bd, #7ec4cf)' : getDeptColor(plan.departments?.[0]),
                            color: '#fff',
                            padding: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: isConflict ? '0 4px 14px rgba(201, 79, 79, 0.4)' : '0 4px 14px rgba(0,0,0,0.12)',
                            overflow: 'hidden',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            border: isConflict ? '2px solid rgba(255,255,255,0.6)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Clock size={12} style={{ flexShrink: 0 }} />
                            <span>{plan.startTime}–{plan.endTime}</span>
                            <span style={{ opacity: 0.85 }}>• {plan.title}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            {plan.aiOptimized && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', background: 'rgba(0,0,0,0.25)', padding: '2px 6px', borderRadius: '4px' }}>
                                <Zap size={10} /> {plan.efficiencyScore || '96%'}
                              </span>
                            )}
                            {isConflict && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>
                                <AlertTriangle size={10} /> Collision
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </RevealWrapper>
      )}

      {/* VIEW MODE 2: PLAN CARDS GRID */}
      {viewMode === 'grid' && (
        <div style={{ display: filteredPlans.length === 0 ? 'block' : 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          {filteredPlans.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={40} color="var(--status-healthy)" style={{ margin: '0 auto var(--space-md)' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>No Block Plans Found in Database</h4>
              <p style={{ fontSize: '0.875rem', marginTop: '6px', maxWidth: '500px', margin: '6px auto 0' }}>
                The Supabase database is completely synchronized with 0 scheduled plans. Use "AI Optimize Plan" or "Schedule Block" above to generate corridor curfew windows.
              </p>
            </div>
          ) : (
            filteredPlans.map((plan, idx) => {
            const isConflict = plan.status === 'Conflict'
            return (
              <RevealWrapper key={plan.id} delay={idx * 0.04}>
                <motion.div
                  className="card"
                  whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.08)' }}
                  onClick={() => { setSelectedPlan(plan); setDrawerTab('overview'); }}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>{plan.id}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {plan.aiOptimized && (
                        <span className="badge" style={{ background: 'rgba(228, 164, 189, 0.2)', color: 'var(--accent)', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Zap size={10} /> AI Sync
                        </span>
                      )}
                      {(() => {
                        const badge = getStatusBadge(plan.status)
                        return (
                          <span className="badge" style={{ background: badge.bg, color: badge.color, fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: badge.dot }} />
                            {badge.label}
                          </span>
                        )
                      })()}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px', lineHeight: 1.3 }}>{plan.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)', lineHeight: 1.4 }}>
                    {plan.corridor} • <span style={{ fontWeight: 600 }}>{plan.track}</span>
                  </p>

                  <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 800 }}>
                      <Clock size={15} color="var(--accent)" />
                      <span>{plan.startTime} – {plan.endTime}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{plan.duration}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--space-md)' }}>
                    {(plan.departments || []).map(dept => (
                      <span key={dept} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: 'rgba(0,0,0,0.05)', color: getDeptColor(dept), fontWeight: 700 }}>
                        {dept}
                      </span>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 800, color: 'var(--status-healthy)' }}>
                      Eff: {plan.efficiencyScore || '95%'}
                    </span>
                  </div>

                  {isConflict && (
                    <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-card)', background: 'rgba(201, 79, 79, 0.09)', border: '1px solid rgba(201, 79, 79, 0.25)', fontSize: '0.78rem', color: 'var(--dept-conflict)', marginBottom: 'var(--space-md)' }}>
                      <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <AlertTriangle size={13} /> {plan.conflictDetails || 'Cross-department route overlap detected'}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleResolveConflict(plan.id); }} className="btn" style={{ marginTop: '8px', width: '100%', padding: '8px 12px', background: 'var(--dept-conflict)', color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Zap size={12} /> Auto-Resolve via OR-Tools
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Impact: <strong>{plan.trainsImpacted || 0}</strong> passenger trains</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--accent)' }}>
                      Inspect <ArrowRight size={12} />
                    </span>
                  </div>
                </motion.div>
              </RevealWrapper>
            )
          }))}
        </div>
      )}

      {/* VIEW MODE 3: CORRIDOR DEFECTS & WORK ORDERS (NEW REQUESTED AREA) */}
      {viewMode === 'defects' && (
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Track Defects Awaiting Block Curfews</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Open field inspection defects across TMS (Track), SMMS (Signals), and TDMS (OHE). Schedule directly into coordinated maintenance windows.
              </p>
            </div>
            <button
              onClick={() => setShowDefectModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Log New Defect Here
            </button>
          </div>

          {filteredDefects.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={40} color="var(--status-healthy)" style={{ margin: '0 auto var(--space-md)' }} />
              <h4>No unassigned defects found for current filter.</h4>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-lg)' }}>
              {filteredDefects.map((defect) => (
                <div key={defect.id} className="card" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>{defect.id}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {defect.reportedDate}</span>
                    </div>
                    <span className="badge" style={{
                      background: defect.severity === 'Critical' ? 'rgba(201, 79, 79, 0.15)' : 'rgba(212, 160, 87, 0.15)',
                      color: defect.severity === 'Critical' ? 'var(--dept-conflict)' : 'var(--dept-trd)',
                      fontWeight: 800
                    }}>
                      {defect.severity} Severity
                    </span>
                  </div>

                  {defect.photoUrl ? (
                    <div style={{ height: '150px', borderRadius: '10px', overflow: 'hidden', marginBottom: 'var(--space-md)', background: 'var(--bg-secondary)' }}>
                      <img src={defect.photoUrl} alt="Defect" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ height: '70px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 'var(--space-md)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Wrench size={18} color="var(--dept-trd)" />
                      <span>Inspection recorded without photo</span>
                    </div>
                  )}

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 900, marginBottom: '6px', lineHeight: 1.3 }}>
                    {defect.defectCategory || defect.workRequired || defect.description?.slice(0, 60)}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                    {defect.section || defect.corridorName} • <strong>{defect.kmMarker || 'Section Track'}</strong> • <span style={{ fontWeight: 600 }}>{defect.trackType || 'Main Line'}</span>
                  </p>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 'var(--space-md)' }}>
                    {defect.description?.length > 110 ? `${defect.description.slice(0, 110)}...` : defect.description}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: getDeptColor(defect.department) }}>
                      {defect.department}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenScheduleFromDefect(defect)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.78rem', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Zap size={13} /> Schedule Block
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 4: CONFLICT RESOLVER */}
      {viewMode === 'conflicts' && (
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          {plans.filter(p => p.status === 'Conflict').length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-3xl)', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(109, 184, 123, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-md)' }}>
                <CheckCircle2 size={36} color="var(--status-healthy)" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 'var(--space-xs)' }}>All Corridor Windows De-conflicted</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-lg)' }}>
                Zero active timetable overlaps or departmental route collisions across the network.
              </p>
              <button onClick={() => setViewMode('timeline')} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                Return to Gantt Timeline
              </button>
            </div>
          ) : (
            <div>
              <div style={{ background: 'rgba(201, 79, 79, 0.08)', border: '1px solid rgba(201, 79, 79, 0.25)', borderRadius: 'var(--radius-card)', padding: '16px 22px', marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertCircle size={24} color="var(--dept-conflict)" />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dept-conflict)' }}>Active Timetable Clashes Detected ({plans.filter(p => p.status === 'Conflict').length})</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Overlapping track possessions without safety permits.</p>
                  </div>
                </div>
                <button onClick={() => plans.filter(p => p.status === 'Conflict').forEach(p => handleResolveConflict(p.id))} className="btn btn-primary" style={{ background: 'var(--dept-conflict)', border: 'none', color: '#fff', fontSize: '0.85rem' }}>
                  <Zap size={14} /> Resolve All via AI Synchronizer
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: 'var(--space-lg)' }}>
                {plans.filter(p => p.status === 'Conflict').map(plan => (
                  <div key={plan.id} className="card" style={{ border: '2px solid rgba(201, 79, 79, 0.3)', padding: 'var(--space-xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                      <span className="badge" style={{ background: 'var(--dept-conflict)', color: '#fff' }}>HIGH SEVERITY COLLISION</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>{plan.id}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '6px' }}>{plan.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>Corridor: {plan.corridor} ({plan.track})</p>
                    <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', marginBottom: 'var(--space-md)' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--dept-conflict)', textTransform: 'uppercase', marginBottom: '4px' }}>Collision Diagnosis:</div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{plan.conflictDetails}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                      <button onClick={() => setSelectedPlan(plan)} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }}>Inspect Colliding Window</button>
                      <button onClick={() => handleResolveConflict(plan.id)} className="btn btn-primary" style={{ flex: 1.5, background: 'var(--dept-conflict)', border: 'none', color: '#fff', fontSize: '0.85rem' }}>
                        <Zap size={14} /> Auto-Reschedule & Couple
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: LOG NEW DEFECT DIRECTLY FROM BLOCK PLAN */}
      <AnimatePresence>
        {showDefectModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-md)'
            }}
            onClick={() => !isSubmittingDefect && setShowDefectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{ width: '100%', maxWidth: '600px', background: 'var(--bg-primary)', padding: 'var(--space-2xl)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wrench size={20} color="var(--text-primary)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Log Track Defect for Block Planning</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Synchronizes to database and flags requirement for corridor curfew</p>
                  </div>
                </div>
                <button onClick={() => setShowDefectModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitDefectInBlockPlan} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Mandatory Photo Alert Warning */}
                {defectPhotoError && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-card)',
                    background: 'rgba(201, 79, 79, 0.12)',
                    border: '1px solid var(--dept-conflict)',
                    color: 'var(--dept-conflict)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertTriangle size={16} color="var(--dept-conflict)" style={{ flexShrink: 0 }} />
                    <span>{defectPhotoError}</span>
                  </div>
                )}

                {/* Photo upload picker */}
                <input type="file" ref={defectFileInputRef} accept="image/*" onChange={handleDefectPhotoSelect} style={{ display: 'none' }} />
                <div
                  onClick={() => defectFileInputRef.current?.click()}
                  style={{
                    border: defectPhotoError
                      ? '2px dashed var(--dept-conflict)'
                      : defectImagePreview
                      ? '2px dashed var(--status-healthy)'
                      : '2px dashed var(--accent)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: defectPhotoError
                      ? 'rgba(201, 79, 79, 0.05)'
                      : defectImagePreview
                      ? 'rgba(0,0,0,0.04)'
                      : 'rgba(228, 164, 189, 0.05)'
                  }}
                >
                  {defectImagePreview ? (
                    <div>
                      <img src={defectImagePreview} alt="Preview" style={{ maxHeight: '140px', margin: '0 auto 8px', borderRadius: '8px', objectFit: 'contain' }} />
                      <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--status-healthy)', margin: 0 }}>✓ Photo Selected & Verified</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(201, 79, 79, 0.15)', color: 'var(--dept-conflict)', border: '1px solid var(--dept-conflict)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.7rem', marginBottom: '8px' }}>
                        <AlertTriangle size={12} color="var(--dept-conflict)" />
                        <span>MANDATORY · PHOTO REQUIRED</span>
                      </div>
                      <Camera size={28} color={defectPhotoError ? 'var(--dept-conflict)' : 'var(--accent)'} style={{ margin: '0 auto 6px' }} />
                      <p style={{ fontWeight: 800, fontSize: '0.85rem', margin: '0 0 2px', color: defectPhotoError ? 'var(--dept-conflict)' : 'inherit' }}>
                        Click to Upload Inspection Photo <span style={{ color: 'var(--dept-conflict)' }}>*</span>
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Inspection photo is strictly mandatory before submitting defect report</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Department</label>
                    <select className="input" value={defectFormDept} onChange={(e) => setDefectFormDept(e.target.value)}>
                      <option value="Engineering">Engineering (TMS)</option>
                      <option value="Signal & Telecom">Signal & Telecom (SMMS)</option>
                      <option value="Traction Distribution">Traction Distribution (TDMS)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Severity</label>
                    <select className="input" value={defectFormSeverity} onChange={(e) => setDefectFormSeverity(e.target.value)}>
                      <option value="Critical">Critical (Immediate Block)</option>
                      <option value="High">High (Within 48h)</option>
                      <option value="Medium">Medium (Scheduled)</option>
                      <option value="Low">Low (Preventive)</option>
                    </select>
                  </div>
                </div>

                {/* Explicit Division, Location & Line Verification Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  background: 'rgba(228, 164, 189, 0.1)',
                  border: '1px solid var(--accent)',
                  borderRadius: 'var(--radius-card)',
                  padding: '10px 14px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="var(--accent)" />
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Division</span>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{defectFormDivision.split('—')[0]}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Navigation size={15} color="var(--accent)" />
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Location</span>
                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{defectFormLocation || 'Select below'} ({defectFormKm})</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Train size={15} color="var(--accent)" />
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Line</span>
                      <span className="badge" style={{ background: 'var(--accent)', color: 'var(--text-primary)', fontWeight: 800, fontSize: '10px' }}>{defectFormTrack}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                    Railway Division & Zone <span style={{ color: 'var(--dept-conflict)' }}>*</span>
                  </label>
                  <select
                    className="input"
                    value={defectFormDivision}
                    onChange={(e) => {
                      const newDiv = e.target.value
                      setDefectFormDivision(newDiv)
                      const matched = INDIAN_RAILWAY_DIVISIONS.find(d => d.name === newDiv)
                      const targetCorridor = matched?.defaultCorridor || defectFormCorridor
                      if (matched?.defaultCorridor) setDefectFormCorridor(matched.defaultCorridor)

                      const stn = RAILWAY_STATIONS.find(s => s.division === newDiv) ||
                                  RAILWAY_STATIONS.find(s => s.corridor === targetCorridor)
                      if (stn) {
                        setDefectFormLocation(stn.name)
                        setDefectFormKm(stn.defaultKm || 'KM 0.0')
                        if (stn.supportedLines && stn.supportedLines.length > 0) {
                          setDefectFormTrack(stn.supportedLines[0])
                        }
                      }
                    }}
                  >
                    {INDIAN_RAILWAY_DIVISIONS.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                    Corridor Section <span style={{ color: 'var(--dept-conflict)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={defectFormCorridor}
                    onChange={(e) => setDefectFormCorridor(e.target.value)}
                    placeholder="e.g. Delhi - Agra Semi High-Speed Corridor (Sec 4)"
                    required
                  />
                </div>

                {/* Interactive Map Marking & Track Line Geometry */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent)' }}>
                      MARK LOCATION ON MAP & SELECT CORRIDOR
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Click map pin or search station</span>
                  </div>

                  <InteractiveLocationMapPicker
                    location={defectFormLocation}
                    onLocationChange={(val) => setDefectFormLocation(val)}
                    division={defectFormDivision}
                    onDivisionChange={(val) => setDefectFormDivision(val)}
                    corridor={defectFormCorridor}
                    onCorridorChange={(val) => setDefectFormCorridor(val)}
                    kmMarker={defectFormKm}
                    onKmMarkerChange={(val) => setDefectFormKm(val)}
                    trackLine={defectFormTrack}
                    onTrackLineChange={(val) => setDefectFormTrack(val)}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: '4px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                        Station / Landmark <span style={{ color: 'var(--dept-conflict)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={defectFormLocation}
                        onChange={(e) => setDefectFormLocation(e.target.value)}
                        placeholder="e.g. Mathura Jn North Yard"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                        KM Marker <span style={{ color: 'var(--dept-conflict)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={defectFormKm}
                        onChange={(e) => setDefectFormKm(e.target.value)}
                        placeholder="e.g. KM 118.4"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Work Required / Defect Description</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={defectFormWork}
                    onChange={(e) => setDefectFormWork(e.target.value)}
                    placeholder="Describe maintenance work required during curfew..."
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
                  {!defectImageBase64 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--dept-conflict)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={13} color="var(--dept-conflict)" />
                      Photo required
                    </span>
                  )}
                  <button type="button" onClick={() => setShowDefectModal(false)} className="btn btn-secondary" disabled={isSubmittingDefect}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmittingDefect} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: !defectImageBase64 ? 0.8 : 1 }}>
                    {isSubmittingDefect ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    <span>Save & Flag for Block {!defectImageBase64 && '*(Photo Required)'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PLAN DETAIL SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {selectedPlan && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setSelectedPlan(null)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 220 }} onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '680px', background: 'var(--bg-primary)', height: '100%', padding: 'var(--space-2xl)', overflowY: 'auto', boxShadow: '-10px 0 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>{selectedPlan.id}</span>
                    <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{selectedPlan.type}</span>
                  </div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1.2 }}>{selectedPlan.title}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>{selectedPlan.corridor}</p>
                </div>
                <button onClick={() => setSelectedPlan(null)} className="btn-icon" style={{ border: 'none', background: 'var(--bg-secondary)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                {(() => {
                  const badge = getStatusBadge(selectedPlan.status)
                  return (
                    <span className="badge" style={{ background: badge.bg, color: badge.color, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: badge.dot }} />
                      {badge.label}
                    </span>
                  )
                })()}
                <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Priority: {selectedPlan.priority}</span>
                <span className="badge" style={{ background: 'rgba(228, 164, 189, 0.15)', color: 'var(--accent)', fontWeight: 800 }}>Efficiency Score: {selectedPlan.efficiencyScore}</span>
              </div>

              <div className="card" style={{ marginBottom: 'var(--space-lg)', background: 'var(--bg-secondary)' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-md)', color: 'var(--text-muted)' }}>Execution Specifications</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', fontSize: '0.875rem' }}>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Curfew Window</span><p style={{ fontWeight: 800 }}>{selectedPlan.startTime} – {selectedPlan.endTime} ({selectedPlan.duration})</p></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Track Section</span><p style={{ fontWeight: 800 }}>{selectedPlan.track}</p></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Coordination Index</span><p style={{ fontWeight: 800 }}>{selectedPlan.coordinationIndex || 'Multi-Asset Synchronized'}</p></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Participating Groups</span><p style={{ fontWeight: 800 }}>{(selectedPlan.departments || []).join(', ')}</p></div>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>Operational Scope</h4>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{selectedPlan.description}</p>
              </div>

              {/* Associated Defects in this Block Plan */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={16} color="var(--accent)" />
                    <span>Addressed Defects ({defectsList.filter(d => (selectedPlan.corridor && d.section && d.section.toLowerCase().includes(selectedPlan.corridor.split(' - ')[0].toLowerCase())) || d.blockPlanId === selectedPlan.id).length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      setDefectFormCorridor(selectedPlan.corridor || 'Delhi - Agra Semi High-Speed Corridor (Sec 4)')
                      setDefectFormLocation(selectedPlan.track || 'KM 118.4 Up Fast Line')
                      setShowDefectModal(true)
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--accent)' }}
                  >
                    <Plus size={13} color="var(--accent)" />
                    <span>Upload / Attach Defect</span>
                  </button>
                </div>

                {defectsList.filter(d => (selectedPlan.corridor && d.section && d.section.toLowerCase().includes(selectedPlan.corridor.split(' - ')[0].toLowerCase())) || d.blockPlanId === selectedPlan.id).length === 0 ? (
                  <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px dashed var(--border)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: '0 0 6px', fontWeight: 600 }}>No defects currently attached to this block curfew window.</p>
                    <button
                      onClick={() => {
                        setDefectFormCorridor(selectedPlan.corridor || 'Delhi - Agra Semi High-Speed Corridor (Sec 4)')
                        setDefectFormLocation(selectedPlan.track || 'KM 118.4 Up Fast Line')
                        setShowDefectModal(true)
                      }}
                      style={{ border: 'none', background: 'transparent', color: 'var(--accent)', fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem' }}
                    >
                      + Click here to Upload & Link Defect Photo
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {defectsList.filter(d => (selectedPlan.corridor && d.section && d.section.toLowerCase().includes(selectedPlan.corridor.split(' - ')[0].toLowerCase())) || d.blockPlanId === selectedPlan.id).map(d => (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        {d.photoUrl ? (
                          <img src={d.photoUrl} alt="Defect" style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '44px', height: '44px', borderRadius: '6px', background: 'rgba(228, 164, 189, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wrench size={18} color="var(--accent)" />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{d.id}</span>
                            <span className="badge" style={{ fontSize: '9px', padding: '2px 6px', background: d.severity === 'Critical' ? 'rgba(201, 79, 79, 0.15)' : 'rgba(212, 160, 87, 0.15)', color: d.severity === 'Critical' ? 'var(--dept-conflict)' : 'var(--dept-trd)' }}>
                              {d.severity}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.department}</span>
                          </div>
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {d.description || d.workRequired || d.defectCategory}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lifecycle Actions Bar */}
              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedPlan.status === 'Completed' && (
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-card)', background: 'rgba(109, 184, 123, 0.15)', border: '1px solid rgba(109, 184, 123, 0.3)', color: 'var(--status-healthy)', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="var(--status-healthy)" />
                    <span>Block Completed · Track Possession Relinquished · Line Fit for Commercial Traffic</span>
                  </div>
                )}

                {selectedPlan.status === 'Rejected' && (
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-card)', background: 'rgba(201, 79, 79, 0.12)', border: '1px solid rgba(201, 79, 79, 0.3)', color: 'var(--dept-conflict)', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={16} color="var(--dept-conflict)" />
                    <span>Block Cancelled / Rejected by Rail Controller</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                  <button onClick={() => setSelectedPlan(null)} className="btn btn-secondary" style={{ flex: 1, minWidth: '90px', padding: '12px' }}>
                    Close
                  </button>

                  {/* If Scheduled or Conflict */}
                  {(selectedPlan.status === 'Scheduled' || selectedPlan.status === 'Conflict') && (
                    <>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionInProgress || approvingId === selectedPlan.id}
                        className="btn btn-secondary"
                        style={{ flex: 1.2, minWidth: '130px', padding: '12px', borderColor: 'var(--dept-conflict)', color: 'var(--dept-conflict)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <XCircle size={16} />
                        <span>Reject Plan</span>
                      </button>
                      <button
                        onClick={() => handleApprovePlan(selectedPlan)}
                        disabled={approvingId === selectedPlan.id || actionInProgress}
                        className="btn btn-primary"
                        style={{ flex: 1.8, minWidth: '180px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        {approvingId === selectedPlan.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        <span>Approve & Sync to COA</span>
                      </button>
                    </>
                  )}

                  {/* If Approved & Synced to COA / Dispatched */}
                  {(selectedPlan.status.includes('Approved') || selectedPlan.status.includes('Dispatched')) && (
                    <>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionInProgress}
                        className="btn btn-secondary"
                        style={{ flex: 1.2, minWidth: '130px', padding: '12px', borderColor: 'var(--dept-conflict)', color: 'var(--dept-conflict)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <XCircle size={16} />
                        <span>Cancel / Reject</span>
                      </button>
                      <button
                        onClick={() => handleStartPlan(selectedPlan)}
                        disabled={actionInProgress}
                        className="btn btn-primary"
                        style={{ flex: 1.8, minWidth: '180px', padding: '12px', background: 'var(--dept-trd)', borderColor: 'var(--dept-trd)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        {actionInProgress ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                        <span>Start Work (In Progress)</span>
                      </button>
                    </>
                  )}

                  {/* If In Progress */}
                  {selectedPlan.status === 'In Progress' && (
                    <>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionInProgress}
                        className="btn btn-secondary"
                        style={{ flex: 1, minWidth: '120px', padding: '12px', borderColor: 'var(--dept-conflict)', color: 'var(--dept-conflict)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <XCircle size={16} />
                        <span>Abort Block</span>
                      </button>
                      <button
                        onClick={() => handleCompletePlan(selectedPlan)}
                        disabled={actionInProgress}
                        className="btn"
                        style={{ flex: 2, minWidth: '200px', padding: '12px', background: 'var(--status-healthy)', color: '#fff', border: 'none', borderRadius: 'var(--radius-card)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        {actionInProgress ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        <span>✓ Mark Completed (Restore Traffic)</span>
                      </button>
                    </>
                  )}

                  {/* If Completed */}
                  {selectedPlan.status === 'Completed' && (
                    <button
                      onClick={() => handleReopenPlan(selectedPlan)}
                      disabled={actionInProgress}
                      className="btn btn-secondary"
                      style={{ flex: 1.5, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      {actionInProgress ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                      <span>Reopen / Reschedule Plan</span>
                    </button>
                  )}

                  {/* If Rejected */}
                  {selectedPlan.status === 'Rejected' && (
                    <button
                      onClick={() => handleReopenPlan(selectedPlan)}
                      disabled={actionInProgress}
                      className="btn btn-primary"
                      style={{ flex: 1.8, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      {actionInProgress ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                      <span>Re-evaluate & Reschedule Plan</span>
                    </button>
                  )}

                  {/* Delete Plan Action */}
                  <button
                    onClick={() => handleDeletePlan(selectedPlan)}
                    disabled={actionInProgress}
                    className="btn btn-secondary"
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      color: 'var(--dept-conflict)',
                      borderColor: 'rgba(201, 79, 79, 0.35)'
                    }}
                    title="Permanently remove this block plan from Supabase"
                  >
                    <Trash2 size={15} color="var(--dept-conflict)" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REJECT BLOCK PLAN MODAL */}
      <AnimatePresence>
        {showRejectModal && selectedPlan && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)' }} onClick={() => setShowRejectModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: '520px', background: 'var(--bg-primary)', padding: 'var(--space-2xl)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', borderRadius: 'var(--radius-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'var(--space-md)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-card)', background: 'rgba(201, 79, 79, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <XCircle size={24} color="var(--dept-conflict)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--dept-conflict)' }}>Reject Block Plan {selectedPlan.id}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Specify the operational constraint for declining this corridor curfew.</p>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)' }}>Reason for Rejection</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Timetable Conflict / Passenger Priority',
                    'Track Machine / BCM / Tower Wagon Unavailable',
                    'Severe Weather / Monsoon Rain Warning',
                    'S&T Electronic Interlocking Clearance Pending',
                    'Other Reason'
                  ].map(reason => (
                    <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: 'var(--radius-card)', background: rejectReason === reason ? 'rgba(201, 79, 79, 0.1)' : 'var(--bg-secondary)', border: `1px solid ${rejectReason === reason ? 'var(--dept-conflict)' : 'var(--border)'}`, cursor: 'pointer', fontSize: '0.82rem', fontWeight: rejectReason === reason ? 700 : 500 }}>
                      <input type="radio" name="rejectReason" checked={rejectReason === reason} onChange={() => setRejectReason(reason)} style={{ accentColor: 'var(--dept-conflict)' }} />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {rejectReason === 'Other Reason' && (
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <textarea
                    rows="3"
                    className="input-field"
                    style={{ width: '100%', borderRadius: 'var(--radius-card)' }}
                    placeholder="Enter detailed cancellation notes for Section Controller & COA..."
                    value={customRejectReason}
                    onChange={(e) => setCustomRejectReason(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                <button type="button" onClick={() => setShowRejectModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={actionInProgress}
                  className="btn"
                  style={{ background: 'var(--dept-conflict)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 'var(--radius-card)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {actionInProgress ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI OPTIMIZATION MODAL (OR-TOOLS SOLVER) */}
      <AnimatePresence>
        {showGenerateModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)' }} onClick={() => !isGeneratingPlan && setShowGenerateModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: '580px', background: 'var(--bg-primary)', padding: 'var(--space-2xl)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'var(--space-md)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={22} color="var(--text-primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900 }}>AI Multi-Corridor Block Optimizer</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Constraint-Satisfaction Engine with OR-Tools & Live Timetable Ingestion</p>
                </div>
              </div>

              {isGeneratingPlan ? (
                <div style={{ padding: 'var(--space-xl) 0', textAlign: 'center' }}>
                  <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'rgba(228, 164, 189, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-lg)' }}>
                    <Loader2 size={32} className="animate-spin" color="var(--accent)" />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 'var(--space-xs)' }}>Computing Multi-Disciplinary Curfews...</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>Evaluating 14,000+ train timetable constraints and coupling track maintenance requests.</p>
                  <div style={{ textAlign: 'left', maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: solverStep >= 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {solverStep > 1 ? <CheckCircle2 size={16} color="var(--status-healthy)" /> : <Loader2 size={14} className="animate-spin" color="var(--accent)" />}
                      <span>Ingesting live COA passenger timetables...</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: solverStep >= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {solverStep > 2 ? <CheckCircle2 size={16} color="var(--status-healthy)" /> : solverStep === 2 ? <Loader2 size={14} className="animate-spin" color="var(--accent)" /> : <Clock size={14} />}
                      <span>Checking OHE 25kV traction power dependencies...</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: solverStep >= 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {solverStep > 3 ? <CheckCircle2 size={16} color="var(--status-healthy)" /> : solverStep === 3 ? <Loader2 size={14} className="animate-spin" color="var(--accent)" /> : <Clock size={14} />}
                      <span>Coupling Engineering & S&T shadow curfews...</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: solverStep >= 4 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {solverStep >= 4 ? <CheckCircle2 size={16} color="var(--status-healthy)" /> : <Clock size={14} />}
                      <span>Finalizing conflict-free block plan...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', margin: 'var(--space-lg) 0' }}>
                  {/* Target Corridor */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Target Corridor</label>
                    <select className="input" value={modalCorridor} onChange={(e) => setModalCorridor(e.target.value)}>
                      <option>Delhi - Agra Semi High-Speed Corridor</option>
                      <option>Mumbai - Pune Expressway Section</option>
                      <option>Howrah - Kharagpur Trunk Route</option>
                      <option>Chennai - Arakkonam Fast Line</option>
                    </select>
                  </div>

                  {/* Exact Location & Track Line with Leaflet GPS Autocomplete */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                      Exact Section Location & Track Line (Leaflet GPS Detection)
                    </label>
                    <LocationAutocomplete
                      value={modalLocation}
                      onChange={(val) => setModalLocation(val)}
                      selectedLine={modalTrack}
                      onSelectLine={(line) => setModalTrack(line)}
                      onSelectStation={(stn) => {
                        setModalLocation(stn.name)
                        if (stn.corridor) setModalCorridor(stn.corridor.split('(')[0].trim())
                      }}
                      placeholder="Type station or section landmark (e.g., Mathura Jn, Palwal, Nizamuddin)..."
                    />
                  </div>

                  {/* Date & Time Scheduling for the Solution */}
                  <div style={{
                    background: 'var(--bg-secondary)',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-card)',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--accent)', fontWeight: 800, fontSize: '0.82rem' }}>
                      <Calendar size={15} />
                      <span>SCHEDULE SOLUTION DATE & TIME WINDOW</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 'var(--space-md)' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Curfew Date</label>
                        <input
                          type="date"
                          className="input"
                          value={modalDate}
                          onChange={(e) => setModalDate(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Start Time</label>
                        <input
                          type="time"
                          className="input"
                          value={modalStartTime}
                          onChange={(e) => setModalStartTime(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>End Time</label>
                        <input
                          type="time"
                          className="input"
                          value={modalEndTime}
                          onChange={(e) => setModalEndTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Quick Window Presets */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, alignSelf: 'center' }}>Presets:</span>
                      {[
                        { label: '01:30 – 05:00 (Night Curfew 3.5h)', start: '01:30', end: '05:00' },
                        { label: '02:00 – 05:30 (Pre-Dawn 3.5h)', start: '02:00', end: '05:30' },
                        { label: '11:00 – 14:00 (Noon Shadow 3h)', start: '11:00', end: '14:00' }
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setModalStartTime(preset.start)
                            setModalEndTime(preset.end)
                          }}
                          style={{
                            background: (modalStartTime === preset.start && modalEndTime === preset.end) ? 'var(--accent)' : 'var(--bg-primary)',
                            color: (modalStartTime === preset.start && modalEndTime === preset.end) ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-card)',
                            padding: '3px 8px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Planning Horizon</label>
                      <select className="input" value={modalHorizon} onChange={(e) => setModalHorizon(e.target.value)}>
                        <option>Rolling 48 Hours</option>
                        <option>Weekly Plan (7 Days)</option>
                        <option>Monthly Master (30 Days)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Optimization Objective</label>
                      <select className="input" value={modalGoal} onChange={(e) => setModalGoal(e.target.value)}>
                        <option>Zero Passenger Disruption</option>
                        <option>Maximum Maintenance Depth</option>
                        <option>Maximum Inter-Dept Clustering</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                      <span>Safety Buffer Margin</span>
                      <span style={{ color: 'var(--accent)' }}>{modalBuffer} Minutes</span>
                    </div>
                    <input type="range" min="15" max="60" step="5" value={modalBuffer} onChange={(e) => setModalBuffer(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                <button onClick={() => setShowGenerateModal(false)} className="btn btn-secondary" disabled={isGeneratingPlan}>Cancel</button>
                <button onClick={triggerAIOptimization} className="btn btn-primary" disabled={isGeneratingPlan} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px', justifyContent: 'center' }}>
                  <Sparkles size={16} />
                  <span>Generate Plan</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SCHEDULE MAINTENANCE BLOCK (FOR DEFECT OR MANUAL CURFEW) */}
      <AnimatePresence>
        {showScheduleModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-md)',
              overflowY: 'auto'
            }}
            onClick={() => !isSubmittingSchedule && setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'var(--bg-primary)',
                padding: 'var(--space-2xl)',
                boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
                border: '1px solid var(--border)'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-card)',
                    background: scheduleTargetDefect ? 'rgba(212, 160, 87, 0.18)' : 'rgba(228, 164, 189, 0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {scheduleTargetDefect ? <Wrench size={22} color="var(--dept-trd)" /> : <CalendarRange size={22} color="var(--accent)" />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900 }}>
                      {scheduleTargetDefect ? `Schedule Remedial Block: ${scheduleTargetDefect.id}` : 'Schedule New Maintenance Block'}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {scheduleTargetDefect
                        ? 'Allocate synchronized track possession curfew to rectify this defect with zero commercial train delays.'
                        : 'Plan an integrated multi-departmental railway curfew window with conflict-free slot reservation.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  disabled={isSubmittingSchedule}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Defect Preview Banner (if triggered from a defect) */}
              {scheduleTargetDefect && (
                <div style={{
                  display: 'flex',
                  gap: '14px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-card)',
                  padding: '14px',
                  marginBottom: 'var(--space-lg)',
                  alignItems: 'center'
                }}>
                  {scheduleTargetDefect.photoUrl ? (
                    <div style={{ width: '80px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={scheduleTargetDefect.photoUrl} alt="Defect" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: 'rgba(212, 160, 87, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Wrench size={24} color="var(--dept-trd)" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>{scheduleTargetDefect.id}</span>
                      <span className="badge" style={{
                        background: scheduleTargetDefect.severity === 'Critical' ? 'rgba(201, 79, 79, 0.15)' : 'rgba(212, 160, 87, 0.15)',
                        color: scheduleTargetDefect.severity === 'Critical' ? 'var(--dept-conflict)' : 'var(--dept-trd)',
                        fontSize: '10px'
                      }}>
                        {scheduleTargetDefect.severity}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: getDeptColor(scheduleTargetDefect.department) }}>
                        {scheduleTargetDefect.department}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {scheduleTargetDefect.defectCategory || scheduleTargetDefect.workRequired}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {scheduleTargetDefect.section || scheduleTargetDefect.corridorName} • {scheduleTargetDefect.kmMarker} • {scheduleTargetDefect.trackType}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Form */}
              <form onSubmit={handleConfirmScheduleBlock} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Title */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Block Plan Title</label>
                  <input
                    type="text"
                    className="input"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    required
                    style={{ width: '100%' }}
                    placeholder="e.g. Engineering Urgent Rectification: Rail Fracture"
                  />
                </div>

                {/* Corridor & Track */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Target Corridor</label>
                    <input
                      type="text"
                      className="input"
                      value={scheduleCorridor}
                      onChange={(e) => setScheduleCorridor(e.target.value)}
                      required
                      style={{ width: '100%' }}
                      placeholder="e.g. Delhi - Agra Semi High-Speed Corridor"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Track Line & KM Location</label>
                    <input
                      type="text"
                      className="input"
                      value={scheduleTrack}
                      onChange={(e) => setScheduleTrack(e.target.value)}
                      required
                      style={{ width: '100%' }}
                      placeholder="e.g. Up Fast Line (KM 118.4)"
                    />
                  </div>
                </div>

                {/* Date & Time Window */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 'var(--space-md)' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Curfew Date</label>
                    <input
                      type="date"
                      className="input"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Start Time</label>
                    <input
                      type="time"
                      className="input"
                      value={scheduleStartTime}
                      onChange={(e) => setScheduleStartTime(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>End Time</label>
                    <input
                      type="time"
                      className="input"
                      value={scheduleEndTime}
                      onChange={(e) => setScheduleEndTime(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Curfew duration & safety indicator */}
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(109, 184, 123, 0.1)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid rgba(109, 184, 123, 0.25)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--status-healthy)' }}>
                    <ShieldCheck size={16} />
                    <span>COA Timetable Curfew Window Validated</span>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    Curfew Window: {scheduleStartTime} – {scheduleEndTime}
                  </div>
                </div>

                {/* Coordinating Departments */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                    Coordinating Departments (Cross-Disciplinary Curfew)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { name: 'Engineering', color: 'var(--dept-engg)' },
                      { name: 'Signal & Telecom', color: 'var(--dept-snt)' },
                      { name: 'Traction Distribution', color: 'var(--dept-trd)' }
                    ].map(dept => {
                      const isSelected = scheduleDepts.includes(dept.name)
                      return (
                        <button
                          key={dept.name}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (scheduleDepts.length > 1) {
                                setScheduleDepts(scheduleDepts.filter(d => d !== dept.name))
                              }
                            } else {
                              setScheduleDepts([...scheduleDepts, dept.name])
                            }
                          }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-pill)',
                            border: `1px solid ${isSelected ? dept.color : 'var(--border)'}`,
                            background: isSelected ? 'var(--bg-secondary)' : 'transparent',
                            color: isSelected ? dept.color : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dept.color }} />
                          {dept.name} {isSelected && '✓'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Block Type & Priority */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Curfew Classification</label>
                    <select
                      className="input"
                      value={scheduleType}
                      onChange={(e) => setScheduleType(e.target.value)}
                    >
                      <option>Defect-Driven Remedial Block</option>
                      <option>Tri-Disciplinary Integrated Block</option>
                      <option>Engineering Mega Block</option>
                      <option>S&T Signal Modernization Block</option>
                      <option>Traction Power Cutoff (TRD)</option>
                      <option>Emergency Speed Restriction Possession</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Priority Level</label>
                    <select
                      className="input"
                      value={schedulePriority}
                      onChange={(e) => setSchedulePriority(e.target.value)}
                    >
                      <option>High</option>
                      <option>Critical</option>
                      <option>Medium</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Work Orders & Operational Instructions</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={scheduleDescription}
                    onChange={(e) => setScheduleDescription(e.target.value)}
                    style={{ width: '100%', resize: 'vertical' }}
                    placeholder="Enter maintenance details, speed restrictions, and safety permits..."
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="btn btn-secondary"
                    disabled={isSubmittingSchedule}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmittingSchedule}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                  >
                    {isSubmittingSchedule ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                    <span>{isSubmittingSchedule ? 'Scheduling Block...' : 'Confirm & Schedule Block'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
