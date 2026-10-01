import { supabase } from '../lib/supabase.js'

async function createAdminUsers() {
  const usersToCreate = [
    { email: 'dasouvik122005@gmail.com', password: 'password123', name: 'Souvik Das' },
    { email: 'ankitdey061@gmail.com', password: 'password123', name: 'Ankit Dey' },
    { email: 'catch2sanchari@gmail.com', password: 'password123', name: 'Sanchari' },
  ]

  for (const u of usersToCreate) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        name: u.name,
        role: 'admin' // Even though auth.js enforces it, good to have here
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
