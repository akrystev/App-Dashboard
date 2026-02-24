// Supabase client initialization
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase configuration missing!')
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
} else {
    console.log('✓ Supabase configuration loaded')
    console.log('URL:', supabaseUrl)
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage
    }
})

// Helper functions for authentication
export const auth = {
    async register(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })
        return { data, error }
    },

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        return { data, error }
    },

    async logout() {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    },

    async updatePassword(password) {
        const { data, error } = await supabase.auth.updateUser({
            password: password
        })
        return { data, error }
    },

    async onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback)
    }
}

export async function ensureUserRecord(user) {
    if (!user?.id || !user?.email) return

    const now = new Date().toISOString()
    const { error } = await supabase
        .from('users')
        .upsert(
            {
                id: user.id,
                email: user.email,
                updated_at: now
            },
            { onConflict: 'id' }
        )

    if (error) {
        console.warn('Failed to ensure users record:', error.message)
    }
}

// Check if a user is an admin - check users table (source of truth)
export async function isAdmin(userId) {
    try {
        // Check users table for admin role
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .limit(1)

        if (!userError && userData && userData.length > 0 && userData[0].role === 'admin') {
            console.log(`✓ ${userId} is admin`)
            return true
        }

        console.log(`✗ ${userId} is NOT admin`)
        return false
    } catch (err) {
        console.warn('Error checking admin status:', err)
        return false
    }
}

// Get user role - check users table first (most reliable)
export async function getUserRole(userId) {
    try {
        // Always check users table first - it's the source of truth
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .limit(1)

        if (!userError && userData && userData.length > 0) {
            const role = userData[0].role
            console.log(`User role: ${role}`)
            return role || 'user'
        }

        console.warn(`Could not find role in users table for user ${userId}`)
        return 'user'
    } catch (err) {
        console.warn('Error getting user role:', err)
        return 'user'
    }
}
