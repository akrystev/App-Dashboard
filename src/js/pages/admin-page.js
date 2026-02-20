// Admin Panel Page
import { Page } from './page.js'
import { auth, supabase, ensureUserRecord, isAdmin } from '../services/supabase.js'
import { NavBar } from '../components/navbar.js'

export class AdminPage extends Page {
    constructor(container, router) {
        super(container, router)
        this.title = 'Admin Panel - App Dashboard'
        this.user = null
        this.users = []
        this.shortcuts = []
        this.isLoading = false
        this.activeTab = 'users'
    }

    async render() {
        // Check if user is authenticated
        this.user = await auth.getCurrentUser()
        if (!this.user) {
            this.router.push('/login')
            return
        }

        await ensureUserRecord(this.user)

        // Check if user is admin
        const userIsAdmin = await isAdmin(this.user.id)
        if (!userIsAdmin) {
            this.router.push('/dashboard')
            return
        }

        // Load data
        await this.loadUsers()
        await this.loadAllShortcuts()

        this.container.innerHTML = NavBar.createHTML(this.user, 'admin') + `
      <div class="container mt-5 mb-5">
        <!-- Header Section -->
        <div class="row mb-5">
          <div class="col">
            <h1 class="mb-2">
              <i class="bi bi-shield-lock-fill text-primary"></i> Admin Panel
            </h1>
            <p class="text-muted">Manage users and their shortcuts</p>
          </div>
        </div>

        <!-- Alert Messages -->
        <div id="errorAlert" class="alert alert-danger d-none" role="alert"></div>
        <div id="successAlert" class="alert alert-success d-none" role="alert"></div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-4" id="adminTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="users-tab" data-bs-toggle="tab" data-bs-target="#users" 
                    type="button" role="tab">
              <i class="bi bi-people"></i> Users (${this.users.length})
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="shortcuts-tab" data-bs-toggle="tab" data-bs-target="#shortcuts" 
                    type="button" role="tab">
              <i class="bi bi-link-45deg"></i> All Shortcuts (${this.shortcuts.length})
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="adminTabContent">
          <!-- Users Tab -->
          <div class="tab-pane fade show active" id="users" role="tabpanel">
            ${this.renderUsersTable()}
          </div>

          <!-- Shortcuts Tab -->
          <div class="tab-pane fade" id="shortcuts" role="tabpanel">
            ${this.renderShortcutsTable()}
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <div class="modal fade" id="editUserModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit User</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="editUserForm">
                <div class="mb-3">
                  <label for="userEmail" class="form-label">Email</label>
                  <input type="email" class="form-control" id="userEmail" readonly>
                </div>
                <div class="mb-3">
                  <label for="userStatus" class="form-label">Status</label>
                  <select class="form-select" id="userStatus">
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="userRole" class="form-label">Role</label>
                  <select class="form-select" id="userRole">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="saveUserBtn">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    `

        this.setupEventListeners()
        this.setPageTitle()
    }

