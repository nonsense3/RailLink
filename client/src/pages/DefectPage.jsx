import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RevealWrapper from '../components/layout/RevealWrapper'
import api from '../lib/api'
import LocationAutocomplete from '../components/ui/LocationAutocomplete'
import InteractiveLocationMapPicker from '../components/ui/InteractiveLocationMapPicker'
import { RAILWAY_STATIONS } from '../lib/railwayLocations'
import {
  Wrench,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Clock,
  Filter,
  Image as ImageIcon,
  Tag,
  Search,
  ExternalLink,
  Sparkles,
  Camera,
  Layers,
  ChevronDown,
  Database,
  Loader2,
  RefreshCw,
  MapPin,
  Navigation,
  Train
} from 'lucide-react'

export const INDIAN_RAILWAY_DIVISIONS = [
  { id: 'NR-DLI', name: 'Northern Railway — Delhi Division (DLI)', zone: 'NR', defaultCorridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)' },
  { id: 'NCR-AGC', name: 'North Central Railway — Agra Division (AGC)', zone: 'NCR', defaultCorridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)' },
  { id: 'NCR-JHS', name: 'North Central Railway — Jhansi Division (JHS)', zone: 'NCR', defaultCorridor: 'Mathura - Jhansi - Bhopal Trunk Route' },
  { id: 'NCR-PRYJ', name: 'North Central Railway — Prayagraj Division (PRYJ)', zone: 'NCR', defaultCorridor: 'New Delhi - Kanpur - Prayagraj Main Line' },
  { id: 'CR-CSMT', name: 'Central Railway — Mumbai CR Division (CSMT)', zone: 'CR', defaultCorridor: 'Mumbai - Pune Expressway Section (Sec 12)' },
  { id: 'CR-PUNE', name: 'Central Railway — Pune Division (PUNE)', zone: 'CR', defaultCorridor: 'Mumbai - Pune Expressway Section (Sec 12)' },
  { id: 'CR-BSL', name: 'Central Railway — Bhusawal Division (BSL)', zone: 'CR', defaultCorridor: 'Igatpuri - Bhusawal Super-Dense Route' },
  { id: 'WR-MMCT', name: 'Western Railway — Mumbai WR Division (MMCT)', zone: 'WR', defaultCorridor: 'Mumbai Suburban - Ahmedabad Corridor' },
  { id: 'WR-BRC', name: 'Western Railway — Vadodara Division (BRC)', zone: 'WR', defaultCorridor: 'Surat - Vadodara - Ahmedabad High Speed' },
  { id: 'ER-HWH', name: 'Eastern Railway — Howrah Division (HWH)', zone: 'ER', defaultCorridor: 'Howrah - Bardhaman Chord Line' },
  { id: 'SER-KGP', name: 'South Eastern Railway — Kharagpur Division (KGP)', zone: 'SER', defaultCorridor: 'Howrah - Kharagpur Trunk Route (Sec 2)' },
  { id: 'SR-MAS', name: 'Southern Railway — Chennai Division (MAS)', zone: 'SR', defaultCorridor: 'Chennai - Arakkonam Fast Line (Sec 9)' },
  { id: 'SCR-SC', name: 'South Central Railway — Secunderabad Division (SC)', zone: 'SCR', defaultCorridor: 'Secunderabad - Kazipet Fast Corridor' },
  { id: 'SWR-SBC', name: 'South Western Railway — Bengaluru Division (SBC)', zone: 'SWR', defaultCorridor: 'Bengaluru - Mysuru Double Line Section' },
  { id: 'ECR-DNR', name: 'East Central Railway — Danapur Division (DNR)', zone: 'ECR', defaultCorridor: 'Pt. Deen Dayal Upadhyaya - Danapur Quad' },
  { id: 'WCR-BPL', name: 'West Central Railway — Bhopal Division (BPL)', zone: 'WCR', defaultCorridor: 'Bhopal - Itarsi High Speed Route' },
  { id: 'NWR-JP', name: 'North Western Railway — Jaipur Division (JP)', zone: 'NWR', defaultCorridor: 'Delhi - Jaipur - Ajmer Main Line' }
]

