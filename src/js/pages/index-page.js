// Home/Index Page
import { Page } from './page.js'

export class IndexPage extends Page {
    constructor(container, router) {
        super(container, router)
        this.title = 'Home - App Dashboard'
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
                <a class="nav-link" href="#/dashboard">Dashboard</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#/login">Login</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div class="container text-center mt-5">
        <h1>Welcome to Application Dashboard</h1>
        <p class="lead">Your central hub for app shortcuts and management</p>
        <div class="mt-4">
          <a href="#/dashboard" class="btn btn-primary btn-lg me-2">Go to Dashboard</a>
          <a href="#/login" class="btn btn-outline-primary btn-lg">Login</a>
        </div>
      </div>
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
}
