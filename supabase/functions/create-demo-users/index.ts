import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    try {
        const results = []

        // Create demo user
        const { data: demoData, error: demoError } = await supabase.auth.admin.createUser({
            email: 'demo@demo.com',
            password: 'demo123',
            email_confirm: true,
            user_metadata: {
                username: 'demo',
                role: 'user'
            }
        })

        if (demoError) {
            if (demoError.message.includes('already exists')) {
                results.push({ user: 'demo@demo.com', status: 'already exists' })
            } else {
                results.push({ user: 'demo@demo.com', status: 'error', error: demoError.message })
            }
        } else {
            // Create user record in users table
            await supabase.from('users').upsert({
                id: demoData.user.id,
                email: 'demo@demo.com',
                role: 'user',
                status: 'active'
            }, { onConflict: 'id' })

            results.push({ user: 'demo@demo.com', status: 'created' })
        }

        // Create admin user
        const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
            email: 'admin@demo.com',
            password: 'admin123',
            email_confirm: true,
            user_metadata: {
                username: 'admin',
                role: 'admin'
            }
        })

        if (adminError) {
            if (adminError.message.includes('already exists')) {
                results.push({ user: 'admin@demo.com', status: 'already exists' })

                // Still try to update existing admin user
                const { data: existingUsers } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', 'admin@demo.com')
                    .single()

                if (existingUsers) {
                    await supabase.from('users').update({
                        role: 'admin',
                        status: 'active'
                    }).eq('id', existingUsers.id)

                    await supabase.from('user_roles').upsert({
                        user_id: existingUsers.id,
                        role: 'admin'
                    }, { onConflict: 'user_id,role' })
                }
            } else {
                results.push({ user: 'admin@demo.com', status: 'error', error: adminError.message })
            }
        } else {
            // Create admin user record in users table
            await supabase.from('users').upsert({
                id: adminData.user.id,
                email: 'admin@demo.com',
                role: 'admin',
                status: 'active'
            }, { onConflict: 'id' })

            // Create admin role in user_roles table
            await supabase.from('user_roles').upsert({
                user_id: adminData.user.id,
                role: 'admin',
                assigned_at: new Date().toISOString()
            }, { onConflict: 'user_id,role' })

            results.push({ user: 'admin@demo.com', status: 'created' })
        }

        return new Response(
            JSON.stringify({
                message: 'Demo accounts setup completed',
                results,
                credentials: [
                    { email: 'demo@demo.com', password: 'demo123', role: 'user' },
                    { email: 'admin@demo.com', password: 'admin123', role: 'admin' }
                ]
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
})
