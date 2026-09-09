import express from 'express'
import { dataStore } from '../services/dataStore.js'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { deleteTrackPhoto, deleteTrackPhotosByUrls, deleteAllTrackPhotos } from '../services/cloudinaryService.js'
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
      if (!error && Array.isArray(data)) {
        const normalized = data.map(d => {
          const dept = d.department || 'Engineering'
          const rawSection = d.corridor_name || ''
          let division = d.section_id || ''
          if (!division && rawSection.includes('|')) {
            division = rawSection.split('|')[0].trim()
          }
          if (!division) division = 'Northern Railway — Delhi Division (DLI)'

          let displaySection = rawSection
          if (rawSection.includes('|')) {
            displaySection = rawSection.split('|')[1].trim()
          }
          if (!displaySection) displaySection = 'Delhi - Agra Semi High-Speed Corridor'

          const loc = displaySection.includes('—')
            ? displaySection.split('—')[1]?.trim()
            : (displaySection.includes('-') ? displaySection.split('-').pop()?.trim() : displaySection)

          const desc = d.work_required || d.defect_category || 'Field defect reported for block planning.'

          return {
            id: d.id,
            department: dept,
            sourceSystem: d.source_system || 'TMS',
            source_system: d.source_system || 'TMS',
            division,
            section_id: division,
            corridorId: d.corridor_id,
            corridor_id: d.corridor_id,
            corridorName: displaySection,
            corridor_name: rawSection,
            section: displaySection,
            location: loc,
            kmMarker: d.km_start ? `KM ${d.km_start}` : 'KM 104.2',
            km_start: d.km_start,
            km_end: d.km_end,
            trackType: d.track_type || 'Up Main Line',
            track_type: d.track_type || 'Up Main Line',
            defectCategory: d.defect_category || 'Track Infrastructure',
            defect_category: d.defect_category || 'Track Infrastructure',
            workRequired: desc,
            work_required: desc,
            description: desc,
            severity: d.severity || 'Medium',
            status: d.status || 'Pending Block',
            photoUrl: d.photo_url || '',
            photo_url: d.photo_url || '',
            overdueDays: d.overdue_days || 0,
            overdue_days: d.overdue_days || 0,
            reportedDate: d.reported_at ? d.reported_at.split('T')[0] : (d.created_at ? d.created_at.split('T')[0] : '2026-09-09'),
            reported_at: d.reported_at,
            estimatedDurationMin: d.estimated_duration_min || 120,
            aiConfidence: d.ai_confidence || '95.4%',
            ai_confidence: d.ai_confidence || '95.4%',
            aiTags: [
              division.split('—')[1]?.trim() || division,
              d.track_type || 'Main Line',
              d.severity === 'Critical' ? 'Priority 1 (Critical)' : d.severity === 'High' ? 'Priority 2 (High)' : 'Routine'
            ]
          }
        })
        return res.json({ defects: normalized, total: normalized.length, source: 'Supabase Live DB' })
      }
      if (error) {
        console.warn('[Supabase Defects Warning]:', error.message)
      }
    } catch (err) {
      console.warn('[Supabase Defects Warning]:', err.message)
    }
  }

  // Graceful fallback to unified dataStore only if Supabase is unconfigured or errored
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

  if (!photoUrl) {
    return res.status(400).json({ error: 'Inspection photo is mandatory. Field defects cannot be logged without an inspection photo.' })
  }

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

