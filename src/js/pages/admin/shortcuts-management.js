// Admin Shortcuts Management
import { supabase } from '../../services/supabase.js'

export class ShortcutsManagement {
  constructor(container, adminPage) {
    this.container = container
    this.adminPage = adminPage
    this.selectedShortcutForAccess = null
    this.availableUsers = []
    this.shortcutVisibility = new Map()
  }

  async loadShortcutVisibility() {
    try {
      const { data, error } = await supabase
        .from('shortcut_visibility')
        .select('*')

      if (error) throw error

      this.shortcutVisibility.clear()
      if (data) {
        data.forEach(entry => {
          if (!this.shortcutVisibility.has(entry.shortcut_id)) {
            this.shortcutVisibility.set(entry.shortcut_id, [])
          }
          this.shortcutVisibility.get(entry.shortcut_id).push(entry.user_id)
        })
      }
    } catch (err) {
      console.error('Error loading shortcut visibility:', err)
    }
  }

  renderShortcutsTable() {
    if (this.adminPage.shortcuts.length === 0) {
      return `
        <div class="alert alert-info text-center mb-4">
          <i class="bi bi-inbox display-4"></i>
          <p class="mt-3">No shortcuts found</p>
        </div>
      `
    }

    return `
      <div class="mb-3">
        <button class="btn btn-success" id="createShortcutBtn">
          <i class="bi bi-plus-circle"></i> Create Shortcut
        </button>
      </div>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Name</th>
              <th>URL</th>
              <th>Owner</th>
              <th>Users Can See</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.adminPage.shortcuts
        .map(
          shortcut => {
            const visibleUsers = this.shortcutVisibility.get(shortcut.id) || []
            return `
              <tr>
                <td><i class="bi ${shortcut.icon || 'bi-link-45deg'} text-primary fs-4"></i></td>
                <td>${this.escapeHtml(shortcut.name)}</td>
                <td>
                  <a href="${this.escapeHtml(shortcut.url)}" target="_blank" rel="noopener" class="text-truncate d-inline-block" style="max-width: 300px;">
                    ${this.escapeHtml(shortcut.url)}
                  </a>
                </td>
                <td>${this.escapeHtml(shortcut.user_email || 'Unknown')}</td>
                <td>
                  <span class="badge bg-info">${visibleUsers.length} user${visibleUsers.length !== 1 ? 's' : ''}</span>
                </td>
                <td>${this.formatDate(shortcut.created_at)}</td>
                <td>
                  <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary manage-access-btn" data-id="${shortcut.id}" title="Manage Access">
                      <i class="bi bi-people"></i>
                    </button>
                    <button class="btn btn-outline-danger delete-shortcut-btn" data-id="${shortcut.id}">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `
          }
        )
        .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  setupEventListeners(container) {
    const deleteButtons = container.querySelectorAll('.delete-shortcut-btn')
    const createShortcutBtn = container.querySelector('#createShortcutBtn')
    const manageAccessButtons = container.querySelectorAll('.manage-access-btn')
    const saveAccessBtn = container.querySelector('#saveAccessBtn')

    createShortcutBtn?.addEventListener('click', () => this.openCreateShortcutModal())

    deleteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const shortcutId = btn.dataset.id
        this.deleteShortcut(shortcutId)
      })
    })

    manageAccessButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const shortcutId = btn.dataset.id
        this.openManageAccessModal(shortcutId)
      })
    })

    // Setup save access button
    saveAccessBtn?.addEventListener('click', () => this.saveShortcutAccess())
  }

  openCreateShortcutModal() {
    const modal = new (window.bootstrap || {}).Modal(
      document.getElementById('createShortcutModal'),
      { backdrop: 'static', keyboard: false }
    )

    // Reset form
    const form = document.getElementById('createShortcutForm')
    if (form) form.reset()

    modal.show()
  }

  async openManageAccessModal(shortcutId) {
    this.selectedShortcutForAccess = shortcutId
    const shortcut = this.adminPage.shortcuts.find(s => s.id === shortcutId)
    if (!shortcut) return

    try {
      // Load all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .order('email', { ascending: true })

      if (usersError) throw usersError
      this.availableUsers = usersData || []

      // Get current visibility
      const { data: visibilityData, error: visibilityError } = await supabase
        .from('shortcut_visibility')
        .select('user_id')
        .eq('shortcut_id', shortcutId)

      if (visibilityError) throw visibilityError
      const visibleUserIds = new Set((visibilityData || []).map(v => v.user_id))

      // Build user list HTML
      const userListHtml = this.availableUsers
        .map(user => {
          const isChecked = visibleUserIds.has(user.id)
          return `
                        <div class="form-check">
                            <input class="form-check-input user-access-check" type="checkbox" value="${user.id}" ${isChecked ? 'checked' : ''} id="user_${user.id}">
                            <label class="form-check-label" for="user_${user.id}">
                                ${this.escapeHtml(user.email)}
                            </label>
                        </div>
                    `
        })
        .join('')

      // Update modal title and content
      const modalBody = document.getElementById('manageAccessBody')
      if (modalBody) {
        modalBody.innerHTML = `
                    <p class="text-muted small mb-3"><strong>Shortcut:</strong> ${this.escapeHtml(shortcut.name)}</p>
                    <p class="text-muted small mb-3">Select which users can see this shortcut:</p>
                    ${userListHtml || '<p class="text-muted">No users available</p>'}
                `
      }

      // Update modal title
      const modalTitle = document.querySelector('#manageAccessModal .modal-title')
      if (modalTitle) {
        modalTitle.innerHTML = `<i class="bi bi-people"></i> Share "${this.escapeHtml(shortcut.name)}"`
      }

      // Show modal
      const modal = new (window.bootstrap || {}).Modal(document.getElementById('manageAccessModal'))
      modal.show()
    } catch (err) {
      this.adminPage.showError('Error loading access settings: ' + err.message)
    }
  }

  async saveShortcutAccess() {
    const modalElement = document.getElementById('manageAccessModal')
    const checkboxes = modalElement.querySelectorAll('.user-access-check')
    const selectedUserIds = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value)

    try {
      // Delete all current visibility entries for this shortcut
      const { error: deleteError } = await supabase
        .from('shortcut_visibility')
        .delete()
        .eq('shortcut_id', this.selectedShortcutForAccess)

      if (deleteError) throw deleteError

      // Insert new visibility entries
      if (selectedUserIds.length > 0) {
        const visibilityEntries = selectedUserIds.map(userId => ({
          shortcut_id: this.selectedShortcutForAccess,
          user_id: userId,
          granted_by: this.adminPage.user?.id
        }))

        const { error: insertError } = await supabase
          .from('shortcut_visibility')
          .insert(visibilityEntries)

        if (insertError) throw insertError
      }

      this.adminPage.showSuccess('Access updated successfully')

      // Close modal
      const modal = (window.bootstrap || {}).Modal.getInstance(modalElement)
      modal?.hide()

      // Reload and update display
      await this.loadShortcutVisibility()
      const shortcutsTab = this.container.querySelector('#shortcuts')
      if (shortcutsTab) {
        shortcutsTab.innerHTML = this.renderShortcutsTable()
        this.setupEventListeners(this.container)
      }
    } catch (err) {
      this.adminPage.showError('Error saving access: ' + err.message)
    }
  }

  async createShortcut() {
    const form = document.getElementById('createShortcutForm')
    if (!form) return

    const name = form.querySelector('#shortcutName')?.value?.trim()
    const url = form.querySelector('#shortcutUrl')?.value?.trim()
    const icon = form.querySelector('#shortcutIcon')?.value?.trim()
    const description = form.querySelector('#shortcutDescription')?.value?.trim()

    if (!name || !url) {
      this.adminPage.showError('Name and URL are required')
      return
    }

    try {
      // Create shortcut
      const { data: shortcut, error: createError } = await supabase
        .from('shortcuts')
        .insert([
          {
            name,
            url,
            icon: icon || 'bi-link-45deg',
            description,
            user_id: this.adminPage.user.id
          }
        ])
        .select()

      if (createError) throw createError

      // Automatically grant owner access to their shortcut
      if (shortcut && shortcut[0]) {
        const { error: visibilityError } = await supabase
          .from('shortcut_visibility')
          .insert([
            {
              shortcut_id: shortcut[0].id,
              user_id: this.adminPage.user.id,
              granted_by: this.adminPage.user.id
            }
          ])

        if (visibilityError) {
          console.warn('Could not add owner to visibility:', visibilityError)
          // Don't fail the whole operation if this fails
        }
      }

      this.adminPage.showSuccess('Shortcut created successfully')

      // Close modal
      const modal = window.bootstrap?.Modal.getInstance(document.getElementById('createShortcutModal'))
      modal?.hide()

      // Reload shortcuts
      await this.adminPage.loadAllShortcuts()
      await this.loadShortcutVisibility()

      const shortcutsTab = this.container.querySelector('#shortcuts')
      if (shortcutsTab) {
        shortcutsTab.innerHTML = this.renderShortcutsTable()
        this.setupEventListeners(this.container)
      }
    } catch (err) {
      this.adminPage.showError('Error creating shortcut: ' + err.message)
    }
  }

  async deleteShortcut(shortcutId) {
    const shortcut = this.adminPage.shortcuts.find(s => s.id === shortcutId)
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

      this.adminPage.showSuccess('Shortcut deleted successfully')

      await this.adminPage.loadAllShortcuts()
      const shortcutsTab = this.container.querySelector('#shortcuts')
      if (shortcutsTab) {
        shortcutsTab.innerHTML = this.renderShortcutsTable()
        this.setupEventListeners(this.container)
      }
    } catch (err) {
      this.adminPage.showError('Error deleting shortcut: ' + err.message)
    }
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
