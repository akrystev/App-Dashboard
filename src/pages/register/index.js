// Register Page
import { Page } from '../page.js'
import { auth, ensureUserRecord } from '../../js/services/supabase.js'
import './style.css'
import template from './index.html?raw'

export class RegisterPage extends Page {
    constructor(container, router) {
        super(container, router)
        this.title = 'Register - App Dashboard'
        this.isLoading = false
    }

    async render() {
        this.container.innerHTML = template
        this.setupEventListeners()
        this.setPageTitle()
    }

    setupEventListeners() {
        const registerForm = this.container.querySelector('#registerForm')
        const links = this.container.querySelectorAll('a[href^="#"]')

        registerForm.addEventListener('submit', (e) => this.handleRegister(e))

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault()
                const path = link.getAttribute('href').substring(1) || '/'
                this.router.push(path)
            })
        })
    }

    async handleRegister(e) {
        e.preventDefault()

        if (this.isLoading) return

        const email = this.container.querySelector('#email').value.trim()
        const password = this.container.querySelector('#password').value
        const confirmPassword = this.container.querySelector('#confirmPassword').value

        if (!email || !password || !confirmPassword) {
            this.showError('Please fill in all fields')
            return
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match')
            return
        }

        this.setLoading(true)

        try {
            const { data, error } = await auth.register(email, password)

            if (error) {
                this.showError(error.message || 'Registration failed')
                return
            }

            if (data?.user) {
                await ensureUserRecord(data.user)
            }

            this.showSuccess('Account created. Please login to continue.')
            setTimeout(() => {
                this.router.push('/login')
            }, 1500)
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
        const registerBtn = this.container.querySelector('#registerBtn')

        if (loading) {
            spinner.classList.remove('d-none')
            btnText.textContent = 'Creating account'
            registerBtn.disabled = true
        } else {
            spinner.classList.add('d-none')
            btnText.textContent = 'Create account'
            registerBtn.disabled = false
        }
    }
}
