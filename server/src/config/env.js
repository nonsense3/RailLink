import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load from current working directory or server/.env
dotenv.config()
dotenv.config({ path: path.resolve(__dirname, '../../../server/.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || 'https://cgelhhbquhzeynzwjeub.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'eqrpvaua',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'raillink_uploads'
  },
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  rapidApi: {
    key: process.env.RAPIDAPI_KEY || '',
    host: process.env.RAPIDAPI_HOST || 'indian-railway-irctc.p.rapidapi.com'
  },
  maptiler: {
    apiKey: process.env.MAPTILER_API_KEY || ''
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || ''
  }
}

