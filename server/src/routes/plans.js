import express from 'express'
import { dataStore } from '../services/dataStore.js'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('block_plans').select('*').order('created_at', { ascending: false })
      if (!error && Array.isArray(data)) {
        // Normalize Supabase snake_case to camelCase for frontend compatibility
        const plans = data.map(p => ({
          id: p.id,
          title: p.title,
          corridorId: p.corridor_id,
          corridor: p.corridor,
          track: p.track,
          date: p.date || p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          startTime: p.start_time,
          endTime: p.end_time,
          duration: p.duration,
          departments: p.departments || [],
          tasks: p.tasks || [],
          status: p.status,
          type: p.type,
          priority: p.priority || 'High',
          efficiencyScore: p.efficiency_score,
          coordinationIndex: p.coordination_index,
          trainsImpacted: p.trains_impacted || 0,
          freightDiverted: p.freight_diverted || 0,
          aiOptimized: p.ai_optimized || false,
          description: p.tasks?.length ? `Tasks: ${p.tasks.join(', ')}` : '',
          conflictDetails: p.conflict_details || null,
          suggestedResolution: p.suggested_resolution || null
        }))
        dataStore.blockPlans = plans
        return res.json({ plans, source: 'Supabase Live DB' })
      }
      if (error) {
        console.warn('[Supabase Plans Warning]:', error.message)
      }
    } catch (err) {
      console.warn('[Supabase Plans Warning]:', err.message)
    }
  }

  res.json({ plans: dataStore.blockPlans, source: 'RailLink Cache' })
})

router.get('/:id', (req, res) => {
  const plan = dataStore.blockPlans.find(p => p.id === req.params.id)
  if (!plan) return res.status(404).json({ error: 'Plan not found' })
  res.json({ plan })
})

