// Main application entry point with routing
import 'bootstrap/dist/css/bootstrap.css'
import * as bootstrapBundle from 'bootstrap/dist/js/bootstrap.bundle.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Router } from './router.js'

// Make bootstrap available globally
window.bootstrap = bootstrapBundle

const app = document.getElementById('app')
const router = new Router(app)

// Initialize router
router.init()
