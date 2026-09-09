import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

const DEMO_USERS = [
  {
    email: 'admin@raillink.in',
    password: 'RailLink@2025',
    name: 'Rajesh Kumar',
    role: 'admin',
    department: 'Operations',
    designation: 'Chief Operations Manager'
  },
  {
    email: 'planner@raillink.in',
    password: 'RailLink@2025',
    name: 'Priya Sharma',
    role: 'planner',
    department: 'Planning',
    designation: 'Senior Block Planner'
  },
  {
    email: 'engg@raillink.in',
    password: 'RailLink@2025',
    name: 'Vikram Singh',
    role: 'dept_head',
    department: 'Engineering',
    designation: 'Divisional Engineer (Track)'
  },
  {
    email: 'snt@raillink.in',
    password: 'RailLink@2025',
    name: 'Anita Verma',
    role: 'dept_head',
    department: 'Signal & Telecom',
    designation: 'Senior Divisional Signal Engineer'
  },
  {
    email: 'trd@raillink.in',
    password: 'RailLink@2025',
    name: 'Suresh Patel',
    role: 'dept_head',
    department: 'Traction Distribution',
    designation: 'Senior Electrical Engineer (TRD)'
  }
]

async function provisionDemoUsers() {
  console.log('🚆 Provisioning RailLink Demo Users in Supabase...')

  if (!isSupabaseConfigured() || !supabase) {
    console.error('❌ Supabase is not properly configured!')
    process.exit(1)
  }

  try {
    for (const user of DEMO_USERS) {
      console.log(`\n👤 Processing ${user.email} (${user.name})...`)
      
      // Check if user already exists in auth.users
      const { data: listData, error: listErr } = await supabase.auth.admin.listUsers()
      let existingAuthUser = null
      if (!listErr && listData?.users) {
        existingAuthUser = listData.users.find(u => u.email?.toLowerCase() === user.email.toLowerCase())
      }

      let authUserId = null

      if (existingAuthUser) {
        console.log(`  ℹ️ User ${user.email} already exists in Supabase Auth (ID: ${existingAuthUser.id}). Updating metadata & password...`)
        authUserId = existingAuthUser.id
        const { error: updateErr } = await supabase.auth.admin.updateUserById(authUserId, {
          password: user.password,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role,
            department: user.department,
            designation: user.designation
          }
        })
        if (updateErr) {
          console.warn(`  ⚠️ Could not update auth user: ${updateErr.message}`)
        } else {
          console.log(`  ✅ Auth user updated successfully with password: ${user.password}`)
        }
      } else {
        console.log(`  ➕ Creating user ${user.email} in Supabase Auth...`)
        const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role,
            department: user.department,
            designation: user.designation
          }
        })

        if (createErr) {
          console.error(`  ❌ Error creating ${user.email}:`, createErr.message)
        } else {
          authUserId = createData.user.id
          console.log(`  ✅ Auth user created successfully (ID: ${authUserId})`)
        }
      }

      // Try to insert/upsert into public.users
      const profileRecord = {
        id: authUserId || `demo-${user.role}`,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        designation: user.designation,
        updated_at: new Date().toISOString()
      }

      const { error: profErr } = await supabase.from('users').upsert(profileRecord, { onConflict: 'email' })
      if (profErr) {
        console.log(`  ℹ️ Note on public.users table: ${profErr.message}`)
      } else {
        console.log(`  ✅ Synced profile record to public.users`)
      }
    }

    console.log('\n🎉 Demo users provisioning finished!')
    console.log('Credentials Summary:')
    DEMO_USERS.forEach(u => {
      console.log(`- ${u.name} (${u.department}): ${u.email} / ${u.password}`)
    })
  } catch (err) {
    console.error('Fatal error:', err)
  }
}

provisionDemoUsers()
