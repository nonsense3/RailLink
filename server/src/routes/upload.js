import express from 'express'
import { uploadTrackPhoto } from '../services/cloudinaryService.js'
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

export default router
