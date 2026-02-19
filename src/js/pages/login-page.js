// Login Page
import { Page } from './page.js'
import { auth } from '../services/supabase.js'

export class LoginPage extends Page {
    constructor(container, router) {
        super(container, router)
        this.title = 'Login - App Dashboard'
        this.isLoading = false
    }

    async render() {
        this.container.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#/">
            <i class="bi bi-speedometer2"></i> App Dashboard
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" href="#/">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#/register">Register</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card shadow">
              <div class="card-body">
                <h2 class="card-title text-center mb-4">Login</h2>

                <div id="errorAlert" class="alert alert-danger d-none" role="alert"></div>
                <div id="successAlert" class="alert alert-success d-none" role="alert"></div>

                <form id="loginForm">
                  <div class="mb-3">
                    <label for="email" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                  </div>

                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" required>
                  </div>

                  <button type="submit" class="btn btn-primary w-100" id="loginBtn">
                    <span id="btnText">Login</span>
                    <span id="spinner" class="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>
                  </button>
                </form>

                <div class="mt-3 text-center">
                  <p class="text-muted">Don't have an account? <a href="#/register">Register here</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

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
