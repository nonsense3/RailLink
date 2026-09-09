import express from 'express'
import { dataStore } from '../services/dataStore.js'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
const router = express.Router()

router.get('/requests', async (req, res) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('block_requests').select('*').order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        return res.json({ requests: data, source: 'Supabase Live DB' })
      }
    } catch (err) {
      console.warn('[Supabase Block Requests Warning]:', err.message)
    }
  }

  res.json({ requests: dataStore.blockRequests, source: 'RailLink Cache' })
})

router.post('/requests', async (req, res) => {
  const { department, corridorId, section, track, startTime, endTime, durationMin, purpose, priority } = req.body

  const newReq = {
    id: `REQ-2025-${Math.floor(100 + Math.random() * 900)}`,
    department: department || 'Engineering',
    corridorId: corridorId || 'CORR-NDLS-AGC',
    section: section || 'Delhi - Agra Semi High-Speed Corridor (Sec 4)',
    track: track || 'Up Fast Line',
    startTime: startTime || '02:00',
    endTime: endTime || '05:30',
    durationMin: durationMin || 210,
    purpose: purpose || 'General Track Maintenance',
    priority: priority || 'High',
    status: 'Pending Review'
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('block_requests').insert([{
        id: newReq.id,
        department: newReq.department,
        corridor_id: newReq.corridorId,
        section: newReq.section,
        track: newReq.track,
        start_time: newReq.startTime,
        end_time: newReq.endTime,
        duration_min: newReq.durationMin,
        purpose: newReq.purpose,
        priority: newReq.priority,
        status: newReq.status
      }])
    } catch (err) {
      console.warn('[Supabase Insert Block Warning]:', err.message)
    }
  }

  dataStore.blockRequests.unshift(newReq)
  res.status(201).json({ request: newReq })
})

router.get('/conflicts', (req, res) => {
  const conflicts = dataStore.detectConflicts()
  res.json({ conflicts, count: conflicts.length })
})

router.post('/resolve-conflict', async (req, res) => {
  const { planId } = req.body
  const plan = dataStore.blockPlans.find(p => p.id === planId)
  if (!plan) return res.status(404).json({ error: 'Plan not found' })

  plan.status = 'Scheduled'
  plan.startTime = '02:00'
  plan.endTime = '05:30'
  plan.duration = '3h 30m'
  plan.efficiencyScore = '95%'
  plan.coordinationIndex = 'Joint Synchronized (AI-Resolved)'
  plan.aiOptimized = true
  plan.conflictDetails = null
  plan.departments = Array.from(new Set([...plan.departments, 'Engineering']))
  plan.trainsImpacted = 1
  plan.type = 'Shadow / Integrated'

  // Persist resolved status to Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('block_plans').update({
        status: 'Scheduled',
        start_time: '02:00',
        end_time: '05:30',
        duration: '3h 30m',
        efficiency_score: '95%',
        coordination_index: 'Joint Synchronized (AI-Resolved)',
        ai_optimized: true,
        trains_impacted: 1,
        type: 'Shadow / Integrated'
      }).eq('id', planId)
    } catch (err) {
      console.warn('[Supabase Resolve Conflict Warning]:', err.message)
    }
  }

  res.json({ message: 'Conflict resolved successfully', plan })
})

export default router
