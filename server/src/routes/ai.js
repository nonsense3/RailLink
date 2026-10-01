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
  const { maptilerKey, rapidApiKey, ollamaKey, ollamaBaseUrl, ollamaModel } = req.body

  if (maptilerKey !== undefined) config.maptiler.apiKey = maptilerKey
  if (rapidApiKey !== undefined) config.rapidApi.key = rapidApiKey
  if (ollamaKey !== undefined) config.ollama.apiKey = ollamaKey
  if (ollamaBaseUrl !== undefined) config.ollama.baseUrl = ollamaBaseUrl
  if (ollamaModel !== undefined) config.ollama.model = ollamaModel

  res.json({
    message: 'API Keys updated successfully in active session',
    ollamaConfigured: Boolean(config.ollama.apiKey || config.ollama.baseUrl),
    ollamaModel: config.ollama.model || 'gemma4',
    maptilerConfigured: Boolean(config.maptiler.apiKey),
    rapidApiConfigured: Boolean(config.rapidApi.key)
  })
})

export default router
