// Admin Panel Page - Main Controller
import { Page } from '../../../pages/page.js'
import { auth, supabase, ensureUserRecord, isAdmin } from '../../services/supabase.js'
import { NavBar } from '../../components/navbar.js'
import { UsersManagement } from './users-management.js'
import { ShortcutsManagement } from './shortcuts-management.js'
import '../../../pages/admin/style.css'

export class AdminPage extends Page {
  constructor(container, router) {
    super(container, router)
    this.title = 'Admin Panel - App Dashboard'
    this.user = null
    this.users = []
    this.shortcuts = []
    this.isLoading = false
    this.activeTab = 'users'

    // Module instances
    this.usersManagement = null
    this.shortcutsManagement = null
  }

  async render() {
    // Check if user is authenticated
    this.user = await auth.getCurrentUser()
    if (!this.user) {
      console.warn('No authenticated user')
      this.router.push('/login')
      return
    }

    console.log('Admin page - Current user:', this.user.email, this.user.id)

    await ensureUserRecord(this.user)

    // Check if user is admin
    const userIsAdmin = await isAdmin(this.user.id)
    console.log('Admin page - Is admin check result:', userIsAdmin)

    if (!userIsAdmin) {
      console.warn('User is not admin, redirecting to dashboard')
      this.router.push('/dashboard')
      return
    }

    console.log('User is admin, loading admin panel')
    // Load data
    await this.loadUsers()
    await this.loadAllShortcuts()

    // Initialize modules
    this.usersManagement = new UsersManagement(this.container, this)
    this.shortcutsManagement = new ShortcutsManagement(this.container, this)

    // Load shortcut visibility
    await this.shortcutsManagement.loadShortcutVisibility()

    this.container.innerHTML = NavBar.createHTML(this.user, 'admin', 'admin') + `
      <div class="container-fluid mt-4 mb-5 px-3 px-md-4">
        <!-- Header Section -->
        <div class="row mb-4 g-3">
          <div class="col-12">
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
            ${this.usersManagement.renderUsersTable()}
          </div>

          <!-- Shortcuts Tab -->
          <div class="tab-pane fade" id="shortcuts" role="tabpanel">
            ${this.shortcutsManagement.renderShortcutsTable()}
          </div>
        </div>

        <!-- Create Shortcut Modal -->
        <div class="modal fade" id="createShortcutModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Create New Shortcut</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="createShortcutForm">
                  <div class="mb-3">
                    <label for="shortcutName" class="form-label">Name *</label>
                    <input type="text" class="form-control" id="shortcutName" placeholder="e.g., Google" required>
                  </div>
                  <div class="mb-3">
                    <label for="shortcutUrl" class="form-label">URL *</label>
                    <input type="url" class="form-control" id="shortcutUrl" placeholder="https://google.com" required>
                    <small class="form-text text-muted">Don't forget to add "http://" or "https://"</small>
                  </div>
                  <div class="mb-3">
                    <label for="shortcutIcon" class="form-label">Icon Class</label>
                    <input type="text" class="form-control" id="shortcutIcon" placeholder="bi-google" value="bi-link-45deg">
                    <small class="text-muted">Bootstrap icon class (e.g., bi-google, bi-github)</small>
                  </div>
                  <div class="mb-3">
                    <label for="shortcutDescription" class="form-label">Description</label>
                    <textarea class="form-control" id="shortcutDescription" rows="3" placeholder="Optional description"></textarea>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="createShortcutSubmitBtn">Create Shortcut</button>
              </div>
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

        <!-- Create User Modal -->
        <div class="modal fade" id="createUserModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title"><i class="bi bi-person-plus"></i> Create New User</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="createUserForm">
                  <div class="mb-3">
                    <label for="newUserEmail" class="form-label">Email *</label>
                    <input type="email" class="form-control" id="newUserEmail" placeholder="user@example.com" required>
                  </div>
                  <div class="mb-3">
                    <label for="newUserPassword" class="form-label">Password *</label>
                    <input type="password" class="form-control" id="newUserPassword" placeholder="Minimum 6 characters" required>
                    <small class="text-muted">Password must be at least 6 characters long</small>
                  </div>
                  <div class="mb-3">
                    <label for="newUserRepeatPassword" class="form-label">Repeat Password *</label>
                    <input type="password" class="form-control" id="newUserRepeatPassword" placeholder="Confirm password" required>
                  </div>
                  <div class="mb-3">
                    <label for="newUserRole" class="form-label">Role</label>
                    <select class="form-select" id="newUserRole">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div class="alert alert-info" role="alert">
                    <i class="bi bi-info-circle"></i> 
                    The user will be created with an active status.
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-success" id="createUserSubmitBtn">
                  <i class="bi bi-person-plus"></i> Create User
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Manage Shortcut Access Modal -->
        <div class="modal fade" id="manageAccessModal" tabindex="-1">
          <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title"><i class="bi bi-people"></i> Share Shortcut</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body" id="manageAccessBody">
                <p class="text-muted">Loading users...</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="saveAccessBtn">
                  <i class="bi bi-check"></i> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    this.setupEventListeners()
    this.setPageTitle()
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
                    last_login
                `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Load shortcut counts separately (owned + shared)
      let usersData = data || []
      if (usersData.length > 0) {
        const userIds = usersData.map(u => u.id)
        const [shortcutsResult, visibilityResult] = await Promise.all([
          supabase.from('shortcuts').select('id, user_id'),
          supabase.from('shortcut_visibility').select('shortcut_id, user_id').in('user_id', userIds)
        ])

        if (shortcutsResult.error) throw shortcutsResult.error
        if (visibilityResult.error) throw visibilityResult.error

        const shortcutSets = new Map()
        userIds.forEach(userId => shortcutSets.set(userId, new Set()))

        const allShortcuts = shortcutsResult.data || []
        allShortcuts.forEach(shortcut => {
          const userSet = shortcutSets.get(shortcut.user_id)
          if (userSet) {
            userSet.add(shortcut.id)
          }
        })

        const visibilityEntries = visibilityResult.data || []
        visibilityEntries.forEach(entry => {
          const userSet = shortcutSets.get(entry.user_id)
          if (userSet) {
            userSet.add(entry.shortcut_id)
          }
        })

        usersData = usersData.map(user => ({
          ...user,
          shortcut_count: shortcutSets.get(user.id)?.size || 0
        }))
      }

      this.users = usersData
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
                    user_id
                `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Load user emails separately to avoid RLS join issues
      let shortcutsWithEmails = data || []
      if (shortcutsWithEmails.length > 0) {
        const userIds = [...new Set(shortcutsWithEmails.map(s => s.user_id))]
        const { data: usersData } = await supabase
          .from('users')
          .select('id, email')
          .in('id', userIds)

        const userMap = {}
        if (usersData) {
          usersData.forEach(u => {
            userMap[u.id] = u.email
          })
        }

        shortcutsWithEmails = shortcutsWithEmails.map(s => ({
          ...s,
          user_email: userMap[s.user_id] || 'Unknown'
        }))
      }

      this.shortcuts = shortcutsWithEmails
    } catch (err) {
      console.error('Error loading shortcuts:', err)
      this.showError('Failed to load shortcuts: ' + err.message)
      this.shortcuts = []
    }
  }

  setupEventListeners() {
    // Get all navigation links
    const navigationLinks = this.container.querySelectorAll('a[href^="#"]:not(.dropdown-toggle)')
    const saveUserBtn = this.container.querySelector('#saveUserBtn')
    const createUserSubmitBtn = this.container.querySelector('#createUserSubmitBtn')
    const createShortcutSubmitBtn = this.container.querySelector('#createShortcutSubmitBtn')

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

    // Save user button
    saveUserBtn?.addEventListener('click', () => this.usersManagement.saveUser())

    // Create user button
    createUserSubmitBtn?.addEventListener('click', () => this.usersManagement.createUser())

    // Create shortcut button
    createShortcutSubmitBtn?.addEventListener('click', () => this.shortcutsManagement.createShortcut())

    // Setup module event listeners
    this.usersManagement.setupEventListeners(this.container)
    this.shortcutsManagement.setupEventListeners(this.container)
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
}
