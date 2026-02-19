// Settings Page
import { Page } from './page.js'
import { auth } from '../services/supabase.js'

export class SettingsPage extends Page {
    constructor(container, router) {
        super(container, router)
        this.title = 'Settings - App Dashboard'
        this.user = null
        this.isLoading = false
    }

    async render() {
        // Check if user is authenticated
        this.user = await auth.getCurrentUser()
        if (!this.user) {
            this.router.push('/login')
            return
        }

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
                <a class="nav-link" href="#/dashboard">Dashboard</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#/">Home</a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-person-circle"></i> ${this.user.email}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#/settings">Settings</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item" id="logoutBtn" style="border: none; background: none; cursor: pointer; text-align: left; width: 100%; padding: 0.5rem 1rem;">Logout</button></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div class="container mt-5 mb-5">
        <!-- Header Section -->
        <div class="row mb-5">
          <div class="col">
            <h1 class="mb-2">Settings</h1>
            <p class="text-muted">Manage your account settings and preferences</p>
          </div>
        </div>

        <!-- Alert Messages -->
        <div id="errorAlert" class="alert alert-danger d-none" role="alert"></div>
        <div id="successAlert" class="alert alert-success d-none" role="alert"></div>

        <!-- Settings Tabs -->
        <ul class="nav nav-tabs mb-4" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="account-tab" data-bs-toggle="tab" data-bs-target="#account" type="button" role="tab">
              <i class="bi bi-person"></i> Account
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="password-tab" data-bs-toggle="tab" data-bs-target="#password" type="button" role="tab">
              <i class="bi bi-lock"></i> Password
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Account Settings -->
          <div class="tab-pane fade show active" id="account" role="tabpanel">
            <div class="row">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Account Information</h5>
                    <form id="accountForm">
                      <div class="mb-3">
                        <label for="email" class="form-label">Email Address</label>
                        <input type="email" class="form-control" id="email" value="${this.user.email}" disabled>
                        <small class="text-muted">Email address cannot be changed</small>
                      </div>
                      <div class="mb-3">
                        <label for="userId" class="form-label">User ID</label>
                        <input type="text" class="form-control" id="userId" value="${this.user.id}" disabled>
                        <small class="text-muted">Your unique user identifier</small>
                      </div>
                      <div class="mb-3">
                        <label for="createdAt" class="form-label">Account Created</label>
                        <input type="text" class="form-control" id="createdAt" value="${new Date(this.user.created_at).toLocaleString()}" disabled>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Password Settings -->
          <div class="tab-pane fade" id="password" role="tabpanel">
            <div class="row">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Change Password</h5>
                    <form id="passwordForm">
                      <div class="mb-3">
                        <label for="newPassword" class="form-label">New Password</label>
                        <input type="password" class="form-control" id="newPassword" required minlength="6">
                        <small class="text-muted">Minimum 6 characters</small>
                      </div>
                      <div class="mb-3">
                        <label for="confirmPassword" class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="confirmPassword" required minlength="6">
                      </div>
                      <button type="submit" class="btn btn-primary" id="updatePasswordBtn">
                        <span id="btnText">Update Password</span>
                        <span id="spinner" class="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>
                      </button>
                    </form>
                  </div>
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
        const links = this.container.querySelectorAll('a[href^="#"]:not(.dropdown-toggle)')
        const logoutBtn = this.container.querySelector('#logoutBtn')
        const passwordForm = this.container.querySelector('#passwordForm')

        // Navigation links
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault()
                const path = link.getAttribute('href').substring(1) || '/'
                this.router.push(path)
            })
        })

        // Logout
        logoutBtn?.addEventListener('click', (e) => {
            e.preventDefault()
            this.handleLogout()
        })

        // Password form submission
        passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e))
    }

    async handlePasswordChange(e) {
        e.preventDefault()

        if (this.isLoading) return

        const newPassword = this.container.querySelector('#newPassword').value
        const confirmPassword = this.container.querySelector('#confirmPassword').value

        if (newPassword !== confirmPassword) {
            this.showError('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            this.showError('Password must be at least 6 characters long')
            return
        }

        this.setLoading(true)

        try {
            const { error } = await auth.updatePassword(newPassword)

            if (error) {
                this.showError(error.message || 'Failed to update password')
                return
            }

            this.showSuccess('Password updated successfully!')
            this.container.querySelector('#passwordForm').reset()
        } catch (err) {
            this.showError('An unexpected error occurred: ' + err.message)
        } finally {
            this.setLoading(false)
        }
    }

    async handleLogout() {
        const { error } = await auth.logout()
        if (error) {
            this.showError('Logout failed: ' + error.message)
        } else {
            this.showSuccess('Logged out successfully. Redirecting...')
            setTimeout(() => {
                this.router.push('/')
            }, 1500)
        }
    }

    showError(message) {
        const errorAlert = this.container.querySelector('#errorAlert')
        if (errorAlert) {
            errorAlert.textContent = message
            errorAlert.classList.remove('d-none')
            this.container.querySelector('#successAlert')?.classList.add('d-none')
        }
    }

    showSuccess(message) {
        const successAlert = this.container.querySelector('#successAlert')
        if (successAlert) {
            successAlert.textContent = message
            successAlert.classList.remove('d-none')
            this.container.querySelector('#errorAlert')?.classList.add('d-none')
        }
    }

    setLoading(loading) {
        this.isLoading = loading
        const spinner = this.container.querySelector('#spinner')
        const btnText = this.container.querySelector('#btnText')
        const updatePasswordBtn = this.container.querySelector('#updatePasswordBtn')

        if (loading) {
            spinner.classList.remove('d-none')
            btnText.textContent = 'Updating'
            updatePasswordBtn.disabled = true
        } else {
            spinner.classList.add('d-none')
            btnText.textContent = 'Update Password'
            updatePasswordBtn.disabled = false
        }
    }
}
