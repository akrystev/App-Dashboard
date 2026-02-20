// Base page class for all pages to extend
export class Page {
    constructor(container, router) {
        this.container = container
        this.router = router
        this.title = 'App Dashboard'
    }

    async render() {
        // To be implemented by subclasses
        this.container.innerHTML = '<div class="container mt-5"><p>Page not implemented</p></div>'
        this.setPageTitle()
    }

    setPageTitle() {
        document.title = this.title
    }

    escapeHtml(value) {
        const text = String(value ?? '')
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
    }

    destroy() {
        // Cleanup logic if needed
    }
}
