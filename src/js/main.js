// Main application entry point with routing
import 'bootstrap/dist/css/bootstrap.css'
import '../styles/main.css'
import * as bootstrapBundle from 'bootstrap/dist/js/bootstrap.bundle.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Router } from './router.js'
import { supabase } from './services/supabase.js'

// Make bootstrap available globally
window.bootstrap = bootstrapBundle

const app = document.getElementById('app')
const router = new Router(app)

// Recover session before initializing router
async function initApp() {
    try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            console.log('✓ Session recovered from storage')
        }
    } catch (err) {
        console.warn('Could not recover session:', err.message)
    }

    // Initialize router
    router.init()
}

// Initialize the app
initApp()
