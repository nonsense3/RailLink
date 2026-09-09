import { v2 as cloudinary } from 'cloudinary'
import { config } from '../config/env.js'

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
})

/**
 * Extract Cloudinary public_id from a secure/insecure Cloudinary CDN image URL
 * E.g., https://res.cloudinary.com/eqrpvaua/image/upload/v1725876543/RailLink_field_inspections/abcdef.jpg
 * Returns: 'RailLink_field_inspections/abcdef'
 */
export function getPublicIdFromUrl(photoUrl) {
  if (!photoUrl || typeof photoUrl !== 'string' || !photoUrl.includes('cloudinary.com')) {
    return null
  }
  try {
    const uploadIndex = photoUrl.indexOf('/upload/')
    if (uploadIndex === -1) return null
    let afterUpload = photoUrl.slice(uploadIndex + 8).split('?')[0]
    
    // Cloudinary URLs typically have /v1234567890/ before the public ID
    const versionMatch = afterUpload.match(/(?:^|\/)v\d+\/(.+)$/)
    let pathWithExt = versionMatch ? versionMatch[1] : afterUpload
    
    // Strip file extension
    const lastDot = pathWithExt.lastIndexOf('.')
    if (lastDot !== -1) {
      return pathWithExt.slice(0, lastDot)
    }
    return pathWithExt || null
  } catch (err) {
    console.warn('[Cloudinary Public ID Parse Error]:', err.message)
    return null
  }
}

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

/**
 * Delete a single track defect photo from Cloudinary by its URL or public_id
 */
export async function deleteTrackPhoto(photoUrlOrPublicId) {
  if (!photoUrlOrPublicId) return { success: false, message: 'No photo provided' }
  try {
    let publicId = photoUrlOrPublicId
    if (typeof photoUrlOrPublicId === 'string' && photoUrlOrPublicId.includes('cloudinary.com')) {
      publicId = getPublicIdFromUrl(photoUrlOrPublicId)
    }
    if (!publicId) {
      return { success: false, message: 'Not a valid Cloudinary photo URL or public_id' }
    }

    const res = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image'
    })
    console.log(`[Cloudinary Photo Deleted]: ${publicId} -> result: ${res.result}`)
    return { success: res.result === 'ok' || res.result === 'not found', result: res.result, publicId }
  } catch (err) {
    console.warn(`[Cloudinary Photo Delete Warning for ${photoUrlOrPublicId}]:`, err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Delete a batch of track defect photos from Cloudinary by array of URLs
 */
export async function deleteTrackPhotosByUrls(photoUrls = []) {
  if (!Array.isArray(photoUrls) || photoUrls.length === 0) {
    return []
  }
  const results = []
  for (const url of photoUrls) {
    if (url && typeof url === 'string' && url.includes('cloudinary.com')) {
      const res = await deleteTrackPhoto(url)
      results.push(res)
    }
  }
  return results
}

/**
 * Delete all track defect inspection photos from Cloudinary
 * Purges RailLink_field_inspections and RailLink_defects folders
 */
export async function deleteAllTrackPhotos() {
  const folders = ['RailLink_field_inspections', 'RailLink_defects']
  const results = []
  for (const folder of folders) {
    try {
      const res = await cloudinary.api.delete_resources_by_prefix(`${folder}/`, {
        invalidate: true
      })
      console.log(`[Cloudinary Bulk Purge]: Purged all photos in prefix ${folder}/:`, res.deleted)
      results.push({ folder, deleted: res.deleted })
    } catch (err) {
      console.warn(`[Cloudinary Bulk Purge Warning for ${folder}]:`, err.message)
    }
  }
  return results
}

export default cloudinary
