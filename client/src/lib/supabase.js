import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cgelhhbquhzeynzwjeub.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZWxoaGJxdWh6ZXluendqZXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NDkyMDcsImV4cCI6MjEwNDQyNTIwN30.AB3F3oPl2DEsBvQzqREZZtRtj3cOGhINNmCYLtd6-nY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

