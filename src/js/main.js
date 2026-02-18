// Main application entry point with routing
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Router } from './router.js'

const app = document.getElementById('app')
const router = new Router(app)

// Initialize router
router.init()
