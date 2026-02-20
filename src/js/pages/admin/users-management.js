// Admin Users Management
import { supabase } from '../../services/supabase.js'

export class UsersManagement {
    constructor(container, adminPage) {
        this.container = container
        this.adminPage = adminPage
    }

    renderUsersTable() {
        if (this.adminPage.users.length === 0) {
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
    }

    setupEventListeners(container) {
        const editButtons = container.querySelectorAll('.edit-user-btn')
        const deleteButtons = container.querySelectorAll('.delete-user-btn')

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
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId)

            if (error) throw error

            this.adminPage.showSuccess('User deleted successfully')

            await this.adminPage.loadUsers()
            const usersTab = this.container.querySelector('#users')
            if (usersTab) {
                usersTab.innerHTML = this.renderUsersTable()
                this.setupEventListeners(this.container)
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
