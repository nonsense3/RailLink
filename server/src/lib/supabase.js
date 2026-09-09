import { createClient } from '@supabase/supabase-js'
import { config } from '../config/env.js'

const supabaseUrl = config.supabase.url
const supabaseKey = config.supabase.serviceKey || config.supabase.anonKey

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('mock-') && !supabaseUrl.includes('placeholder'))
}
