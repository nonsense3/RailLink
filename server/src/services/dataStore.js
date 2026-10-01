import { coaTimetable, corridorSlots } from '../simulators/coa.js'

const defaultMasterPlans = [
  {
    id: 'BP-2025-537',
    title: 'AI Multi-Department Synchronized Corridor Block',
    corridorId: 'CORR-NDLS-AGC',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    track: 'Both Lines (Coordinated curfew)',
    date: new Date().toISOString().split('T')[0],
    startTime: '01:30',
    endTime: '05:00',
    duration: '3h 30m',
    departments: ['Engineering', 'Signal & Telecom', 'Traction Distribution'],
    status: 'Scheduled',
    type: 'Tri-Disciplinary Integrated Block',
    priority: 'High',
    efficiencyScore: '98.5%',
    coordinationIndex: 'Coordinated Multi-Asset (OR-Tools Global Optimum)',
    trainsImpacted: 0,
    freightDiverted: 0,
    aiOptimized: true,
    description: 'Auto-orchestrated by RailLink OR-Tools engine with zero commercial train impact.'
  },
  {
    id: 'BP-2025-538',
    title: 'OHE Catenary & Track Tamping Integrated Curfew',
    corridorId: 'CORR-HWH-KGP',
    corridor: 'Howrah - Kharagpur Trunk Route (Sec 2)',
    track: 'Down Fast Line (KM 42.0 - 58.2)',
    date: new Date().toISOString().split('T')[0],
    startTime: '02:00',
    endTime: '05:30',
    duration: '3h 30m',
    departments: ['Engineering', 'Traction Distribution'],
    status: 'Scheduled',
    type: 'Bi-Disciplinary Integrated Block',
    priority: 'High',
    efficiencyScore: '96.2%',
    coordinationIndex: 'Joint Engineering & Electrical Curfew',
    trainsImpacted: 0,
    freightDiverted: 0,
    aiOptimized: true,
    description: 'Coupled traction power shutdown with track tamping to eliminate separate traffic curfews.'
  },
  {
    id: 'BP-2025-539',
    title: 'Electronic Interlocking & Signal Cable Replacement',
    corridorId: 'CORR-CSMT-PUNE',
    corridor: 'Mumbai - Pune Ghat Section (Sec 1)',
    track: 'Up Line (KM 104.2 - 110.8)',
    date: new Date().toISOString().split('T')[0],
    startTime: '01:00',
    endTime: '04:30',
    duration: '3h 30m',
    departments: ['Signal & Telecom'],
    status: 'Scheduled',
    type: 'Departmental Curfew',
    priority: 'High',
    efficiencyScore: '94.0%',
    coordinationIndex: 'S&T Signal Modernization',
    trainsImpacted: 1,
    freightDiverted: 0,
    aiOptimized: false,
    description: 'Routine maintenance of electronic interlocking and signal cables.'
  },
  {
    id: 'BP-2025-540',
    title: 'Deep Ballast Screening & Weld Stress Relieving',
    corridorId: 'CORR-NDLS-AGC-2',
    corridor: 'Delhi - Agra Semi High-Speed Corridor (Sec 2)',
    track: 'Up Fast Line (KM 78.4 - 86.0)',
    date: new Date().toISOString().split('T')[0],
    startTime: '00:30',
    endTime: '04:00',
    duration: '3h 30m',
    departments: ['Engineering'],
    status: 'Scheduled',
    type: 'Engineering Mega Block',
    priority: 'High',
    efficiencyScore: '99.1%',
    coordinationIndex: 'Ballast Cleaning Machine (BCM) Unit',
    trainsImpacted: 0,
    freightDiverted: 0,
    aiOptimized: true,
    description: 'Track ballast screening and weld stress relieving during zero-traffic window.'
  },
  {
    id: 'BP-2025-541',
    title: 'Point Machine Replacement & Track Circuiting',
    corridorId: 'CORR-MAS-SBC',
    corridor: 'Chennai - Bengaluru Double Line (Sec 3)',
    track: 'Yard Interlocking Lines',
    date: new Date().toISOString().split('T')[0],
    startTime: '02:30',
    endTime: '05:00',
    duration: '2h 30m',
    departments: ['Signal & Telecom', 'Engineering'],
    status: 'Conflict',
    type: 'Conflicting Slot',
    priority: 'High',
    efficiencyScore: '72.0%',
    coordinationIndex: 'Route Collision with Freight Timetable',
    trainsImpacted: 2,
    freightDiverted: 0,
    aiOptimized: false,
    description: 'Point machine replacement and track circuiting maintenance.',
    conflictDetails: 'Overlaps with scheduled container freight timetable rake at Arakkonam Jn.',
    suggestedResolution: 'Shift curfew start time by +45m to 03:15 to clear freight path.'
  }
]

