// Home/Index Page
import { Page } from './page.js'

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
                <a class="nav-link" href="#/login">Login</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <section class="home-hero">
        <div class="container text-center">
          <div class="home-hero-badge">Demo Mode</div>
          <h1 class="home-hero-title">Welcome to Application Dashboard</h1>
          <p class="home-hero-subtitle">Preview the experience, then unlock your personal workspace.</p>
          <div class="mt-4">
            <a href="#/login" class="btn btn-primary btn-lg">Login</a>
          </div>
        </div>
      </section>

      <section class="container mt-4 mb-5">
        <div class="row mb-3">
          <div class="col text-center">
            <h4 class="mb-1">Demo Dashboard</h4>
            <p class="text-muted mb-0">These cards are read-only until you sign in</p>
          </div>
        </div>
        <div class="row" id="demoShortcuts">
          ${this.renderDemoShortcuts()}
        </div>
      </section>
    `

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
