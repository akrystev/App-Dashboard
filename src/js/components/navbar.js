// Navigation helper for consistent navbar across pages
export class NavBar {
    static createHTML(user, activePage = 'dashboard') {
        const userInitial = user.email.charAt(0).toUpperCase()

        return `
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
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
                <a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" href="#/dashboard">Dashboard</a>
              </li>
            </ul>
            
            <!-- User Panel -->
            <div class="user-panel ms-lg-4">
              <div class="dropdown">
                <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <div class="user-avatar">${userInitial}</div>
                  <div class="d-none d-lg-block text-start">
                    <div class="user-email">${user.email}</div>
                    <div class="user-role">User</div>
                  </div>
                </button>
                <ul class="dropdown-menu dropdown-menu-end user-dropdown">
                  <li class="dropdown-header">
                    <div class="d-flex align-items-center gap-2">
                      <div class="user-avatar-large">${userInitial}</div>
                      <div>
                        <div class="user-email-dropdown">${user.email}</div>
                        <div class="user-status">Active</div>
                      </div>
                    </div>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item nav-settings-link" href="#/settings"><i class="bi bi-gear"></i> Settings</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item" id="logoutBtn" style="border: none; background: none; cursor: pointer; text-align: left; width: 100%;"><i class="bi bi-box-arrow-right"></i> Logout</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    `
    }

    static setupListeners(container, onSettingsClick, onLogoutClick) {
        const settingsLink = container.querySelector('.nav-settings-link')
        const logoutBtn = container.querySelector('#logoutBtn')

        if (settingsLink) {
            settingsLink.addEventListener('click', (e) => {
                e.preventDefault()
                onSettingsClick()
            })
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault()
                onLogoutClick()
            })
        }
    }
}
