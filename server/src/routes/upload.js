import express from 'express'
import { uploadTrackPhoto } from '../services/cloudinaryService.js'

const router = express.Router()

// Upload photo endpoint (accepts base64 data URI or image URL)
router.post('/photo', async (req, res) => {
  try {
    const { image, folder } = req.body
    if (!image) {
      return res.status(400).json({ error: 'Image data (base64 or URL) is required' })
    }

    try {
      const result = await uploadTrackPhoto(image, folder || 'RailLink_defects')
      return res.json(result)
    } catch (uploadErr) {
      console.warn('[Upload Fallback]: Cloudinary upload failed, using direct payload fallback:', uploadErr.message)
      return res.json({
        success: true,
        url: image,
        format: 'image/jpeg',
        fallback: true
      })
    }
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to process image' })
  }
})

export default router
