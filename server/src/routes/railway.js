import express from 'express'
import { config } from '../config/env.js'
import { getLiveTrainStatus, getCorridorLiveWeather } from '../services/railwayService.js'
import { coaTimetable } from '../simulators/coa.js'

const router = express.Router()

// Check Railway API configuration status
router.get('/status', (req, res) => {
  const hasKey = Boolean(config.rapidApi?.key && config.rapidApi.key.trim().length > 0)
  res.json({
    status: 'ok',
    rapidApiConfigured: hasKey,
    rapidApiHost: config.rapidApi?.host || 'indian-railway-irctc.p.rapidapi.com',
    message: hasKey
      ? 'Live RapidAPI credentials configured and ready'
      : 'RapidAPI key not yet set in server/.env — serving dynamic intelligent rail simulation'
  })
})

// Get live running status for a specific train
router.get('/live-status/:trainNo', async (req, res) => {
  try {
    const { trainNo } = req.params
    const data = await getLiveTrainStatus(trainNo)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get live weather and rail temperature for corridor GPS
router.get('/weather', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6139
    const lon = parseFloat(req.query.lon || req.query.lng) || 77.209
    const data = await getCorridorLiveWeather(lat, lon)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get corridor train fleet with real-time status
router.get('/corridor-trains', async (req, res) => {
  try {
    const corridorId = req.query.corridorId || 'CORR-NDLS-AGC'
    const trains = coaTimetable.filter(t => !corridorId || t.corridorId === corridorId)

    // Enrich top passenger trains with live running delay
    const enriched = await Promise.all(
      trains.map(async (t) => {
        if (t.trainNo.match(/^\d+$/)) {
          const live = await getLiveTrainStatus(t.trainNo)
          return {
            ...t,
            liveStatus: live.status,
            currentLocation: live.currentStation || live.data?.current_station_name || 'En Route',
            delayMinutes: live.delayMinutes || 0,
            speedKmH: live.speedKmH || 120
          }
        }
        return {
          ...t,
          liveStatus: 'On Time (Freight Heavy Haul Slot)',
          currentLocation: 'Section Block 4',
          delayMinutes: 0,
          speedKmH: 75
        }
      })
    )

    res.json({
      corridorId,
      count: enriched.length,
      trains: enriched
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
