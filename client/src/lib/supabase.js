import { createClient } from '@supabase/supabase-js'
import { getConfig } from './config'

const initialConfig = getConfig()
const supabaseUrl = initialConfig.supabase?.url || 'https://cgelhhbquhzeynzwjeub.supabase.co'
const supabaseAnonKey = initialConfig.supabase?.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZWxoaGJxdWh6ZXluendqZXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NDkyMDcsImV4cCI6MjEwNDQyNTIwN30.AB3F3oPl2DEsBvQzqREZZtRtj3cOGhINNmCYLtd6-nY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