    renderUsersTable() {
        if (this.users.length === 0) {
            return `
        <div class="alert alert-info text-center">
          <i class="bi bi-inbox display-4"></i>
          <p class="mt-3">No users found</p>
        </div>
      `
        }

        return `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th>Shortcuts</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.users
                .map(
                    user => `
              <tr>
                <td>${this.escapeHtml(user.email)}</td>
                <td>
                  <span class="badge bg-${this.getStatusColor(user.status)}">
                    ${user.status || 'active'}
                  </span>
                </td>
                <td>
                  <span class="badge bg-${user.role === 'admin' ? 'danger' : 'secondary'}">
                    ${user.role || 'user'}
                  </span>
                </td>
                <td>${user.shortcut_count || 0}</td>
                <td>${this.formatDate(user.created_at)}</td>
                <td>${user.last_login ? this.formatDate(user.last_login) : 'Never'}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary edit-user-btn" data-id="${user.id}">
                      <i class="bi bi-pencil"></i>
                    </button>
                    ${user.id !== this.user.id ? `
                      <button class="btn btn-outline-danger delete-user-btn" data-id="${user.id}">
                        <i class="bi bi-trash"></i>
                      </button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `
                )
                .join('')}
          </tbody>
        </table>
      </div>
    `
    }

    renderShortcutsTable() {
        if (this.shortcuts.length === 0) {
            return `
        <div class="alert alert-info text-center">
          <i class="bi bi-inbox display-4"></i>
          <p class="mt-3">No shortcuts found</p>
        </div>
      `
        }

        return `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Name</th>
              <th>URL</th>
              <th>Owner</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.shortcuts
                .map(
                    shortcut => `
              <tr>
                <td><i class="bi ${shortcut.icon || 'bi-link-45deg'} text-primary fs-4"></i></td>
                <td>${this.escapeHtml(shortcut.name)}</td>
                <td>
                  <a href="${this.escapeHtml(shortcut.url)}" target="_blank" rel="noopener" class="text-truncate d-inline-block" style="max-width: 300px;">
                    ${this.escapeHtml(shortcut.url)}
                  </a>
                </td>
                <td>${this.escapeHtml(shortcut.user_email || 'Unknown')}</td>
                <td>${this.formatDate(shortcut.created_at)}</td>
                <td>
                  <button class="btn btn-outline-danger btn-sm delete-shortcut-btn" data-id="${shortcut.id}">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </td>
              </tr>
            `
                )
                .join('')}
          </tbody>
        </table>
      </div>
    `
    }

    async loadUsers() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select(`
                    id,
                    email,
                    status,
                    role,
                    created_at,
                    last_login,
                    shortcuts:shortcuts(count)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            this.users = (data || []).map(user => ({
                ...user,
                shortcut_count: user.shortcuts?.[0]?.count || 0
            }))
        } catch (err) {
            console.error('Error loading users:', err)
            this.showError('Failed to load users: ' + err.message)
            this.users = []
        }
    }

    async loadAllShortcuts() {
        try {
            const { data, error } = await supabase
                .from('shortcuts')
                .select(`
                    id,
                    name,
                    url,
                    icon,
                    description,
                    created_at,
                    user_id,
                    users!shortcuts_to_users_fkey(email)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            this.shortcuts = (data || []).map(shortcut => ({
                ...shortcut,
                user_email: shortcut.users?.email || 'Unknown'
            }))
        } catch (err) {
            console.error('Error loading shortcuts:', err)
            this.showError('Failed to load shortcuts: ' + err.message)
            this.shortcuts = []
        }
    }

    setupEventListeners() {
        // Get all navigation links
        const navigationLinks = this.container.querySelectorAll('a[href^="#"]:not(.dropdown-toggle)')
        const editUserButtons = this.container.querySelectorAll('.edit-user-btn')
        const deleteUserButtons = this.container.querySelectorAll('.delete-user-btn')
        const deleteShortcutButtons = this.container.querySelectorAll('.delete-shortcut-btn')
        const saveUserBtn = this.container.querySelector('#saveUserBtn')

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

        // Edit user buttons
        editUserButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.dataset.id
                this.openEditUserModal(userId)
            })
        })

        // Delete user buttons
        deleteUserButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.dataset.id
                this.deleteUser(userId)
            })
        })

        // Delete shortcut buttons
        deleteShortcutButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const shortcutId = btn.dataset.id
                this.deleteShortcut(shortcutId)
            })
        })

        // Save user button
        saveUserBtn?.addEventListener('click', () => this.saveUser())
    }

    openEditUserModal(userId) {
        const user = this.users.find(u => u.id === userId)
        if (!user) return

        const modal = new bootstrap.Modal(this.container.querySelector('#editUserModal'))
        this.container.querySelector('#userEmail').value = user.email
        this.container.querySelector('#userStatus').value = user.status || 'active'
        this.container.querySelector('#userRole').value = user.role || 'user'
        this.container.querySelector('#editUserForm').dataset.userId = userId
        modal.show()
    }

    async saveUser() {
        const form = this.container.querySelector('#editUserForm')
        const userId = form.dataset.userId
        const status = this.container.querySelector('#userStatus').value
        const role = this.container.querySelector('#userRole').value

        try {
            // Update users table
            const { error: userError } = await supabase
                .from('users')
                .update({ status, role, updated_at: new Date() })
                .eq('id', userId)

            if (userError) throw userError

            // Update user_roles table
            const { error: roleError } = await supabase
                .from('user_roles')
                .upsert({
                    user_id: userId,
                    role: role,
                    assigned_by: this.user.id
                }, { onConflict: 'user_id,role' })

            if (roleError) console.warn('Could not update user_roles:', roleError.message)

            this.showSuccess('User updated successfully')

            // Reload users
            await this.loadUsers()
            const usersTab = this.container.querySelector('#users')
            if (usersTab) {
                usersTab.innerHTML = this.renderUsersTable()
                this.setupEventListeners()
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(this.container.querySelector('#editUserModal'))
            modal?.hide()
        } catch (err) {
            this.showError('Error updating user: ' + err.message)
        }
    }

    async deleteUser(userId) {
        const user = this.users.find(u => u.id === userId)
        if (!user) return

        if (!confirm(`Are you sure you want to delete user "${user.email}"? This will also delete all their shortcuts.`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId)

            if (error) throw error

            this.showSuccess('User deleted successfully')

            // Reload users
            await this.loadUsers()
            const usersTab = this.container.querySelector('#users')
            if (usersTab) {
                usersTab.innerHTML = this.renderUsersTable()
                this.setupEventListeners()
            }
        } catch (err) {
            this.showError('Error deleting user: ' + err.message)
        }
    }

    async deleteShortcut(shortcutId) {
        const shortcut = this.shortcuts.find(s => s.id === shortcutId)
        if (!shortcut) return

        if (!confirm(`Are you sure you want to delete shortcut "${shortcut.name}"?`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('shortcuts')
                .delete()
                .eq('id', shortcutId)

            if (error) throw error

            this.showSuccess('Shortcut deleted successfully')

            // Reload shortcuts
            await this.loadAllShortcuts()
            const shortcutsTab = this.container.querySelector('#shortcuts')
            if (shortcutsTab) {
                shortcutsTab.innerHTML = this.renderShortcutsTable()
                this.setupEventListeners()
            }
        } catch (err) {
            this.showError('Error deleting shortcut: ' + err.message)
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

    getStatusColor(status) {
        const colors = {
            active: 'success',
            blocked: 'danger',
            suspended: 'warning'
        }
        return colors[status] || 'secondary'
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    escapeHtml(text) {
        if (!text) return ''
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }
}
