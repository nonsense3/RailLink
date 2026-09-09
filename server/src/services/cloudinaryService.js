import { v2 as cloudinary } from 'cloudinary'
import { config } from '../config/env.js'

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
})

/**
 * Upload base64 or image buffer directly to Cloudinary
 */
export async function uploadTrackPhoto(fileData, folder = 'RailLink_defects') {
  try {
    const uploadRes = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: 'image',
      tags: ['RailLink', 'track_inspection', 'railway_defect']
    })

    return {
      success: true,
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      format: uploadRes.format,
      bytes: uploadRes.bytes
    }
  } catch (err) {
    console.error('[Cloudinary Upload Error]:', err.message)
    throw err
  }
}

export default cloudinary
