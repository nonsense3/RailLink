import express from 'express'
import { generateOptimizedSchedule, getAiStatus } from '../services/aiService.js'
import { dataStore } from '../services/dataStore.js'
import { config } from '../config/env.js'

const router = express.Router()

router.get('/status', (req, res) => {
  res.json(getAiStatus())
})

router.post('/optimize-schedule', async (req, res) => {
  try {
    const requests = req.body.requests || dataStore.blockRequests
    const corridors = req.body.corridors || dataStore.corridors
    const plan = await generateOptimizedSchedule(requests, corridors)
    res.json(plan)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update API keys dynamically from the UI
router.post('/config-keys', (req, res) => {
  const { geminiKey, maptilerKey, rapidApiKey } = req.body

  if (geminiKey !== undefined) config.gemini.apiKey = geminiKey
  if (maptilerKey !== undefined) config.maptiler.apiKey = maptilerKey
  if (rapidApiKey !== undefined) config.rapidApi.key = rapidApiKey

  res.json({
    message: 'API Keys updated successfully in active session',
    geminiConfigured: Boolean(config.gemini.apiKey),
    maptilerConfigured: Boolean(config.maptiler.apiKey),
    rapidApiConfigured: Boolean(config.rapidApi.key)
  })
})

export default router