// Update defect status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!status) return res.status(400).json({ error: 'Status is required' })

    const defect = dataStore.defects.find(d => d.id === id)
    if (defect) {
      defect.status = status
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('defects').update({ status }).eq('id', id)
        if (error) {
          console.warn('[Supabase Defect Status Error]:', error.message)
        } else {
          console.log(`[Supabase Defect Status]: ${id} -> ${status}`)
        }
      } catch (err) {
        console.warn('[Supabase Defect Status Exception]:', err.message)
      }
    }

    res.json({ success: true, message: `Defect ${id} marked as ${status}`, defect })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete single defect permanently (and wipe its photo from Cloudinary)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    let photoUrlToDelete = req.body?.photoUrl || req.query?.photoUrl || null

    // If photoUrl was not passed in request, look up from memory or Supabase
    if (!photoUrlToDelete) {
      const inMem = dataStore.defects.find(d => d.id === id)
      if (inMem?.photoUrl) photoUrlToDelete = inMem.photoUrl

      if (!photoUrlToDelete && isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.from('defects').select('photo_url').eq('id', id).single()
          if (data?.photo_url) photoUrlToDelete = data.photo_url
        } catch {}
      }
    }

    // 1. Delete inspection photo from Cloudinary if it exists
    if (photoUrlToDelete && typeof photoUrlToDelete === 'string' && photoUrlToDelete.includes('cloudinary.com')) {
      try {
        await deleteTrackPhoto(photoUrlToDelete)
      } catch (cErr) {
        console.warn(`[Cloudinary Delete Warning on Defect ${id}]:`, cErr.message)
      }
    }

    // 2. Remove from in-memory dataStore
    dataStore.defects = dataStore.defects.filter(d => d.id !== id)

    // 3. Remove from Supabase
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('defects').delete().eq('id', id)
      if (error) {
        console.warn('[Supabase Delete Error]:', error.message)
        return res.status(500).json({ error: error.message })
      }
      console.log(`[Supabase Delete Success]: Defect ${id} permanently removed`)
    }

    res.json({ success: true, message: `Defect ${id} and photo permanently deleted`, id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Clear all defects from database AND purge all defect inspection photos from Cloudinary
router.delete('/', async (req, res) => {
  try {
    // 1. Collect all photo URLs from request, memory, and Supabase before clearing
    const urlsToPurge = new Set()
    if (Array.isArray(req.body?.photoUrls)) {
      req.body.photoUrls.forEach(u => u && urlsToPurge.add(u))
    }
    dataStore.defects.forEach(d => {
      if (d.photoUrl) urlsToPurge.add(d.photoUrl)
    })

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: existingDefects } = await supabase.from('defects').select('photo_url')
        if (Array.isArray(existingDefects)) {
          existingDefects.forEach(d => {
            if (d.photo_url) urlsToPurge.add(d.photo_url)
          })
        }
      } catch (fetchErr) {
        console.warn('[Fetch Photo URLs Warning]:', fetchErr.message)
      }
    }

    // 2. Delete specific photos and bulk purge folders in Cloudinary
    try {
      if (urlsToPurge.size > 0) {
        await deleteTrackPhotosByUrls(Array.from(urlsToPurge))
      }
      await deleteAllTrackPhotos()
    } catch (cErr) {
      console.warn('[Cloudinary Bulk Purge Warning]:', cErr.message)
    }

    // 3. Purge in-memory dataStore
    dataStore.defects = []

    // 4. Purge Supabase database table
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('defects').delete().neq('id', '___PURGE_ALL___')
      if (error) {
        console.warn('[Supabase Clear All Error]:', error.message)
        return res.status(500).json({ error: error.message })
      }
      console.log('[Supabase Clear All Success]: All defects purged from Supabase')
    }

    res.json({ success: true, message: 'All defects and Cloudinary photos cleared successfully from database', count: 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Convenience alias: POST /clear-all
router.post('/clear-all', async (req, res) => {
  try {
    try {
      await deleteAllTrackPhotos()
    } catch (cErr) {
      console.warn('[Cloudinary Bulk Purge Warning]:', cErr.message)
    }

    dataStore.defects = []

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('defects').delete().neq('id', '___PURGE_ALL___')
      if (error) {
        return res.status(500).json({ error: error.message })
      }
    }

    res.json({ success: true, message: 'All defects and Cloudinary photos cleared successfully from database', count: 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Dedicated endpoint to purge Cloudinary photos
router.post('/purge-photos', async (req, res) => {
  try {
    const urls = req.body?.photoUrls || []
    if (Array.isArray(urls) && urls.length > 0) {
      await deleteTrackPhotosByUrls(urls)
    }
    const results = await deleteAllTrackPhotos()
    res.json({ success: true, message: 'Cloudinary defect photos purged successfully', results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
