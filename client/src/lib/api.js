import axios from 'axios'

// Dynamically resolve baseURL:
// In browser live deployment (e.g. raillink.onrender.com), ALWAYS use relative '/api'
// unless an explicit external HTTPS endpoint is specified.
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
    if (!isLocalhost) {
      const configured = import.meta.env.VITE_API_URL
      if (configured && configured.startsWith('https://')) {
        return configured
      }
      return '/api'
    }
  }
  return import.meta.env.VITE_API_URL || '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and bump timeout for uploads
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('RailLink_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Give upload and defect-creation endpoints a generous timeout
  // Render free tier cold-starts can take 30-60s before the server wakes
  if (config.url?.includes('/upload') || (config.method === 'post' && config.url?.includes('/defect'))) {
    config.timeout = 120000
  }
  return config
})

// Retry helper: exponential backoff for Network Errors / 5xx on Render
const MAX_RETRIES = 2
const RETRY_DELAY_BASE = 3000 // 3s, 6s

const shouldRetry = (error) => {
  // Retry on network errors (cold start / timeout) or server 5xx
  if (!error.response && (error.code === 'ECONNABORTED' || error.message === 'Network Error')) return true
  if (error.response?.status >= 500) return true
  return false
}

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config
    if (!config) return Promise.reject(error.response?.data || error.message)

    config.__retryCount = config.__retryCount || 0

    if (shouldRetry(error) && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1
      const delay = RETRY_DELAY_BASE * config.__retryCount
      console.warn(`[RailLink API] Retry ${config.__retryCount}/${MAX_RETRIES} for ${config.url} in ${delay}ms…`)
      await new Promise(r => setTimeout(r, delay))
      return api.request(config)
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('RailLink_token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

/**
 * Wake up the Render backend before heavy operations.
 * Render free tier spins down after 15 min of inactivity;
 * calling /api/health first triggers the cold-start so that
 * the real request doesn't time out.
 */
export async function wakeUpServer() {
  try {
    await api.get('/health', { timeout: 90000 })
    return true
  } catch {
    return false
  }
}

export default api
