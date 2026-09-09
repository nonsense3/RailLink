import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { dataStore } from '../services/dataStore.js'

async function seedDatabase() {
  console.log('🚆 Starting RailLink Supabase Database Seeder...')

  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase is not properly configured in server/.env!')
    process.exit(1)
  }

  try {
    // 1. Seed Corridors
    console.log('📍 Seeding Corridors...')
    const corridorsToInsert = dataStore.corridors.map(c => ({
      id: c.corridorId,
      name: c.name,
      division: 'Northern / Central Railway',
      night_window_start: c.nightWindowStart,
      night_window_end: c.nightWindowEnd,
      max_block_hours: c.maxBlockHours,
      typical_speed_limit: c.typicalSpeedLimit,
      daily_train_density: c.dailyTrainDensity,
      health: 85,
      status: 'healthy'
    }))

    const { error: corrErr } = await supabase.from('corridors').upsert(corridorsToInsert, { onConflict: 'id' })
    if (corrErr) {
      console.warn('⚠️ Could not seed corridors (run supabase_schema.sql first if table does not exist):', corrErr.message)
    } else {
      console.log(`✅ Seeded ${corridorsToInsert.length} corridors.`)
    }

    // 2. Seed Defects
    console.log('⚠️ Seeding Integrated Track Defects (TMS, SMMS, TDMS)...')
    const defectsToInsert = dataStore.defects.map(d => ({
      id: d.id,
      department: d.department,
      source_system: d.sourceSystem,
      corridor_id: d.corridorId || 'CORR-NDLS-AGC',
      corridor_name: d.corridorName || 'Delhi - Agra Corridor',
      section_id: d.sectionId || 'SEC-01',
      km_start: d.kmStart || 100.0,
      km_end: d.kmEnd || 100.5,
      track_type: d.trackType || 'Track Infrastructure',
      defect_category: d.defectCategory || 'Routine Inspection',
      severity: d.severity || 'Medium',
      overdue_days: d.overdueDays || 0,
      reported_at: d.reportedAt ? new Date(d.reportedAt).toISOString() : new Date().toISOString(),
      work_required: d.workRequired || 'Track Maintenance',
      estimated_duration_min: d.estimatedDurationMin || 180,
      status: d.status || 'Pending Block',
      photo_url: d.photoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      ai_confidence: '96.2%'
    }))

    const { error: defErr } = await supabase.from('defects').upsert(defectsToInsert, { onConflict: 'id' })
    if (defErr) {
      console.warn('⚠️ Could not seed defects:', defErr.message)
    } else {
      console.log(`✅ Seeded ${defectsToInsert.length} track defects.`)
    }

    // 3. Seed Block Requests
    console.log('📋 Seeding Departmental Block Requests...')
    const requestsToInsert = dataStore.blockRequests.map(r => ({
      id: r.id,
      department: r.department,
      corridor_id: r.corridorId,
      section: r.section,
      track: r.track,
      start_time: r.startTime,
      end_time: r.endTime,
      duration_min: r.durationMin,
      purpose: r.purpose,
      priority: r.priority,
      status: r.status
    }))

    const { error: reqErr } = await supabase.from('block_requests').upsert(requestsToInsert, { onConflict: 'id' })
    if (reqErr) {
      console.warn('⚠️ Could not seed block_requests:', reqErr.message)
    } else {
      console.log(`✅ Seeded ${requestsToInsert.length} block requests.`)
    }

    // 4. Seed Block Plans
    console.log('🗓️ Seeding Block Plans...')
    const plansToInsert = dataStore.blockPlans.map(p => ({
      id: p.id,
      title: p.title,
      corridor_id: p.corridorId,
      corridor: p.corridor,
      track: p.track,
      start_time: p.startTime,
      end_time: p.endTime,
      duration: p.duration,
      departments: p.departments,
      tasks: p.tasks || [],
      efficiency_score: p.efficiencyScore || '90%',
      coordination_index: p.coordinationIndex || 'Coordinated',
      ai_optimized: Boolean(p.aiOptimized),
      status: p.status,
      trains_impacted: p.trainsImpacted || 0,
      type: p.type || 'Integrated'
    }))

    const { error: planErr } = await supabase.from('block_plans').upsert(plansToInsert, { onConflict: 'id' })
    if (planErr) {
      console.warn('⚠️ Could not seed block_plans:', planErr.message)
    } else {
      console.log(`✅ Seeded ${plansToInsert.length} block plans.`)
    }

    console.log('🎉 RailLink database seeding process complete!')
  } catch (err) {
    console.error('Fatal seed error:', err)
  }
}

seedDatabase()
