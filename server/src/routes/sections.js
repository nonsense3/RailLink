import express from 'express'
import { dataStore } from '../services/dataStore.js'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const router = express.Router()

// GPS coordinates for Indian Railway corridors (real approximate coordinates)
const corridorGPS = {
  'CORR-NDLS-AGC': {
    division: 'Northern Railway',
    status: 'active_block',
    health: 76,
    points: [[28.6139, 77.209], [27.8974, 77.345], [27.1767, 78.0081]],
    defects: 0,
    blocks: 0
  },
  'CORR-CSTM-PUNE': {
    division: 'Central Railway',
    status: 'healthy',
    health: 88,
    points: [[19.076, 72.8777], [18.9388, 73.2311], [18.5204, 73.8567]],
    defects: 0,
    blocks: 0
  },
  'CORR-HWH-KGP': {
    division: 'South Eastern Railway',
    status: 'overdue',
    health: 62,
    points: [[22.5726, 88.3639], [22.4048, 87.9895], [22.3303, 87.3271]],
    defects: 0,
    blocks: 0
  },
  'CORR-MAS-AJJ': {
    division: 'Southern Railway',
    status: 'healthy',
    health: 85,
    points: [[13.0827, 80.2707], [13.1067, 80.0987], [13.1523, 79.7035]],
    defects: 0,
    blocks: 0
  }
}

router.get('/', async (req, res) => {
  let corridors = dataStore.corridors

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('corridors').select('*')
      if (!error && data && data.length > 0) {
        corridors = data.map(c => ({
          corridorId: c.id || c.corridor_id,
          name: c.name,
          nightWindowStart: c.night_window_start,
          nightWindowEnd: c.night_window_end,
          maxBlockHours: c.max_block_hours,
          typicalSpeedLimit: c.typical_speed_limit,
          dailyTrainDensity: c.daily_train_density
        }))
      }
    } catch (err) {
      console.warn('[Supabase Corridors Warning]:', err.message)
    }
  }

  // Compute defect and block counts per corridor from dataStore
  const defectCounts = {}
  const blockCounts = {}

  for (const d of dataStore.defects) {
    const cId = d.corridorId || 'CORR-NDLS-AGC'
    defectCounts[cId] = (defectCounts[cId] || 0) + 1
  }

  for (const p of dataStore.blockPlans) {
    const cId = p.corridorId || 'CORR-NDLS-AGC'
    blockCounts[cId] = (blockCounts[cId] || 0) + 1
  }

  // Enrich corridors with GPS data, defect counts, and health
  const enriched = corridors.map((c, index) => {
    const cId = c.corridorId
    const gps = corridorGPS[cId] || {
      division: 'Indian Railways',
      status: 'healthy',
      health: 80,
      points: [[22.5 + index * 2, 79.0 + index * 2]],
      defects: 0,
      blocks: 0
    }

    const dCount = defectCounts[cId] || 0
    const bCount = blockCounts[cId] || 0

    // Compute health based on defects
    const computedHealth = Math.max(50, 100 - dCount * 4)
    const computedStatus = dCount > 10 ? 'overdue' : dCount > 5 ? 'due' : bCount > 0 ? 'active_block' : 'healthy'

    return {
      id: cId,
      corridorId: cId,
      name: c.name,
      division: gps.division,
      status: computedStatus,
      health: computedHealth,
      points: gps.points,
      defects: dCount,
      blocks: bCount,
      nightWindowStart: c.nightWindowStart,
      nightWindowEnd: c.nightWindowEnd,
      maxBlockHours: c.maxBlockHours,
      typicalSpeedLimit: c.typicalSpeedLimit,
      dailyTrainDensity: c.dailyTrainDensity
    }
  })

  res.json({ corridors: enriched, source: isSupabaseConfigured() ? 'Supabase Live DB' : 'RailLink DataStore' })
})

router.get('/:id', (req, res) => {
  const corridor = dataStore.corridors.find(c => c.corridorId === req.params.id)
  if (!corridor) return res.status(404).json({ error: 'Corridor not found' })

  const gps = corridorGPS[corridor.corridorId]
  res.json({
    corridor: {
      ...corridor,
      ...(gps || {}),
      defects: dataStore.defects.filter(d => d.corridorId === corridor.corridorId).length,
      blocks: dataStore.blockPlans.filter(p => p.corridorId === corridor.corridorId).length
    }
  })
})

router.get('/:id/availability', (req, res) => {
  const corridor = dataStore.corridors.find(c => c.corridorId === req.params.id)
  if (!corridor) return res.status(404).json({ error: 'Corridor not found' })
  res.json({
    corridorId: corridor.corridorId,
    name: corridor.name,
    nightWindowStart: corridor.nightWindowStart,
    nightWindowEnd: corridor.nightWindowEnd,
    maxBlockHours: corridor.maxBlockHours,
    availabilityScore: '94.6%'
  })
})

export default router
