// Admin Users Management
import { supabase } from '../../services/supabase.js'

export class UsersManagement {
    constructor(container, adminPage) {
        this.container = container
        this.adminPage = adminPage
    }

    renderUsersTable() {
        const tableContent = this.adminPage.users.length === 0 ? `
        <div class="alert alert-info text-center">
          <i class="bi bi-inbox display-4"></i>
          <p class="mt-3">No users found</p>
        </div>
      ` : `
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
            ${this.adminPage.users
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
                    ${user.id !== this.adminPage.user.id ? `
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

        return `
      <div class="mb-3">
        <button class="btn btn-success" id="createUserBtn">
          <i class="bi bi-person-plus"></i> Create New User
        </button>
      </div>
      ${tableContent}
    `
    }

    setupEventListeners(container) {
        const createUserBtn = container.querySelector('#createUserBtn')
        const editButtons = container.querySelectorAll('.edit-user-btn')
        const deleteButtons = container.querySelectorAll('.delete-user-btn')

        createUserBtn?.addEventListener('click', () => this.openCreateUserModal())

        editButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.dataset.id
                this.openEditUserModal(userId)
            })
        })

        deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const userId = btn.dataset.id
                this.deleteUser(userId)
            })
        })
    }

    openCreateUserModal() {
        const modal = new bootstrap.Modal(this.container.querySelector('#createUserModal'))
        const form = this.container.querySelector('#createUserForm')
        if (form) form.reset()
        modal.show()
    }

    openEditUserModal(userId) {
        const user = this.adminPage.users.find(u => u.id === userId)
        if (!user) return

        const modal = new bootstrap.Modal(this.container.querySelector('#editUserModal'))
        this.container.querySelector('#userEmail').value = user.email
        this.container.querySelector('#userStatus').value = user.status || 'active'
        this.container.querySelector('#userRole').value = user.role || 'user'
        this.container.querySelector('#editUserForm').dataset.userId = userId
        modal.show()
    }

    async createUser() {
        const form = this.container.querySelector('#createUserForm')
        const email = this.container.querySelector('#newUserEmail')?.value?.trim()
        const password = this.container.querySelector('#newUserPassword')?.value?.trim()
        const repeatPassword = this.container.querySelector('#newUserRepeatPassword')?.value?.trim()
        const role = this.container.querySelector('#newUserRole')?.value || 'user'

        if (!email || !password || !repeatPassword) {
            this.adminPage.showError('Email, password, and repeat password are required')
            return
        }

        if (password !== repeatPassword) {
            this.adminPage.showError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            this.adminPage.showError('Password must be at least 6 characters')
            return
        }

        let adminSession = null

        try {
            // Store current admin session before creating new user
            const { data: { session: currentSession } } = await supabase.auth.getSession()

            if (!currentSession) {
                throw new Error('No active admin session found')
            }

            adminSession = currentSession

            // Register the user using Supabase Auth
            // Note: This will temporarily switch to the new user's session
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin
                }
            })

            if (signUpError) throw signUpError

            if (!authData.user) {
                throw new Error('User creation failed')
            }

            const newUserId = authData.user.id

            // Create user record in users table BEFORE restoring admin session
            // (RLS policies allow users to insert their own record)
            const { error: userError } = await supabase
                .from('users')
                .insert({
                    id: newUserId,
                    email: email,
                    role: role,
                    status: 'active'
                })

            if (userError) {
                console.error('User record creation failed:', userError)
                throw new Error(`Failed to create user record: ${userError.message}`)
            }

            // Add user role while we still have the user's session
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert({
                    user_id: newUserId,
                    role: role,
                    assigned_by: adminSession.user?.id || this.adminPage.user.id
                })

            if (roleError) {
                console.error('User role assignment failed:', roleError)
                throw new Error(`Failed to assign user role: ${roleError.message}`)
            }

            // NOW restore admin session after all user data is created
            await supabase.auth.setSession({
                access_token: adminSession.access_token,
                refresh_token: adminSession.refresh_token
            })

            this.adminPage.showSuccess(`User "${email}" created successfully`)

            // Close modal
            const modal = bootstrap.Modal.getInstance(this.container.querySelector('#createUserModal'))
            modal?.hide()

            // Verify admin session is restored
            const { data: { user: verifyUser } } = await supabase.auth.getUser()
            if (!verifyUser || verifyUser.id !== this.adminPage.user.id) {
                console.warn('Admin session verification failed, attempting to reload page')
                window.location.reload()
                return
            }

            // Reload users
            await this.adminPage.loadUsers()
            const usersTab = this.container.querySelector('#users')
            if (usersTab) {
                usersTab.innerHTML = this.renderUsersTable()
                this.setupEventListeners(this.container)
                this.adminPage.setupEventListeners()
            }
        } catch (err) {
            // Try to restore admin session on error
            if (adminSession) {
                try {
                    await supabase.auth.setSession({
                        access_token: adminSession.access_token,
                        refresh_token: adminSession.refresh_token
                    })
                } catch (restoreErr) {
                    console.error('Failed to restore session after error:', restoreErr)
                }
            }

            this.adminPage.showError('Error creating user: ' + err.message)
        }
    }

    async saveUser() {
        const form = this.container.querySelector('#editUserForm')
        const userId = form.dataset.userId
        const status = this.container.querySelector('#userStatus').value
        const role = this.container.querySelector('#userRole').value

        try {
            const { error: userError } = await supabase
                .from('users')
                .update({ status, role, updated_at: new Date() })
                .eq('id', userId)

            if (userError) throw userError

            const { error: roleError } = await supabase
                .from('user_roles')
                .upsert({
                    user_id: userId,
                    role: role,
                    assigned_by: this.adminPage.user.id
                }, { onConflict: 'user_id,role' })

            if (roleError) console.warn('Could not update user_roles:', roleError.message)

            this.adminPage.showSuccess('User updated successfully')

            await this.adminPage.loadUsers()
            const usersTab = this.container.querySelector('#users')
            if (usersTab) {
                usersTab.innerHTML = this.renderUsersTable()
                this.setupEventListeners(this.container)
                this.adminPage.setupEventListeners()
            }

            const modal = bootstrap.Modal.getInstance(this.container.querySelector('#editUserModal'))
            modal?.hide()
        } catch (err) {
            this.adminPage.showError('Error updating user: ' + err.message)
        }
    }

    async deleteUser(userId) {
        const user = this.adminPage.users.find(u => u.id === userId)
        if (!user) return

        if (!confirm(`Are you sure you want to delete user "${user.email}"? This will also delete all their shortcuts.`)) {
            return
        }

        try {
            // Check if user is authenticated
            const { data: sessionData } = await supabase.auth.getSession()
            if (!sessionData.session) {
                throw new Error('You must be logged in to delete users')
            }

            console.log('Session exists, calling Edge Function delete-user with userId:', userId)

            const { data, error: fnError } = await supabase.functions.invoke('delete-user', {
                body: { userId }
            })

            console.log('Edge Function response:', { data, fnError })

            if (fnError) {
                // Try to get more details from the response
                let errorDetails = {
                    name: fnError.name,
                    message: fnError.message,
                    status: fnError.context?.status,
                    statusText: fnError.context?.statusText
                }

                // Try to read the response body
                if (fnError.context && typeof fnError.context.text === 'function') {
                    try {
                        const bodyText = await fnError.context.text()
                        console.error('Response body:', bodyText)
                        errorDetails.responseBody = bodyText
                    } catch (e) {
                        console.error('Could not read response body:', e)
                    }
                }

                console.error('Edge Function error details:', errorDetails)
                throw new Error(`Failed to delete user: ${errorDetails.responseBody || fnError.message}`)
            }

            if (data && data.error) {
                throw new Error(data.error)
            }

            console.log('User deleted successfully via Edge Function:', data)

            this.adminPage.showSuccess('User deleted successfully')

            // Reload users from database
            await this.adminPage.loadUsers()

            // Update the users tab display
            const usersTab = this.container.querySelector('#users')
            if (usersTab) {
                usersTab.innerHTML = this.renderUsersTable()
                this.setupEventListeners(this.container)
                this.adminPage.setupEventListeners()
            }
        } catch (err) {
            this.adminPage.showError('Error deleting user: ' + err.message)
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
