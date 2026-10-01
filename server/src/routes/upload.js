import express from 'express'
import { uploadTrackPhoto } from '../services/cloudinaryService.js'
import { analyzeDefectPhoto } from '../services/aiService.js'
import { config } from '../config/env.js'

const router = express.Router()

// Upload photo endpoint (accepts base64 data URI or image URL)
router.post('/photo', async (req, res) => {
  try {
    const { image, folder } = req.body
    if (!image) {
      return res.status(400).json({ error: 'Image data (base64 or URL) is required' })
    }

    const hasCloudinary = Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret)

    if (hasCloudinary) {
      try {
        const result = await uploadTrackPhoto(image, folder || 'RailLink_defects')
        return res.json(result)
      } catch (uploadErr) {
        console.warn('[Upload Warning]: Cloudinary upload failed, falling back to direct base64 storage:', uploadErr.message)
      }
    } else {
      console.warn('[Upload Info]: Cloudinary credentials not configured in environment, storing image directly.')
    }

    return res.json({
      success: true,
      url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
      format: 'image/jpeg',
      fallback: true
    })
  } catch (err) {
    console.error('[Upload Fatal Error]:', err)
    res.status(500).json({ error: err.message || 'Failed to process image' })
  }
})

/**
 * POST /api/upload/analyze
 * Run Gemini Vision AI on an already-uploaded photo URL.
 * Must be called AFTER /photo upload, BEFORE submitting the defect.
 *
 * Body: { photoUrl: "https://res.cloudinary.com/..." }
 * Returns: { isRailwayDefect, confidence, defectType, severity, description, rejectionReason, aiVerified }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { photoUrl } = req.body
    if (!photoUrl) {
      return res.status(400).json({ error: 'photoUrl is required' })
    }

    console.log(`[AI Analyze]: Running Gemini Vision on ${photoUrl}`)
    const analysis = await analyzeDefectPhoto(photoUrl)

    if (!analysis.isRailwayDefect) {
      console.warn(`[AI Analyze]: Rejected non-railway image — ${analysis.rejectionReason}`)
      return res.json({
        success: false,
        error: 'Image rejected: Not a valid railway defect photo',
        rejectionReason: analysis.rejectionReason,
        description: analysis.description,
        isRailwayDefect: false,
        confidence: analysis.confidence,
        defectType: analysis.defectType,
        severity: analysis.severity,
        aiVerified: analysis.aiVerified
      })
    }

    console.log(`[AI Analyze]: Approved — ${analysis.defectType} (${analysis.confidence}% confidence)`)
    return res.json({
      success: true,
      isRailwayDefect: true,
      confidence: analysis.confidence,
      defectType: analysis.defectType,
      severity: analysis.severity,
      description: analysis.description,
      aiVerified: analysis.aiVerified
    })
  } catch (err) {
    console.error('[AI Analyze Fatal Error]:', err)
    res.status(500).json({ error: err.message || 'AI analysis failed' })
  }
})

export default router
