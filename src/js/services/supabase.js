// Supabase client initialization
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

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

    async onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback)
    }
}
