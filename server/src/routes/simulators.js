import express from 'express'
import { getTmsDefects } from '../simulators/tms.js'
import { getSmmsFailures } from '../simulators/smms.js'
import { getTdmsLogs } from '../simulators/tdms.js'
import { getCoaTimetable, getCorridorSlots } from '../simulators/coa.js'

const router = express.Router()

// Simulated TMS
router.get('/tms/defects', (req, res) => {
  res.json({ source: 'TMS', count: getTmsDefects().length, data: getTmsDefects() })
})

// Simulated SMMS
router.get('/smms/failures', (req, res) => {
  res.json({ source: 'SMMS', count: getSmmsFailures().length, data: getSmmsFailures() })
})

// Simulated TDMS
router.get('/tdms/logs', (req, res) => {
  res.json({ source: 'TDMS', count: getTdmsLogs().length, data: getTdmsLogs() })
})

// Simulated COA
router.get('/coa/timetable', (req, res) => {
  res.json({ source: 'COA', count: getCoaTimetable().length, data: getCoaTimetable() })
})

router.get('/coa/corridors', (req, res) => {
  res.json({ source: 'COA', count: getCorridorSlots().length, data: getCorridorSlots() })
})

export default router
