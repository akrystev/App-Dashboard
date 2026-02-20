// Dashboard Page
import { Page } from '../page.js'
import { auth, supabase, ensureUserRecord, getUserRole } from '../../js/services/supabase.js'
import { NavBar } from '../../js/components/navbar.js'
import './style.css'
import template from './index.html?raw'

export class DashboardPage extends Page {
    constructor(container, router) {
        super(container, router)
        this.title = 'Dashboard - App Dashboard'
        this.user = null
        this.shortcuts = []
        this.isLoading = false
        this.userRole = 'user'
    }

    async render() {
        // Check if user is authenticated
        this.user = await auth.getCurrentUser()
        if (!this.user) {
            this.router.push('/login')
            return
        }

        await ensureUserRecord(this.user)

        // Get user role
        this.userRole = await getUserRole(this.user.id)

        // Load shortcuts
        await this.loadShortcuts()

        this.container.innerHTML = NavBar.createHTML(this.user, 'dashboard', this.userRole) + template

        // Set user greeting
        const userGreeting = this.container.querySelector('#userGreeting')
        if (userGreeting) {
            userGreeting.textContent = this.user.email.split('@')[0]
        }

        // Render shortcuts
        const shortcutsContainer = this.container.querySelector('#shortcutsContainer')
        if (shortcutsContainer) {
            shortcutsContainer.innerHTML = this.renderShortcuts()
        }

        this.setupEventListeners()
        this.setPageTitle()
    }

    renderShortcuts() {
        if (this.shortcuts.length === 0) {
            return `
        <div class="col-12">
          <div class="alert alert-info text-center py-5" role="alert">
            <i class="bi bi-inbox display-1 text-info d-block mb-3"></i>
            <h5>No shortcuts yet</h5>
            <p class="mb-3 text-muted">Create your first shortcut to get started!</p>
            <button class="btn btn-primary" id="addFirstShortcutBtn">
              <i class="bi bi-plus-circle"></i> Create Shortcut
            </button>
          </div>
        </div>
      `
        }

        return this.shortcuts
            .map(
                shortcut => `
        <div class="col-md-4 mb-4">
          <div class="card shortcut-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <i class="bi ${shortcut.icon || 'bi-link-45deg'} display-6 text-primary"></i>
                <div class="btn-group btn-group-sm" role="group">
                  <button class="btn btn-outline-secondary edit-shortcut-btn" data-id="${shortcut.id}">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-outline-danger delete-shortcut-btn" data-id="${shortcut.id}">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <h5 class="card-title">${this.escapeHtml(shortcut.name)}</h5>
              <p class="card-text text-muted text-truncate">${this.escapeHtml(shortcut.url)}</p>
              ${shortcut.description ? `<p class="card-text small">${this.escapeHtml(shortcut.description)}</p>` : ''}
              <a href="${this.escapeHtml(shortcut.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary mt-2">
                <i class="bi bi-arrow-up-right"></i> Open
              </a>
            </div>
          </div>
        </div>
      `
            )
            .join('')
    }

    async loadShortcuts() {
        try {
            // Load the user's own shortcuts
            const { data: ownShortcuts, error: ownError } = await supabase
                .from('shortcuts')
                .select('*')
                .eq('user_id', this.user.id)
                .order('created_at', { ascending: false })

            if (ownError) throw ownError

            // Load shortcuts shared with the user via visibility
            const { data: sharedShortcuts, error: sharedError } = await supabase
                .from('shortcut_visibility')
                .select(`
                    shortcut_id,
                    shortcuts!shortcut_id(*)
                `)
                .eq('user_id', this.user.id)

            if (sharedError) throw sharedError

            // Combine shortcuts, removing duplicates
            const shortcutMap = new Map()

            // Add own shortcuts
            if (ownShortcuts) {
                ownShortcuts.forEach(s => shortcutMap.set(s.id, s))
            }

            // Add shared shortcuts
            if (sharedShortcuts) {
                sharedShortcuts.forEach(entry => {
                    if (entry.shortcuts) {
                        shortcutMap.set(entry.shortcuts.id, entry.shortcuts)
                    }
                })
            }

            this.shortcuts = Array.from(shortcutMap.values())
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        } catch (err) {
            console.warn('Error loading shortcuts:', err)
            this.shortcuts = []
        }
    }

