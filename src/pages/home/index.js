// Home/Index Page
import { Page } from '../page.js'
import './style.css'
import template from './index.html?raw'

export class IndexPage extends Page {
    constructor(container, router) {
        super(container, router)
        this.title = 'Home - App Dashboard'
        this.demoShortcuts = [
            {
                name: 'Home Lab',
                url: 'http://192.168.1.50:3000',
                icon: 'bi-cpu',
                description: 'Local services dashboard'
            },
            {
                name: 'Docs',
                url: 'https://example.com/docs',
                icon: 'bi-journal-text',
                description: 'Reference notes and guides'
            },
            {
                name: 'Status',
                url: 'https://status.example.com',
                icon: 'bi-activity',
                description: 'Uptime monitoring'
            }
        ]
    }

    async render() {
        this.container.innerHTML = template

        // Render demo shortcuts
        const demoShortcutsContainer = this.container.querySelector('#demoShortcuts')
        if (demoShortcutsContainer) {
            demoShortcutsContainer.innerHTML = this.renderDemoShortcuts()
        }

        // Add event listeners for navigation
        this.setupNavigation()
        this.setPageTitle()
    }

    setupNavigation() {
        const links = this.container.querySelectorAll('a[href^="#"]')
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault()
                const path = link.getAttribute('href').substring(1) || '/'
                this.router.push(path)
            })
        })
    }

    renderDemoShortcuts() {
        return this.demoShortcuts
            .map(
                shortcut => `
        <div class="col-md-4 mb-4">
          <div class="card demo-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <i class="bi ${shortcut.icon} display-6 text-primary"></i>
                <span class="badge bg-secondary">Demo</span>
              </div>
              <h5 class="card-title">${this.escapeHtml(shortcut.name)}</h5>
              <p class="card-text text-muted text-truncate">${this.escapeHtml(shortcut.url)}</p>
              <p class="card-text small">${this.escapeHtml(shortcut.description)}</p>
              <button class="btn btn-sm btn-outline-secondary mt-2" disabled>
                <i class="bi bi-lock"></i> Login to Open
              </button>
            </div>
          </div>
        </div>
      `
            )
            .join('')
    }
}
