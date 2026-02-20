// Admin Shortcuts Management
import { supabase } from '../../services/supabase.js'

export class ShortcutsManagement {
    constructor(container, adminPage) {
        this.container = container
        this.adminPage = adminPage
    }

    renderShortcutsTable() {
        if (this.adminPage.shortcuts.length === 0) {
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
            ${this.adminPage.shortcuts
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

    setupEventListeners(container) {
        const deleteButtons = container.querySelectorAll('.delete-shortcut-btn')

        deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const shortcutId = btn.dataset.id
                this.deleteShortcut(shortcutId)
            })
        })
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