export const ASSET_CATEGORIES_BY_DEPT = {
  'Engineering': [
    'Turnout 14A / Point & Crossing',
    'Track Ballast & Sleepers (Deep Screening)',
    'Rail Fracture / Weld Defect (USFD Flaw)',
    'Fishplate Joint & Fastenings',
    'Track Geometry / Alignment & Gauge Defect',
    'Bridge Expansion Joint / Bearing',
    'Track Bed Drainage & Formation Sink'
  ],
  'Signal & Telecom': [
    'Point Machine Motor & Lock Rod',
    'Signal Color Light LED Aspect Failure',
    'Axle Counter / Audio Frequency Track Circuit',
    'Relay Interlocking & Cable Insulation',
    'Level Crossing Interlocked Gate Mechanism',
    'Optical Fiber / Communication Cable Repeater'
  ],
  'Traction Distribution': [
    'OHE Contact & Catenary Wire Sag / Height Defect',
    'OHE Cantilever Assembly & Insulator Flashing',
    'Neutral Section & Section Insulator Breakdown',
    'Traction Substation 25kV Transformer Feeder',
    'Pantograph Clearance & Dropper Snapping',
    'Return Current Rail Bonding & Earthing Defect'
  ]
}

export const TRACK_LINES = [
  'Up Main Line',
  'Down Main Line',
  'Both Lines (Bidirectional Curfew)',
  'Up Loop / Platform Line',
  'Down Loop / Platform Line',
  'Station Yard / Shunting Neck',
  'Turnout Crossover 14A/B'
]

