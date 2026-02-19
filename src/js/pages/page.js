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

    destroy() {
        // Cleanup logic if needed
    }
}
