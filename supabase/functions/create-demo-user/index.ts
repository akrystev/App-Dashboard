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
        // Create demo user
        const { data, error } = await supabase.auth.admin.createUser({
            email: 'demo@demo.com',
            password: 'demo123',
            email_confirm: true,
            user_metadata: {
                username: 'demo',
                role: 'user'
            }
        })

        if (error) {
            // If user already exists, that's fine
            if (error.message.includes('already exists')) {
                return new Response(
                    JSON.stringify({
                        message: 'Demo account already exists',
                        email: 'demo@demo.com',
                        password: 'demo123'
                    }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }
                )
            }
            throw error
        }

        return new Response(
            JSON.stringify({
                message: 'Demo account created successfully',
                email: 'demo@demo.com',
                password: 'demo123',
                user_id: data.user.id
            }),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    } catch (err) {
        return new Response(
            JSON.stringify({
                error: err.message || 'Failed to create demo account'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
})
