/**
 * Centralized Client Configuration
 * Fetches all active public API keys and credentials directly from the backend /api/config endpoint
 * loaded from server/.env
 */

let cachedConfig = {
  supabase: {
    url: 'https://cgelhhbquhzeynzwjeub.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZWxoaGJxdWh6ZXluendqZXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NDkyMDcsImV4cCI6MjEwNDQyNTIwN30.AB3F3oPl2DEsBvQzqREZZtRtj3cOGhINNmCYLtd6-nY'
  },
  cloudinary: {
    cloudName: 'eqrpvaua',
    uploadPreset: 'raillink_uploads'
  },
  maptiler: {
    apiKey: 'hngtvzu8RSIWrHIEhXsY'
  }
}

// Try restoring from localStorage if available
try {
  const stored = localStorage.getItem('raillink_server_config')
  if (stored) {
    const parsed = JSON.parse(stored)
    cachedConfig = { ...cachedConfig, ...parsed }
  }
} catch {
  // Ignore storage errors
}

let fetchPromise = null

/**
 * Fetch latest config from backend /api/config (loaded from server/.env)
 */
export async function fetchServerConfig() {
  if (fetchPromise) return fetchPromise

  fetchPromise = (async () => {
    try {
      const res = await fetch('/api/config', { headers: { Accept: 'application/json' } })
      if (res.ok) {
        const data = await res.json()
        if (data && data.success) {
          cachedConfig = {
            supabase: data.supabase || cachedConfig.supabase,
            cloudinary: data.cloudinary || cachedConfig.cloudinary,
            maptiler: data.maptiler || cachedConfig.maptiler
          }
          try {
            localStorage.setItem('raillink_server_config', JSON.stringify(cachedConfig))
          } catch {
            // Ignore
          }
          console.log('🚆 [RailLink Config]: Loaded live API keys from backend server/.env')
          return cachedConfig
        }
      }
    } catch (err) {
      console.warn('🚆 [RailLink Config]: Could not reach /api/config, using default configuration:', err.message)
    }
    return cachedConfig
  })()

  return fetchPromise
}

/**
 * Synchronous getter for current configuration
 */
export function getConfig() {
  return cachedConfig
}

// Eagerly trigger background config fetch on module load
if (typeof window !== 'undefined') {
  fetchServerConfig().catch(() => {})
}

export default getConfig
