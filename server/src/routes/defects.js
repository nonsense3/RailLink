import express from 'express'
import { dataStore } from '../services/dataStore.js'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
const router = express.Router()

// Get all defects with optional filter by department / severity / corridor
router.get('/', async (req, res) => {
  const { department, severity, corridorId } = req.query

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('defects').select('*').order('created_at', { ascending: false })
      if (department) query = query.ilike('department', `%${department}%`)
      if (severity) query = query.ilike('severity', severity)
      if (corridorId) query = query.eq('corridor_id', corridorId)

      const { data, error } = await query
      if (!error && data && data.length > 0) {
        return res.json({ defects: data, total: data.length, source: 'Supabase Live DB' })
      }
    } catch (err) {
      console.warn('[Supabase Defects Warning]:', err.message)
    }
  }

  // Graceful fallback to unified dataStore
  let list = dataStore.defects
  if (department) list = list.filter(d => d.department.toLowerCase().includes(department.toLowerCase()))
  if (severity) list = list.filter(d => d.severity.toLowerCase() === severity.toLowerCase())
  if (corridorId) list = list.filter(d => d.corridorId === corridorId)

  res.json({ defects: list, total: list.length, source: 'RailLink Cache' })
})

// Create new defect
router.post('/', async (req, res) => {
  const {
    department,
    assetType,
    division,
    section,
    location,
    kmMarker,
    trackType,
    severity,
    description,
    photoUrl
  } = req.body

  const selectedDivision = division || 'Northern Railway — Delhi Division (DLI)'
  const specificLocation = location || 'Mathura Section'
  const corridorSection = section || 'Delhi - Agra Semi High-Speed Corridor'
  const fullSectionString = `${selectedDivision} | ${corridorSection} — ${specificLocation}`

  const newDefect = {
    id: `DEF-${department ? department.substring(0, 3).toUpperCase() : 'IR'}-${Math.floor(1000 + Math.random() * 9000)}`,
    department: department || 'Engineering',
    sourceSystem: department === 'Signal & Telecom' ? 'SMMS' : department === 'Traction Distribution' ? 'TDMS' : 'TMS',
    division: selectedDivision,
    assetType: assetType || 'General Track Infrastructure',
    section: fullSectionString,
    location: specificLocation,
    corridorName: corridorSection,
    kmMarker: kmMarker || 'KM 104.2',
    trackType: trackType || 'Up Main Line',
    severity: severity || 'Medium',
    status: 'Pending Block',
    reportedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    aiTags: [
      selectedDivision.split('—')[1]?.trim() || selectedDivision,
      trackType || 'Up Main Line',
      severity === 'Critical' ? 'Priority 1 (Critical)' : severity === 'High' ? 'Priority 2 (High)' : 'Routine'
    ],
    aiConfidence: '97.8%',
    description: description || `Field inspection recorded at ${specificLocation} (${kmMarker || 'KM 104.2'}) under ${selectedDivision}.`
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      let numericKm = null
      if (kmMarker) {
        const match = kmMarker.match(/(\d+(\.\d+)?)/)
        if (match) numericKm = parseFloat(match[1])
      }

      const { error: insertError } = await supabase.from('defects').insert([{
        id: newDefect.id,
        department: newDefect.department,
        source_system: newDefect.sourceSystem,
        corridor_name: newDefect.section,
        section_id: newDefect.division,
        track_type: newDefect.trackType,
        defect_category: newDefect.assetType,
        km_start: numericKm,
        severity: newDefect.severity,
        status: newDefect.status,
        photo_url: newDefect.photoUrl,
        work_required: newDefect.description
      }])

      if (insertError) {
        console.warn('[Supabase Insert Error]:', insertError.message)
      } else {
        console.log(`[Supabase Insert Success]: Logged defect ${newDefect.id} in ${selectedDivision}`)
      }
    } catch (err) {
      console.warn('[Supabase Insert Warning]:', err.message)
    }
  }

  dataStore.defects.unshift(newDefect)
  res.status(201).json({ defect: newDefect })
})

export default router