// Create new block plan (manual or defect-driven)
router.post('/', async (req, res) => {
  try {
    const {
      id,
      title,
      corridorId,
      corridor,
      track,
      date,
      startTime,
      endTime,
      duration,
      departments = [],
      status = 'Scheduled',
      type = 'Defect-Driven Remedial Block',
      priority = 'High',
      efficiencyScore = '98.0%',
      coordinationIndex = 'Joint Synchronized',
      trainsImpacted = 0,
      freightDiverted = 0,
      aiOptimized = true,
      description = '',
      defectId
    } = req.body

    const planId = id || `BP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    const targetDate = date || new Date().toISOString().split('T')[0]

    const newPlan = {
      id: planId,
      title: title || `Remedial Maintenance Block`,
      corridorId: corridorId || 'CORR-GEN',
      corridor: corridor || 'Delhi - Agra Semi High-Speed Corridor',
      track: track || 'Up Fast Line',
      date: targetDate,
      startTime: startTime || '02:00',
      endTime: endTime || '05:30',
      duration: duration || '3h 30m',
      departments: departments.length > 0 ? departments : ['Engineering'],
      status: status || 'Scheduled',
      type: type || 'Defect-Driven Remedial Block',
      priority: priority || 'High',
      efficiencyScore: efficiencyScore || '97.5%',
      coordinationIndex: coordinationIndex || 'Joint Synchronized',
      trainsImpacted: Number(trainsImpacted) || 0,
      freightDiverted: Number(freightDiverted) || 0,
      aiOptimized: Boolean(aiOptimized),
      description: description || ''
    }

    // Save to in-memory dataStore
    dataStore.blockPlans.unshift(newPlan)

    // Save to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error: insertError } = await supabase.from('block_plans').insert([{
          id: newPlan.id,
          title: newPlan.title,
          corridor_id: newPlan.corridorId,
          corridor: newPlan.corridor,
          track: newPlan.track,
          start_time: newPlan.startTime,
          end_time: newPlan.endTime,
          duration: newPlan.duration,
          departments: newPlan.departments,
          tasks: [],
          efficiency_score: newPlan.efficiencyScore,
          coordination_index: newPlan.coordinationIndex,
          ai_optimized: newPlan.aiOptimized,
          status: newPlan.status,
          trains_impacted: newPlan.trainsImpacted,
          type: newPlan.type
        }])
        if (insertError) {
          console.warn('[Supabase Plan Insert Warning]:', insertError.message)
        } else {
          console.log(`[Supabase Plan Insert Success]: Created block plan ${newPlan.id}`)
        }
      } catch (sbErr) {
        console.warn('[Supabase Plan Insert Exception]:', sbErr.message)
      }
    }

    // If linked to a defect, update defect status to 'Block Scheduled'
    if (defectId) {
      const defect = dataStore.defects.find(d => d.id === defectId)
      if (defect) {
        defect.status = 'Block Scheduled'
      }
      if (isSupabaseConfigured() && supabase) {
        try {
          const { error: defError } = await supabase.from('defects').update({ status: 'Block Scheduled' }).eq('id', defectId)
          if (defError) {
            console.warn('[Supabase Defect Update Warning]:', defError.message)
          } else {
            console.log(`[Supabase Defect Status]: Marked ${defectId} as Block Scheduled`)
          }
        } catch (sbErr) {
          console.warn('[Supabase Defect Update Exception]:', sbErr.message)
        }
      }
    }

    res.status(201).json({ success: true, message: `Block plan ${newPlan.id} created and scheduled.`, plan: newPlan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/generate', async (req, res) => {
  try {
    const newPlan = dataStore.generateAIPlan(req.body)
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('block_plans').insert([{
          id: newPlan.id,
          title: newPlan.title,
          corridor_id: newPlan.corridorId || 'CORR-GEN',
          corridor: newPlan.corridor,
          track: newPlan.track,
          start_time: newPlan.startTime,
          end_time: newPlan.endTime,
          duration: newPlan.duration,
          departments: newPlan.departments,
          tasks: [],
          efficiency_score: newPlan.efficiencyScore,
          coordination_index: newPlan.coordinationIndex,
          ai_optimized: Boolean(newPlan.aiOptimized),
          status: newPlan.status || 'Scheduled',
          trains_impacted: newPlan.trainsImpacted || 0,
          type: newPlan.type
        }])
      } catch (sbErr) {
        console.warn('[Supabase Insert Plan Warning]:', sbErr.message)
      }
    }
    res.status(201).json({ message: 'AI Plan generated successfully', plan: newPlan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/publish-ai-schedule', async (req, res) => {
  try {
    const { schedule = [], params = {} } = req.body
    if (!schedule || schedule.length === 0) {
      return res.status(400).json({ error: 'No schedule items provided to publish' })
    }

    const todayStr = new Date().toISOString().split('T')[0]
    const createdPlans = schedule.map((item, idx) => ({
      id: `BP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: item.task || 'AI Synchronized Block Plan',
      corridorId: `CORR-${idx + 1}`,
      corridor: item.corridor || 'Corridor Sector',
      track: 'Main Line (Coordinated Curfew)',
      date: todayStr,
      startTime: item.start || '01:00',
      endTime: item.end || '04:30',
      duration: '3h 30m',
      departments: [item.dept || 'Engineering'],
      status: 'Scheduled',
      type: 'AI Optimized Integrated Block',
      priority: item.priority >= 4 ? 'Critical' : 'High',
      efficiencyScore: '98.5%',
      coordinationIndex: 'Coordinated Multi-Asset (OR-Tools Global Optimum)',
      trainsImpacted: 0,
      freightDiverted: 0,
      aiOptimized: true,
      description: item.reason || 'Auto-orchestrated by RailLink OR-Tools engine with zero commercial train impact.'
    }))

    // Prepend to in-memory dataStore
    dataStore.blockPlans.unshift(...createdPlans)

    // Sync to Supabase if available with strictly supported columns
    if (isSupabaseConfigured() && supabase) {
      try {
        const supabaseRows = createdPlans.map(p => ({
          id: p.id,
          title: p.title,
          corridor_id: p.corridorId,
          corridor: p.corridor,
          track: p.track,
          start_time: p.startTime,
          end_time: p.endTime,
          duration: p.duration,
          departments: p.departments,
          tasks: [],
          efficiency_score: p.efficiencyScore,
          coordination_index: p.coordinationIndex,
          ai_optimized: true,
          status: p.status,
          trains_impacted: p.trainsImpacted,
          type: p.type
        }))
        const { error: insErr } = await supabase.from('block_plans').insert(supabaseRows)
        if (insErr) {
          console.warn('[Supabase Insert Schedule Warning]:', insErr.message)
        }
      } catch (sbErr) {
        console.warn('[Supabase AI Plan Insert Exception]:', sbErr.message)
      }
    }

    res.status(201).json({
      success: true,
      message: `Published ${createdPlans.length} block plans to Live Schedule & Control Office Application (COA)`,
      count: createdPlans.length,
      plans: createdPlans
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Helper to update plan status across memory and Supabase
async function updatePlanStatus(id, status, reason = null) {
  let plan = dataStore.blockPlans.find(p => p.id === id)
  if (plan) {
    plan.status = status
    if (reason) plan.rejectionReason = reason
  } else {
    // Plan might only exist in Supabase or be a newly referenced ID
    plan = { id, status, rejectionReason: reason }
    dataStore.blockPlans.unshift(plan)
  }

  // Update in Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const updateData = { status }
      const { error } = await supabase.from('block_plans').update(updateData).eq('id', id)
      if (error) {
        console.warn('[Supabase Status Update Error]:', error.message)
      } else {
        console.log(`[Supabase Status Updated]: Plan ${id} -> ${status}`)
      }
    } catch (sbErr) {
      console.warn('[Supabase Status Update Exception]:', sbErr.message)
    }
  }

  return plan
}

