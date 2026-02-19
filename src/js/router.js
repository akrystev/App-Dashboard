// Simple client-side router
import { IndexPage } from './pages/index-page.js'
import { DashboardPage } from './pages/dashboard-page.js'
import { LoginPage } from './pages/login-page.js'

export class Router {
    constructor(appContainer) {
        this.appContainer = appContainer
        this.routes = {
            '/': IndexPage,
            '/dashboard': DashboardPage,
            '/login': LoginPage
        }
        this.currentPage = null
    }

    init() {
        // Handle initial route
        this.navigate(window.location.pathname)

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            this.navigate(event.state?.path || '/')
        })
    }

    async navigate(path) {
        const route = path || '/'
        const PageComponent = this.routes[route]

        if (!PageComponent) {
            this.navigate('/')
            return
        }

        // Render the page
        if (this.currentPage) {
            this.currentPage.destroy?.()
        }

        this.appContainer.innerHTML = ''
        this.currentPage = new PageComponent(this.appContainer, this)
        await this.currentPage.render()

        // Update browser history
        window.history.pushState({ path: route }, '', route)
    }

    push(path) {
        this.navigate(path)
    }
}