export default function DefectPage() {
  const [defects, setDefects] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dataSource, setDataSource] = useState('Loading...')
  const [filterDept, setFilterDept] = useState('ALL')
  const [filterSeverity, setFilterSeverity] = useState('ALL')
  const [filterDivision, setFilterDivision] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('gallery') // 'gallery' | 'table' | 'upload'
  const [selectedDefect, setSelectedDefect] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Real Upload Form States — Explicit Division, Corridor & Location Tracking
  const [formDept, setFormDept] = useState('Engineering')
  const [formSeverity, setFormSeverity] = useState('High')
  const [formDivision, setFormDivision] = useState('Northern Railway — Delhi Division (DLI)')
  const [formCorridor, setFormCorridor] = useState('Delhi - Agra Semi High-Speed Corridor (Sec 4)')
  const [formLocation, setFormLocation] = useState('New Delhi Railway Station (NDLS)')
  const [formKmMarker, setFormKmMarker] = useState('KM 0.0')
  const [formTrackLine, setFormTrackLine] = useState('Up Main Line')
  const [formAssetCategory, setFormAssetCategory] = useState('Turnout 14A / Point & Crossing')
  const [formNotes, setFormNotes] = useState('')
  const [selectedImageBase64, setSelectedImageBase64] = useState(null)
  const [selectedImagePreview, setSelectedImagePreview] = useState(null)
  const [photoError, setPhotoError] = useState(null)
  const fileInputRef = useRef(null)

  // Explicit handler when Division changes — automatically updates corridor, landmark station, KM & track line
  const handleDivisionChange = (newDivName) => {
    setFormDivision(newDivName)
    const matchedDiv = INDIAN_RAILWAY_DIVISIONS.find(d => d.name === newDivName)
    const targetCorridor = matchedDiv?.defaultCorridor || formCorridor
    if (matchedDiv?.defaultCorridor) {
      setFormCorridor(matchedDiv.defaultCorridor)
    }

    const stn = RAILWAY_STATIONS.find(s => s.division === newDivName) ||
                RAILWAY_STATIONS.find(s => s.corridor === targetCorridor)
    if (stn) {
      setFormLocation(stn.name)
      setFormKmMarker(stn.defaultKm || 'KM 0.0')
      if (stn.supportedLines && stn.supportedLines.length > 0) {
        setFormTrackLine(stn.supportedLines[0])
      }
    }
  }

  // Explicit handler when Corridor changes
  const handleCorridorChange = (newCorrName) => {
    setFormCorridor(newCorrName)
    const stn = RAILWAY_STATIONS.find(s => s.corridor === newCorrName)
    if (stn) {
      setFormLocation(stn.name)
      setFormKmMarker(stn.defaultKm || 'KM 0.0')
      if (stn.division) setFormDivision(stn.division)
      if (stn.supportedLines && stn.supportedLines.length > 0) {
        setFormTrackLine(stn.supportedLines[0])
      }
    }
  }

  // Fetch live defects from backend/Supabase
  const loadLiveDefects = async () => {
    try {
      setRefreshing(true)
      const res = await api.get('/defects')
      if (res && res.defects && res.defects.length > 0) {
        // Normalize defect objects
        const formatted = res.defects.map(d => {
          const dept = d.department || 'Engineering'
          const defaultPhoto = dept.includes('Signal') || dept.includes('S&T')
            ? 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
            : dept.includes('Traction') || dept.includes('TRD')
            ? 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80'

          // Extract division if available
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

          const locationName = d.location || (displaySection.includes('—') ? displaySection.split('—')[1]?.trim() : displaySection)

          return {
            id: d.id,
            division: division,
            sourceSystem: d.source_system || d.sourceSystem || 'TMS',
            department: dept,
            assetType: d.defectCategory || d.defect_category || d.assetType || d.track_type || d.trackType || 'Track Infrastructure',
            section: displaySection,
            location: locationName,
            rawSection: rawSection,
            kmMarker: d.kmMarker || (d.km_start ? `KM ${d.km_start}` : 'KM 104.2'),
            trackType: d.track_type || d.trackType || 'Up Main Line',
            severity: d.severity || 'Medium',
            status: d.status || 'Pending Block',
            reportedDate: d.reportedDate || (d.reportedAt ? d.reportedAt.split('T')[0] : (d.reported_at ? d.reported_at.split('T')[0] : '2025-09-08')),
            dueDate: d.dueDate || '2025-09-15',
            overdueDays: d.overdue_days || d.overdueDays || 0,
            photoUrl: d.photo_url || d.photoUrl || defaultPhoto,
            aiTags: d.aiTags || [
              division.split('—')[1]?.trim() || division,
              d.track_type || 'Up Main Line',
              d.defectCategory || d.defect_category || 'Track Infrastructure',
              d.severity === 'Critical' ? 'Priority 1 (Critical)' : d.severity === 'High' ? 'Priority 2 (High)' : 'Routine'
            ],
            aiConfidence: d.ai_confidence || d.aiConfidence || '97.4%',
            description: d.workRequired || d.work_required || d.description || 'Field defect recorded for corridor block planning.'
          }
        })
        setDefects(formatted)
        setDataSource(res.source || 'Live DB')
      }
    } catch (err) {
      console.warn('Failed to load live defects:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadLiveDefects()
  }, [])

  // Filter logic including Division
  const filteredDefects = defects.filter(d => {
    const matchDept = filterDept === 'ALL' || d.department.toLowerCase().includes(filterDept.toLowerCase())
    const matchSev = filterSeverity === 'ALL' || d.severity.toLowerCase() === filterSeverity.toLowerCase()
    const matchDiv = filterDivision === 'ALL' || (d.division && d.division.toLowerCase().includes(filterDivision.toLowerCase()))
    const matchSearch = searchQuery === '' ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.division && d.division.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.assetType && d.assetType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.section && d.section.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.location && d.location.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchDept && matchSev && matchDiv && matchSearch
  })

  // Handle Photo selection from Desktop/Mobile
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoError(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImageBase64(reader.result)
        setSelectedImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Real Defect Submission + Database Upload handler with Division & Location
  const handleUploadSubmit = async (e) => {
    e.preventDefault()

    // STRICT VALIDATION: Photo upload is strictly mandatory
    if (!selectedImageBase64) {
      setPhotoError('Field inspection photo is mandatory. Railway safety protocol requires an inspection photo before logging a defect.')
      return
    }

    setIsUploading(true)
    setPhotoError(null)

    try {
      let finalPhotoUrl = ''

      // Upload field photo to Cloudinary
      const uploadRes = await api.post('/upload/photo', {
        image: selectedImageBase64,
        folder: 'RailLink_field_inspections'
      })
      if (uploadRes && uploadRes.url) {
        finalPhotoUrl = uploadRes.url
      } else {
        throw new Error('Could not upload photo to media storage')
      }

      // Save new defect to backend API (and Supabase)
      const defectRes = await api.post('/defects', {
        department: formDept,
        severity: formSeverity,
        division: formDivision,
        corridorName: formCorridor,
        section: formCorridor,
        location: formLocation,
        kmMarker: formKmMarker,
        trackType: formTrackLine,
        assetType: formAssetCategory,
        description: formNotes,
        photoUrl: finalPhotoUrl
      })

      setIsUploading(false)
      setUploadSuccess(true)
      setSelectedImageBase64(null)
      setSelectedImagePreview(null)

      // Reload live list
      await loadLiveDefects()

      setTimeout(() => {
        setUploadSuccess(false)
        setActiveTab('gallery')
      }, 1500)
    } catch (err) {
      console.error('Upload defect failed:', err)
      setIsUploading(false)
      alert(`Upload failed: ${err.message || err}`)
    }
  }

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'Critical':
        return { bg: 'rgba(201, 79, 79, 0.15)', color: 'var(--dept-conflict)', border: 'var(--dept-conflict)' }
      case 'High':
        return { bg: 'rgba(212, 160, 87, 0.15)', color: 'var(--dept-trd)', border: 'var(--dept-trd)' }
      case 'Medium':
        return { bg: 'rgba(126, 196, 207, 0.15)', color: 'var(--dept-snt)', border: 'var(--dept-snt)' }
      default:
        return { bg: 'rgba(109, 184, 123, 0.15)', color: 'var(--status-healthy)', border: 'var(--status-healthy)' }
    }
  }

  if (loading && defects.length === 0) {
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
          Loading real defect intelligence from TMS, SMMS & TDMS via {dataSource}...
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-2xl) var(--space-xl)', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header Banner */}
      <RevealWrapper>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-xs)' }}>
              <span className="badge" style={{ background: 'rgba(228, 164, 189, 0.15)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                DEFECT SUBMISSION PORTAL
              </span>
              <span className="badge" style={{ background: 'rgba(109, 184, 123, 0.15)', color: 'var(--status-healthy)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Database size={11} /> {dataSource || 'Live DB'}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Defect <span style={{ color: 'var(--accent)' }}>Explorer</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '750px', marginTop: 'var(--space-xs)', fontSize: '1rem' }}>
              Unified defect intelligence aggregating raw feeds from TMS (Track), SMMS (Signals), and TDMS (OHE). AI auto-tagging, computer vision inspection, and priority block tagging.
            </p>
          </div>

          {/* Quick upload trigger & Sync */}
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <button
              onClick={loadLiveDefects}
              disabled={refreshing}
              className="btn btn-secondary"
              style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className="btn btn-primary"
              style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}
            >
              <Camera size={18} />
              UPLOAD INSPECTION PHOTO
            </button>
          </div>
        </div>
      </RevealWrapper>

      {/* Control Bar: Tabs & Search Filters */}
      <RevealWrapper delay={0.1}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-md) var(--space-lg)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
          border: '1px solid var(--border)'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setActiveTab('gallery')}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: activeTab === 'gallery' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'gallery' ? 'var(--bg-primary)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ImageIcon size={14} />
              Photo Grid ({filteredDefects.length})
            </button>
            <button
              onClick={() => setActiveTab('table')}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: activeTab === 'table' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'table' ? 'var(--bg-primary)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Layers size={14} />
              Structured Table
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: activeTab === 'upload' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'upload' ? 'var(--text-primary)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <UploadCloud size={14} />
              Defect Submission
            </button>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)'
            }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search asset, corridor, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  color: 'var(--text-primary)',
                  width: '200px'
                }}
              />
            </div>

            {/* Department Select */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
            >
              <option value="ALL">All Systems</option>
              <option value="Engineering">TMS (Track)</option>
              <option value="Signal">SMMS (Signals)</option>
              <option value="Traction">TDMS (Traction)</option>
            </select>

            {/* Division Filter */}
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
            >
              <option value="ALL">All Divisions</option>
              {INDIAN_RAILWAY_DIVISIONS.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            {/* Severity Select */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </RevealWrapper>

      {/* Tab 1: Photo Grid with Grayscale -> Color Hover */}
      {activeTab === 'gallery' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: 'var(--space-xl)',
          marginBottom: 'var(--space-2xl)'
        }}>
          {filteredDefects.map((item, idx) => {
            const sevStyle = getSeverityStyle(item.severity)
            return (
              <RevealWrapper key={item.id} delay={idx * 0.05}>
                <div
                  className="card"
                  onClick={() => setSelectedDefect(item)}
                  style={{
                    padding: 0,
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {/* Photo with grayscale to color hover & zoom */}
                  <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={item.photoUrl}
                      alt={item.assetType}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'grayscale(100%)',
                        transition: 'transform 0.4s var(--ease-premium), filter 0.4s var(--ease-premium)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'grayscale(0%)'
                        e.currentTarget.style.transform = 'scale(1.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'grayscale(100%)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    />
                    {/* Severity Badge over image */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: sevStyle.bg,
                      color: sevStyle.color,
                      border: `1px solid ${sevStyle.border}`,
                      backdropFilter: 'blur(8px)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {item.severity}
                    </div>

                    {/* Source System Badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: 'rgba(38,38,38,0.85)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {item.sourceSystem}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        {item.id} · {item.kmMarker}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--status-healthy)', fontWeight: 700 }}>
                        AI Match: {item.aiConfidence}
                      </span>
                    </div>

                    {/* Explicit Division Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(228, 164, 189, 0.15)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(228, 164, 189, 0.35)'
                      }}>
                        <MapPin size={11} /> {item.division}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)'
                      }}>
                        <Train size={11} /> {item.trackType}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>
                      {item.assetType}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)', lineHeight: 1.4 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{item.location}</strong> · {item.section} ({item.kmMarker})
                    </p>

                    {/* AI Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--space-md)' }}>
                      {item.aiTags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-pill)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p style={{
                      fontSize: '0.8rem',
                      lineHeight: 1.5,
                      color: 'var(--text-muted)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </RevealWrapper>
            )
          })}
        </div>
      )}

      {/* Tab 2: Structured Table */}
      {activeTab === 'table' && (
        <RevealWrapper>
          <div className="card" style={{ padding: 'var(--space-xl)', overflowX: 'auto', marginBottom: 'var(--space-2xl)' }}>
            <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 8px' }}>DEFECT ID</th>
                  <th style={{ padding: '12px 8px' }}>DIVISION & ZONE</th>
                  <th style={{ padding: '12px 8px' }}>ASSET & SYSTEM</th>
                  <th style={{ padding: '12px 8px' }}>CORRIDOR & LOCATION</th>
                  <th style={{ padding: '12px 8px' }}>SEVERITY</th>
                  <th style={{ padding: '12px 8px' }}>STATUS</th>
                  <th style={{ padding: '12px 8px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredDefects.map(d => {
                  const sevStyle = getSeverityStyle(d.severity)
                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDefect(d)}
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'background 0.2s' }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '16px 8px', fontWeight: 800, fontSize: '0.85rem' }}>{d.id}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(228, 164, 189, 0.12)',
                          color: 'var(--accent)',
                          border: '1px solid rgba(228, 164, 189, 0.25)'
                        }}>
                          <MapPin size={11} /> {d.division}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{d.assetType}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.sourceSystem} ({d.department})</div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{d.location}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.section} · {d.kmMarker} ({d.trackType})</div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{
                          background: sevStyle.bg,
                          color: sevStyle.color,
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          {d.severity}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px', fontSize: '0.85rem', fontWeight: 600 }}>{d.status}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: 'var(--radius-pill)' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDefect(d)
                          }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </RevealWrapper>
      )}

      {/* Tab 3: Defect Submission Form */}
      {activeTab === 'upload' && (
        <RevealWrapper>
          <div className="card" style={{ maxWidth: '840px', margin: '0 auto var(--space-2xl)', padding: 'var(--space-2xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-card)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UploadCloud size={24} color="var(--text-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>Defect Submission Portal</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Upload inspection photos with explicit Division, Corridor, Location geocoding and automated AI priority classification.</p>
              </div>
            </div>

            {uploadSuccess ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-2xl)',
                background: 'rgba(109, 184, 123, 0.12)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid rgba(109, 184, 123, 0.3)'
              }}>
                <CheckCircle2 size={48} color="var(--status-healthy)" style={{ margin: '0 auto var(--space-md)' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--status-healthy)' }}>Defect Logged Successfully</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Synced to live database under <strong>{formDivision}</strong> at <strong>{formLocation}</strong> ({formKmMarker}).
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                {/* Mandatory Photo Alert Warning */}
                {photoError && (
                  <div style={{
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-card)',
                    background: 'rgba(201, 79, 79, 0.12)',
                    border: '1px solid var(--dept-conflict)',
                    color: 'var(--dept-conflict)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <AlertTriangle size={20} color="var(--dept-conflict)" style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Photo Upload Required: </strong>
                      <span>{photoError}</span>
                    </div>
                  </div>
                )}

                {/* Drag and drop zone with real file picker */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: photoError
                      ? '2px dashed var(--dept-conflict)'
                      : selectedImagePreview
                      ? '2px dashed var(--status-healthy)'
                      : '2px dashed var(--accent)',
                    borderRadius: 'var(--radius-card)',
                    padding: 'var(--space-2xl)',
                    textAlign: 'center',
                    background: photoError
                      ? 'rgba(201, 79, 79, 0.05)'
                      : selectedImagePreview
                      ? 'rgba(109, 184, 123, 0.06)'
                      : 'rgba(228, 164, 189, 0.05)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {selectedImagePreview ? (
                    <div>
                      <img
                        src={selectedImagePreview}
                        alt="Upload Preview"
                        style={{ maxHeight: '180px', margin: '0 auto 12px', borderRadius: '8px', objectFit: 'contain' }}
                      />
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(109, 184, 123, 0.15)', color: 'var(--status-healthy)', padding: '4px 12px', borderRadius: 'var(--radius-card)', fontWeight: 800, fontSize: '0.85rem' }}>
                        <CheckCircle2 size={16} color="var(--status-healthy)" />
                        <span>Photo Attached · Ready for Inspection Submission</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Click to choose a different photo</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201, 79, 79, 0.15)', color: 'var(--dept-conflict)', border: '1px solid var(--dept-conflict)', padding: '3px 10px', borderRadius: 'var(--radius-card)', fontWeight: 800, fontSize: '0.72rem', marginBottom: '10px' }}>
                        <AlertTriangle size={13} color="var(--dept-conflict)" />
                        <span>MANDATORY REQUIREMENT · PHOTO REQUIRED</span>
                      </div>
                      <Camera size={36} color={photoError ? 'var(--dept-conflict)' : 'var(--accent)'} style={{ margin: '0 auto 10px' }} />
                      <p style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px', color: photoError ? 'var(--dept-conflict)' : 'inherit' }}>
                        Click or Drop Track / OHE / Signal Photo Here <span style={{ color: 'var(--dept-conflict)' }}>*</span>
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
                        Select any photo from your device. Defect cannot be logged without an inspection photograph. AI priority classification is generated from the uploaded image.
                      </p>
                    </div>
                  )}
                </div>

                {/* Live Division & Location Verification Banner (Explicit Mention) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  background: 'rgba(228, 164, 189, 0.1)',
                  border: '1px solid var(--accent)',
                  borderRadius: 'var(--radius-card)',
                  padding: '12px 18px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color="var(--accent)" />
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Target Railway Division</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{formDivision}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Navigation size={18} color="var(--accent)" />
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Corridor & Location Landmark</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{formLocation || 'Detecting via Leaflet GPS...'} ({formKmMarker})</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Train size={18} color="var(--accent)" />
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Track Line (Click to cycle)</span>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = TRACK_LINES.indexOf(formTrackLine)
                          const nextLine = TRACK_LINES[(idx + 1) % TRACK_LINES.length]
                          setFormTrackLine(nextLine)
                        }}
                        className="badge"
                        title="Click to cycle track line"
                        style={{
                          background: 'var(--accent)',
                          color: 'var(--text-primary)',
                          fontWeight: 800,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>{formTrackLine}</span>
                        <RefreshCw size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Zone & Division Jump Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', flexShrink: 0 }}>
                    Quick Zone / Div:
                  </span>
                  {[
                    { id: 'NR-DLI', label: 'Delhi (DLI)', name: 'Northern Railway — Delhi Division (DLI)' },
                    { id: 'NCR-AGC', label: 'Agra (AGC)', name: 'North Central Railway — Agra Division (AGC)' },
                    { id: 'CR-CSMT', label: 'Mumbai CR (CSMT)', name: 'Central Railway — Mumbai CR Division (CSMT)' },
                    { id: 'CR-PUNE', label: 'Pune (PUNE)', name: 'Central Railway — Pune Division (PUNE)' },
                    { id: 'ER-HWH', label: 'Howrah (HWH)', name: 'Eastern Railway — Howrah Division (HWH)' },
                    { id: 'SR-MAS', label: 'Chennai (MAS)', name: 'Southern Railway — Chennai Division (MAS)' },
                    { id: 'SWR-SBC', label: 'Bengaluru (SBC)', name: 'South Western Railway — Bengaluru Division (SBC)' },
                    { id: 'SCR-SC', label: 'Secunderabad (SC)', name: 'South Central Railway — Secunderabad Division (SC)' }
                  ].map(item => {
                    const isSelected = formDivision === item.name
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleDivisionChange(item.name)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-card)',
                          border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--accent)' : 'var(--bg-secondary)',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>

                {/* Section 1: Division & Corridor */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: 'var(--space-lg)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 800, fontSize: '0.85rem' }}>
                    <MapPin size={16} />
                    <span>RAILWAY JURISDICTION & DIVISION</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                        Railway Zone & Division <span style={{ color: 'var(--dept-conflict)' }}>*</span>
                      </label>
                      <select
                        className="input"
                        value={formDivision}
                        onChange={e => handleDivisionChange(e.target.value)}
                      >
                        {INDIAN_RAILWAY_DIVISIONS.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Primary zonal administration responsible for curfew authorization
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                        Corridor / Route Section <span style={{ color: 'var(--dept-conflict)' }}>*</span>
                      </label>
                      <input
                        className="input"
                        value={formCorridor}
                        onChange={e => handleCorridorChange(e.target.value)}
                        placeholder="e.g., Delhi - Agra Semi High-Speed Corridor (Sec 4)"
                        required
                      />
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Track block planning section
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Interactive Map Marking, Corridors & Track Geometry */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: 'var(--space-lg)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 800, fontSize: '0.85rem' }}>
                      <Navigation size={16} />
                      <span>MARK LOCATION ON MAP & SELECT CORRIDOR TRACK</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Click on map to mark pin or type station name to search
                    </span>
                  </div>

                  <InteractiveLocationMapPicker
                    location={formLocation}
                    onLocationChange={val => setFormLocation(val)}
                    division={formDivision}
                    onDivisionChange={val => setFormDivision(val)}
                    corridor={formCorridor}
                    onCorridorChange={val => setFormCorridor(val)}
                    kmMarker={formKmMarker}
                    onKmMarkerChange={val => setFormKmMarker(val)}
                    trackLine={formTrackLine}
                    onTrackLineChange={val => setFormTrackLine(val)}
                  />

                  {/* Manual KM Marker & Fine Calibration */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: '4px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                        Station / Landmark Text <span style={{ color: 'var(--dept-conflict)' }}>*</span>
                      </label>
                      <input
                        className="input"
                        value={formLocation}
                        onChange={e => setFormLocation(e.target.value)}
                        placeholder="e.g. Mathura Junction (MTJ) North Yard"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                        Specific KM Marker (Calibration) <span style={{ color: 'var(--dept-conflict)' }}>*</span>
                      </label>
                      <input
                        className="input"
                        value={formKmMarker}
                        onChange={e => setFormKmMarker(e.target.value)}
                        placeholder="e.g. KM 104.2"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Reporting System, Severity & Asset Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Reporting System</label>
                    <select className="input" value={formDept} onChange={e => {
                      setFormDept(e.target.value)
                      const list = ASSET_CATEGORIES_BY_DEPT[e.target.value] || []
                      if (list.length > 0) setFormAssetCategory(list[0])
                    }}>
                      <option value="Engineering">TMS (Track Management System)</option>
                      <option value="Signal & Telecom">SMMS (Signal & Telecom)</option>
                      <option value="Traction Distribution">TDMS (Traction Distribution)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Severity Level</label>
                    <select className="input" value={formSeverity} onChange={e => setFormSeverity(e.target.value)}>
                      <option value="Critical">Critical (Safety Window &lt; 48h)</option>
                      <option value="High">High (Requires Block this Week)</option>
                      <option value="Medium">Medium (Scheduled Routine)</option>
                      <option value="Low">Low (Cosmetic / Advisory)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Asset Category / Type</label>
                    <select
                      className="input"
                      value={formAssetCategory}
                      onChange={e => setFormAssetCategory(e.target.value)}
                    >
                      {(ASSET_CATEGORIES_BY_DEPT[formDept] || ASSET_CATEGORIES_BY_DEPT['Engineering']).map(asset => (
                        <option key={asset} value={asset}>{asset}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 4: Inspector Observation */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                    Inspector Observation & Field Rectification Notes
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder="Details on observed flaw (e.g. weld fracture, tongue rail wear, point machine stall, OHE dropper failure)..."
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                  {!selectedImageBase64 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--dept-conflict)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <AlertTriangle size={14} color="var(--dept-conflict)" />
                      Field photo upload is mandatory to submit
                    </span>
                  )}
                  <button type="button" onClick={() => setActiveTab('gallery')} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="btn btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: !selectedImageBase64 ? 0.75 : 1,
                      cursor: isUploading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isUploading ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px' }} />
                        <span>Uploading to Live DB...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Submit Defect Report {!selectedImageBase64 && '*(Photo Required)'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </RevealWrapper>
      )}

      {/* Defect Details Modal */}
      <AnimatePresence>
        {selectedDefect && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(5px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-md)'
            }}
            onClick={() => setSelectedDefect(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                width: '100%',
                maxWidth: '720px',
                background: 'var(--bg-primary)',
                padding: 'var(--space-2xl)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>{selectedDefect.id}</span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{selectedDefect.assetType}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(228, 164, 189, 0.15)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(228, 164, 189, 0.35)'
                    }}>
                      <MapPin size={12} /> {selectedDefect.division}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {selectedDefect.location} · {selectedDefect.section} ({selectedDefect.kmMarker})
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedDefect(null)} className="btn-icon" style={{ border: 'none', background: 'var(--bg-secondary)' }}>
                  ✕
                </button>
              </div>

              {/* Location and Administrative Summary Tiles */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-md)',
                background: 'var(--bg-secondary)',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>DIVISION</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedDefect.division}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>CORRIDOR</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedDefect.section}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>LOCATION / KM</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedDefect.kmMarker} ({selectedDefect.trackType})</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>SYSTEM / DEPT</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedDefect.sourceSystem} ({selectedDefect.department})</span>
                </div>
              </div>

              {/* Photo preview in modal */}
              <div style={{ borderRadius: '16px', overflow: 'hidden', height: '260px', marginBottom: 'var(--space-lg)', position: 'relative' }}>
                <img src={selectedDefect.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  backdropFilter: 'blur(4px)'
                }}>
                  Smart Media CDN · High-Resolution Inspection
                </div>
              </div>

              {/* AI Analysis Cards */}
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px' }}>
                  <Sparkles size={16} />
                  <span>AI Computer Vision Defect Tags</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedDefect.aiTags.map(t => (
                    <span key={t} className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>Field Inspection Report</h4>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                  {selectedDefect.description}
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedDefect(null)} className="btn btn-secondary">
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Maintenance block requested for ${selectedDefect.id}! Route to AI Planning Studio.`)
                    setSelectedDefect(null)
                  }}
                  className="btn btn-primary"
                >
                  Schedule Priority Block
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