    setupEventListeners() {
        // Get all navigation links (exclude dropdown toggles)
        const navigationLinks = this.container.querySelectorAll('a[href^="#"]:not(.dropdown-toggle)')
        const addShortcutBtn = this.container.querySelector('#addShortcutBtn')
        const addFirstShortcutBtn = this.container.querySelector('#addFirstShortcutBtn')
        const saveShortcutBtn = this.container.querySelector('#saveShortcutBtn')
        const editButtons = this.container.querySelectorAll('.edit-shortcut-btn')
        const deleteButtons = this.container.querySelectorAll('.delete-shortcut-btn')

        // Setup navbar event listeners
        NavBar.setupListeners(
            this.container,
            () => this.router.push('/settings'),
            () => this.handleLogout()
        )

        // Navigation links
        navigationLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault()
                const path = link.getAttribute('href').substring(1) || '/'
                this.router.push(path)
            })
        })

        // Add shortcut buttons
        addShortcutBtn?.addEventListener('click', () => this.openAddModal())
        addFirstShortcutBtn?.addEventListener('click', () => this.openAddModal())

        // Save shortcut
        saveShortcutBtn?.addEventListener('click', () => this.saveShortcut())

        // Edit buttons
        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault()
                const id = btn.dataset.id
                this.openEditModal(id)
            })
        })

        // Delete buttons
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault()
                const id = btn.dataset.id
                this.deleteShortcut(id)
            })
        })
    }

    openAddModal() {
        const modal = new bootstrap.Modal(this.container.querySelector('#shortcutModal'))
        this.container.querySelector('#modalTitle').textContent = 'Add Shortcut'
        this.container.querySelector('#shortcutForm').reset()
        this.container.querySelector('#shortcutForm').dataset.id = ''
        modal.show()
    }

    openEditModal(id) {
        const shortcut = this.shortcuts.find(s => s.id === id)
        if (!shortcut) return

        const modal = new bootstrap.Modal(this.container.querySelector('#shortcutModal'))
        this.container.querySelector('#modalTitle').textContent = 'Edit Shortcut'
        this.container.querySelector('#shortcutName').value = shortcut.name
        this.container.querySelector('#shortcutUrl').value = shortcut.url
        this.container.querySelector('#shortcutIcon').value = shortcut.icon || 'bi-link-45deg'
        this.container.querySelector('#shortcutDescription').value = shortcut.description || ''
        this.container.querySelector('#shortcutForm').dataset.id = id
        modal.show()
    }

    async saveShortcut() {
        const form = this.container.querySelector('#shortcutForm')
        const id = form.dataset.id
        const name = this.container.querySelector('#shortcutName').value.trim()
        const url = this.container.querySelector('#shortcutUrl').value.trim()
        const icon = this.container.querySelector('#shortcutIcon').value.trim() || 'bi-link-45deg'
        const description = this.container.querySelector('#shortcutDescription').value.trim()

        if (!name || !url) {
            this.showError('Please fill in all required fields')
            return
        }

        this.isLoading = true

        try {
            if (id) {
                // Update existing
                const { error } = await supabase
                    .from('shortcuts')
                    .update({ name, url, icon, description, updated_at: new Date() })
                    .eq('id', id)
                    .eq('user_id', this.user.id)

                if (error) throw error
                this.showSuccess('Shortcut updated successfully')
            } else {
                // Create new
                const { error } = await supabase
                    .from('shortcuts')
                    .insert({
                        user_id: this.user.id,
                        name,
                        url,
                        icon,
                        description
                    })

                if (error) throw error
                this.showSuccess('Shortcut created successfully')
            }

            // Reload shortcuts
            await this.loadShortcuts()
            const shortcutsContainer = this.container.querySelector('#shortcutsContainer')
            if (shortcutsContainer) {
                shortcutsContainer.innerHTML = this.renderShortcuts()
                this.setupEventListeners()
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(this.container.querySelector('#shortcutModal'))
            modal?.hide()
        } catch (err) {
            this.showError('Error saving shortcut: ' + err.message)
        } finally {
            this.isLoading = false
        }
    }

    async deleteShortcut(id) {
        if (!confirm('Are you sure you want to delete this shortcut?')) {
            return
        }

        this.isLoading = true

        try {
            const { error } = await supabase
                .from('shortcuts')
                .delete()
                .eq('id', id)
                .eq('user_id', this.user.id)

            if (error) throw error

            this.showSuccess('Shortcut deleted successfully')

            // Reload shortcuts
            await this.loadShortcuts()
            const shortcutsContainer = this.container.querySelector('#shortcutsContainer')
            if (shortcutsContainer) {
                shortcutsContainer.innerHTML = this.renderShortcuts()
                this.setupEventListeners()
            }
        } catch (err) {
            this.showError('Error deleting shortcut: ' + err.message)
        } finally {
            this.isLoading = false
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

    escapeHtml(text) {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }
}
