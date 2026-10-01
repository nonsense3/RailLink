import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

async function clearDatabase() {
  console.log('🧹 Starting RailLink Supabase Database Cleanup...')

  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase is not properly configured in server/.env!')
    process.exit(1)
  }

  try {
    const tables = ['block_plans', 'block_requests', 'defects', 'corridors', 'users']
    
    for (const table of tables) {
      console.log(`🗑️ Clearing table: ${table}...`)
      // To delete all rows, we can just use a condition that is always true
      const { error } = await supabase.from(table).delete().neq('id', 'impossible-id-123')
      if (error) {
        console.warn(`⚠️ Could not clear ${table}:`, error.message)
      } else {
        console.log(`✅ Cleared ${table}.`)
      }
    }

    // Attempt to clear auth.users using admin API
    console.log(`🗑️ Attempting to clear Supabase Auth users...`)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      console.warn(`⚠️ Could not list auth users:`, listError.message)
    } else if (users && users.length > 0) {
      console.log(`Found ${users.length} auth users. Deleting them...`)
      for (const user of users) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        if (deleteError) {
          console.warn(`⚠️ Could not delete auth user ${user.email}:`, deleteError.message)
        } else {
          console.log(`✅ Deleted auth user ${user.email}.`)
        }
      }
    } else {
      console.log(`✅ No auth users found to delete.`)
    }

    console.log('🎉 RailLink database cleanup complete!')
  } catch (err) {
    console.error('Fatal clear error:', err)
  }
}

clearDatabase()
