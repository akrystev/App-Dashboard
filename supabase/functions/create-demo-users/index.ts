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
        // Get user accounts from request body
        const { users } = await req.json()

        if (!users || !Array.isArray(users) || users.length === 0) {
            return new Response(
                JSON.stringify({
                    error: 'Pass array of users to create. Example: {"users": [{"email": "test@example.com", "password": "SecurePass123", "role": "admin"}]}'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        const results = []

        // Create each user
        for (const userConfig of users) {
            const { email, password, role = 'user' } = userConfig

            if (!email || !password) {
                results.push({
                    email,
                    status: 'error',
                    error: 'Email and password are required'
                })
                continue
            }

            // Create user
            const { data: userData, error: userError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    role
                }
            })

            if (userError) {
                if (userError.message.includes('already exists')) {
                    results.push({ email, status: 'already exists' })

                    // Still try to update existing user if role is admin
                    if (role === 'admin') {
                        const { data: existingUsers } = await supabase
                            .from('users')
                            .select('id')
                            .eq('email', email)
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
                    }
                } else {
                    results.push({
                        email,
                        status: 'error',
                        error: userError.message
                    })
                }
            } else {
                // Create user record in users table
                await supabase.from('users').upsert({
                    id: userData.user.id,
                    email,
                    role,
                    status: 'active'
                }, { onConflict: 'id' })

                // If admin role, add to user_roles
                if (role === 'admin') {
                    await supabase.from('user_roles').upsert({
                        user_id: userData.user.id,
                        role: 'admin',
                        assigned_at: new Date().toISOString()
                    }, { onConflict: 'user_id,role' })
                }

                results.push({ email, status: 'created', role })
            }
        }

        return new Response(
            JSON.stringify({
                message: 'User account creation completed',
                results
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
