import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'RailLink',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
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
