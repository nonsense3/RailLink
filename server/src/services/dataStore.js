import { coaTimetable, corridorSlots } from '../simulators/coa.js'

// In-memory unified repository (initialized empty — no dummy data)
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