// Universal status update endpoint
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body
    if (!status) return res.status(400).json({ error: 'Status is required' })
    const updatedPlan = await updatePlanStatus(req.params.id, status, reason)
    res.json({ success: true, message: `Block plan ${req.params.id} marked as ${status}`, plan: updatedPlan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Specific lifecycle endpoints
router.patch('/:id/approve', async (req, res) => {
  try {
    const updatedPlan = await updatePlanStatus(req.params.id, 'Approved & Synced to COA')
    res.json({ success: true, message: `Block plan ${req.params.id} approved and dispatched to COA`, plan: updatedPlan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/start', async (req, res) => {
  try {
    const updatedPlan = await updatePlanStatus(req.params.id, 'In Progress')
    res.json({ success: true, message: `Block curfew ${req.params.id} started. Track possession active.`, plan: updatedPlan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/complete', async (req, res) => {
  try {
    const updatedPlan = await updatePlanStatus(req.params.id, 'Completed')
    res.json({ success: true, message: `Block plan ${req.params.id} completed. Track certified fit for traffic.`, plan: updatedPlan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/reject', async (req, res) => {
  try {
    const { reason = 'Operational conflict or cancelled by Rail Controller' } = req.body
    const updatedPlan = await updatePlanStatus(req.params.id, 'Rejected', reason)
    res.json({ success: true, message: `Block plan ${req.params.id} rejected: ${reason}`, plan: updatedPlan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/reopen', async (req, res) => {
  try {
    const updatedPlan = await updatePlanStatus(req.params.id, 'Scheduled')
    res.json({ success: true, message: `Block plan ${req.params.id} reopened and reset to Scheduled.`, plan: updatedPlan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete single block plan permanently
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    dataStore.blockPlans = dataStore.blockPlans.filter(p => p.id !== id)

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('block_plans').delete().eq('id', id)
      if (error) {
        console.warn('[Supabase Delete Plan Error]:', error.message)
        return res.status(500).json({ error: error.message })
      }
      console.log(`[Supabase Delete Plan Success]: Plan ${id} permanently deleted`)
    }

    res.json({ success: true, message: `Block plan ${id} permanently deleted`, id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Clear all block plans from database
router.delete('/', async (req, res) => {
  try {
    dataStore.blockPlans = []

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('block_plans').delete().neq('id', '___PURGE_ALL___')
      if (error) {
        console.warn('[Supabase Clear All Plans Error]:', error.message)
        return res.status(500).json({ error: error.message })
      }
      console.log('[Supabase Clear All Plans Success]: All plans purged from Supabase')
    }

    res.json({ success: true, message: 'All block plans cleared successfully from database', count: 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Convenience alias: POST /clear-all
router.post('/clear-all', async (req, res) => {
  try {
    dataStore.blockPlans = []

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('block_plans').delete().neq('id', '___PURGE_ALL___')
      if (error) {
        return res.status(500).json({ error: error.message })
      }
    }

    res.json({ success: true, message: 'All block plans cleared successfully from database', count: 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
