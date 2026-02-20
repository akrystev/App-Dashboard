// Simple client-side router
import { IndexPage } from './pages/index-page.js'
import { DashboardPage } from './pages/dashboard-page.js'
import { LoginPage } from './pages/login-page.js'
import { RegisterPage } from './pages/register-page.js'
import { SettingsPage } from './pages/settings-page.js'
import { AdminPage } from './pages/admin-page.js'

export class Router {
    constructor(appContainer) {
        this.appContainer = appContainer
        this.routes = {
            '/': IndexPage,
            '/dashboard': DashboardPage,
            '/login': LoginPage,
            '/register': RegisterPage,
            '/settings': SettingsPage,
            '/admin': AdminPage
        }
        this.currentPage = null
    }

    init() {
        // Normalize to hash-based routing on the root path
        if (!window.location.hash) {
            window.history.replaceState({}, '', '/#/')
        }

        // Handle initial route based on hash
        this.navigate(this.getHashRoute(), { updateHash: false })

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.navigate(this.getHashRoute(), { updateHash: false })
        })
    }

    getHashRoute() {
        const hash = window.location.hash || '#/'
        const route = hash.replace(/^#/, '') || '/'
        return route.startsWith('/') ? route : `/${route}`
    }

    async navigate(path, options = { updateHash: true }) {
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
        if (options.updateHash) {
            window.history.pushState({ path: route }, '', `/#${route}`)
            window.dispatchEvent(new HashChangeEvent('hashchange'))
        }
    }

    push(path) {
        this.navigate(path)
    }
}
