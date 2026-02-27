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
        // Get email and password from request body
        const { email, password } = await req.json()

        if (!email || !password) {
            return new Response(
                JSON.stringify({ error: 'Email and password are required' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        // Create user
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                role: 'user'
            }
        })

        if (error) {
            // If user already exists, that's fine
            if (error.message.includes('already exists')) {
                return new Response(
                    JSON.stringify({
                        message: 'User account already exists',
                        email
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
                message: 'User account created successfully',
                email,
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