export const defaultMasterDefects = [
  {
    id: 'DEF-ENG-4201',
    department: 'Engineering',
    sourceSystem: 'TMS',
    division: 'Eastern Railway — Sealdah Division (SDAH)',
    corridorId: 'CORR-SDAH',
    corridorName: 'Sealdah - Dum Dum - Naihati - Ranaghat Main Line',
    section: 'Sealdah - Dum Dum - Naihati - Ranaghat Main Line',
    location: 'Bidhan Nagar Road (BNR)',
    kmMarker: 'KM 1.1',
    trackType: 'Platform Line 1 - 5 (SEALDAH NORTH SUBURBAN EMU)',
    defectCategory: 'Rail Fracture / USFD Flaw',
    workRequired: 'Transverse fissure detected on outer rail head at KM 1.1. Emergency joggled fishplate applied; requires 52kg rail section replacement block.',
    description: 'Transverse fissure detected on outer rail head at KM 1.1. Emergency joggled fishplate applied; requires 52kg rail section replacement block.',
    severity: 'Critical',
    status: 'Pending Block Allocation',
    photoUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    overdueDays: 1,
    reportedDate: new Date().toISOString().split('T')[0],
    estimatedDurationMin: 180,
    aiConfidence: '98.2%',
    aiTags: ['Sealdah Division (SDAH)', 'Platform Line 1 - 5', 'Priority 1 (Critical)']
  },
  {
    id: 'DEF-TRD-3180',
    department: 'Traction Distribution',
    sourceSystem: 'TDMS',
    division: 'Northern Railway — Delhi Division (DLI)',
    corridorId: 'CORR-DLI',
    corridorName: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    section: 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    location: 'Mathura Jn North Yard',
    kmMarker: 'KM 118.4',
    trackType: 'Up Main Line',
    defectCategory: 'OHE Catenary Wire Sag / Height Defect',
    workRequired: 'Contact wire height dropped to 4.72m near turnout 14A. Requires tower wagon tensioning and dropper adjustment curfew.',
    description: 'Contact wire height dropped to 4.72m near turnout 14A. Requires tower wagon tensioning and dropper adjustment curfew.',
    severity: 'High',
    status: 'Pending Block Allocation',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    overdueDays: 2,
    reportedDate: new Date().toISOString().split('T')[0],
    estimatedDurationMin: 120,
    aiConfidence: '96.5%',
    aiTags: ['Delhi Division (DLI)', 'Up Main Line', 'Priority 2 (High)']
  },
  {
    id: 'DEF-SIG-5920',
    department: 'Signal & Telecom',
    sourceSystem: 'SMMS',
    division: 'Central Railway — Mumbai Division (CSMT)',
    corridorId: 'CORR-CSMT',
    corridorName: 'Mumbai - Pune Ghat Section (Sec 1)',
    section: 'Mumbai - Pune Ghat Section (Sec 1)',
    location: 'Kalyan Jn South Yard',
    kmMarker: 'KM 54.0',
    trackType: 'Down Fast Line',
    defectCategory: 'Point Machine Motor & Lock Rod',
    workRequired: 'Point machine 102B obstruction test timing exceeded 4.5 seconds. Lubrication and ground connection overhaul needed.',
    description: 'Point machine 102B obstruction test timing exceeded 4.5 seconds. Lubrication and ground connection overhaul needed.',
    severity: 'Medium',
    status: 'Pending Block Allocation',
    photoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    overdueDays: 0,
    reportedDate: new Date().toISOString().split('T')[0],
    estimatedDurationMin: 90,
    aiConfidence: '94.8%',
    aiTags: ['Mumbai Division (CSMT)', 'Down Fast Line', 'Routine']
  }
]

// In-memory unified repository
class DataStore {
  constructor() {
    this.defects = []
    this.corridors = corridorSlots
    this.timetable = coaTimetable
    this.blockRequests = []
    this.blockPlans = []
    this.syncHistory = []
  }

  // Conflict Detection Engine
  detectConflicts() {
    const conflicts = []
    for (let i = 0; i < this.blockPlans.length; i++) {
      const plan = this.blockPlans[i]
      if (plan.status === 'Conflict' || plan.conflictDetails) {
        conflicts.push({
          planId: plan.id,
          title: plan.title,
          corridor: plan.corridor,
          departments: plan.departments,
          conflictDetails: plan.conflictDetails || 'Overlapping slot request with another department or timetable restriction.',
          suggestedResolution: plan.suggestedResolution || 'Harmonize start time to multi-dept maintenance window.'
        })
      }
    }
    return conflicts
  }

  // AI Optimizer Mock (OR-Tools Constraint Engine)
  generateAIPlan(params = {}) {
    const newPlanId = `BP-2025-${Math.floor(100 + Math.random() * 900)}`
    const targetCorridor = params.corridor || 'Delhi - Agra Semi High-Speed Corridor (Sec 4)'
    const targetDate = params.date || new Date().toISOString().split('T')[0]
    const startTime = params.startTime || '01:30'
    const endTime = params.endTime || '05:00'
    const duration = params.duration || '3h 30m'

    const newPlan = {
      id: newPlanId,
      title: params.title || `AI Multi-Department Synchronized Corridor Block (${params.goal ? params.goal.split(' ')[0] : 'Optimal'})`,
      corridorId: params.corridorId || 'CORR-NDLS-AGC',
      corridor: targetCorridor,
      track: params.track || 'Both Lines (Coordinated Curfew)',
      date: targetDate,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      departments: params.departments || ['Engineering', 'Signal & Telecom', 'Traction Distribution'],
      status: 'Scheduled',
      type: 'Tri-Disciplinary Integrated Block',
      priority: 'High',
      efficiencyScore: '98.5%',
      coordinationIndex: 'Coordinated Multi-Asset (OR-Tools Global Optimum)',
      trainsImpacted: 0,
      freightDiverted: 0,
      aiOptimized: true,
      description: params.description || `Auto-orchestrated by RailLink OR-Tools engine for ${targetCorridor} on ${targetDate} (${startTime} – ${endTime}) with zero commercial train impact.`
    }

    this.blockPlans.unshift(newPlan)
    return newPlan
  }
}

export const dataStore = new DataStore()
