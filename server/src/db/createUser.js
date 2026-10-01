import { supabase } from '../lib/supabase.js'

async function createAdminUsers() {
  const usersToCreate = [
    { email: 'reach2sanchari@gmail.com', password: 'password123', name: 'Sanchari', role: 'employee' }
  ]

  for (const u of usersToCreate) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        name: u.name,
        role: u.role
      }
    })

    if (error) {
      console.error(`Failed to create ${u.email}:`, error.message)
    } else {
      console.log(`✅ Created user ${u.email} with password: ${u.password}`)
    }
  }
}

createAdminUsers()
