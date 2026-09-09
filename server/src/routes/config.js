import express from 'express'
import { config } from '../config/env.js'

const router = express.Router()

/**
 * GET /api/config
 * Returns public configuration & client-safe parameters loaded from backend .env
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    supabase: {
      url: config.supabase.url,
      anonKey: config.supabase.anonKey
    },
    cloudinary: {
      cloudName: config.cloudinary.cloudName,
      uploadPreset: config.cloudinary.uploadPreset
    },
    maptiler: {
      apiKey: config.maptiler.apiKey
    },
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  })
})

export default router
