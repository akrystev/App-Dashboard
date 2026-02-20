// Supabase client initialization
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        persistSession: false,
        autoRefreshToken: false
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

// Check if a user is an admin
export async function isAdmin(userId) {
    try {
        // Check user_roles table
        const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .single()

        if (!roleError && roleData) {
            return true
        }

        // Fallback to users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

        if (!userError && userData?.role === 'admin') {
            return true
        }

        return false
    } catch (err) {
        console.warn('Error checking admin status:', err)
        return false
    }
}

// Get user role
export async function getUserRole(userId) {
    try {
        // Check user_roles table first
        const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .order('assigned_at', { ascending: false })
            .limit(1)
            .single()

        if (!roleError && roleData) {
            return roleData.role
        }

        // Fallback to users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

        if (!userError && userData?.role) {
            return userData.role
        }

        return 'user'
    } catch (err) {
        console.warn('Error getting user role:', err)
        return 'user'
    }
}
