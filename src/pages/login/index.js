// Login Page
import { Page } from '../page.js'
import { auth } from '../../js/services/supabase.js'
import './style.css'
import template from './index.html?raw'

export class LoginPage extends Page {
    constructor(container, router) {
        super(container, router)
        this.title = 'Login - App Dashboard'
        this.isLoading = false
    }

    async render() {
        this.container.innerHTML = template
        this.setupEventListeners()
        this.setPageTitle()
    }

    setupEventListeners() {
        const loginForm = this.container.querySelector('#loginForm')
        const links = this.container.querySelectorAll('a[href^="#"]')

        // Form submission
        loginForm.addEventListener('submit', (e) => this.handleLogin(e))

        // Navigation links
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault()
                const path = link.getAttribute('href').substring(1) || '/'
                this.router.push(path)
            })
        })
    }

    async handleLogin(e) {
        e.preventDefault()

        if (this.isLoading) return

        const email = this.container.querySelector('#email').value.trim()
        const password = this.container.querySelector('#password').value

        if (!email || !password) {
            this.showError('Please fill in all fields')
            return
        }

        this.setLoading(true)

        try {
            const { data, error } = await auth.login(email, password)

            if (error) {
                this.showError(error.message || 'Login failed')
                return
            }

            if (data?.user) {
                this.showSuccess('Login successful! Redirecting to dashboard...')
                setTimeout(() => {
                    this.router.push('/dashboard')
                }, 1500)
            }
        } catch (err) {
            this.showError('An unexpected error occurred: ' + err.message)
        } finally {
            this.setLoading(false)
        }
    }

    showError(message) {
        const errorAlert = this.container.querySelector('#errorAlert')
        const successAlert = this.container.querySelector('#successAlert')

        errorAlert.textContent = message
        errorAlert.classList.remove('d-none')
        successAlert.classList.add('d-none')
    }

    showSuccess(message) {
        const successAlert = this.container.querySelector('#successAlert')
        const errorAlert = this.container.querySelector('#errorAlert')

        successAlert.textContent = message
        successAlert.classList.remove('d-none')
        errorAlert.classList.add('d-none')
    }

    setLoading(loading) {
        this.isLoading = loading
        const spinner = this.container.querySelector('#spinner')
        const btnText = this.container.querySelector('#btnText')
        const loginBtn = this.container.querySelector('#loginBtn')

        if (loading) {
            spinner.classList.remove('d-none')
            btnText.textContent = 'Logging in'
            loginBtn.disabled = true
        } else {
            spinner.classList.add('d-none')
            btnText.textContent = 'Login'
            loginBtn.disabled = false
        }
    }
}
