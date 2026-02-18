// Dashboard Page
import { Page } from './page.js'

export class DashboardPage extends Page {
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
                <a class="nav-link active" href="#/dashboard">Dashboard</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#/logout">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div class="container mt-5">
        <div class="row mb-4">
          <div class="col">
            <h1>Dashboard</h1>
          </div>
        </div>

        <div class="row">
          <div class="col-md-3 mb-3">
            <div class="card">
              <div class="card-body text-center">
                <i class="bi bi-plus-circle display-4 text-primary mb-3"></i>
                <h5 class="card-title">Add Shortcut</h5>
                <p class="card-text">Create a new shortcut</p>
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col">
            <h5>Your Shortcuts</h5>
            <p class="text-muted">No shortcuts yet. Create one to get started!</p>
          </div>
        </div>
      </div>
    `

        // Add event listeners for navigation
        this.setupNavigation()
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
