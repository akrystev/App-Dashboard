// Settings Page
import { Page } from './page.js'
import { auth, supabase } from '../services/supabase.js'
import { NavBar } from '../components/navbar.js'

export class SettingsPage extends Page {
    constructor(container, router) {
        super(container, router)
        this.title = 'Settings - App Dashboard'
        this.user = null
        this.userProfile = null
        this.isLoading = false
    }

    async render() {
        // Check if user is authenticated
        this.user = await auth.getCurrentUser()
        if (!this.user) {
            this.router.push('/login')
            return
        }

        // Load user profile
        await this.loadUserProfile()

        this.container.innerHTML = NavBar.createHTML(this.user, 'settings') + `

      <div class="container mt-5 mb-5">
        <!-- Header Section -->
        <div class="row mb-5">
          <div class="col">
            <h1 class="mb-2">Settings</h1>
            <p class="text-muted">Manage your account settings and preferences</p>
          </div>
        </div>

        <!-- Alert Messages -->
        <div id="errorAlert" class="alert alert-danger d-none" role="alert"></div>
        <div id="successAlert" class="alert alert-success d-none" role="alert"></div>

        <!-- Settings Tabs -->
        <ul class="nav nav-tabs mb-4" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab">
              <i class="bi bi-person-fill"></i> Profile
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="account-tab" data-bs-toggle="tab" data-bs-target="#account" type="button" role="tab">
              <i class="bi bi-person"></i> Account
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="password-tab" data-bs-toggle="tab" data-bs-target="#password" type="button" role="tab">
              <i class="bi bi-lock"></i> Password
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Profile Settings -->
          <div class="tab-pane fade show active" id="profile" role="tabpanel">
            <div class="row">
              <div class="col-md-8">
                <div class="card">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                      <h5 class="card-title mb-0">User Profile</h5>
                      <button type="button" class="btn btn-primary btn-sm" id="editProfileBtn">
                        <i class="bi bi-pencil"></i> Edit Profile
                      </button>
                    </div>
                    
                    <div class="profile-display">
                      <div class="mb-4 text-center">
                        <div id="profilePictureDisplay" class="profile-picture-large mb-3">
                          <i class="bi bi-person-fill"></i>
                        </div>
                        <p class="text-muted small">Profile Picture</p>
                      </div>
                      
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label fw-bold">Full Name</label>
                          <p id="displayFullName" class="text-muted">Not provided</p>
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label fw-bold">Phone Number</label>
                          <p id="displayPhoneNumber" class="text-muted">Not provided</p>
                        </div>
                      </div>
                      
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label fw-bold">Company</label>
                          <p id="displayCompany" class="text-muted">Not provided</p>
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label fw-bold">Email</label>
                          <p id="displayEmail" class="text-muted">${this.user.email}</p>
                        </div>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label fw-bold">Address</label>
                        <p id="displayAddress" class="text-muted">Not provided</p>
                      </div>
                      
                      <div class="mb-3">
                        <label class="form-label fw-bold">Bio</label>
                        <p id="displayBio" class="text-muted">Not provided</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Profile Edit Modal -->
          <!-- Account Settings -->
          <div class="tab-pane fade" id="account" role="tabpanel">
            <div class="row">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Account Information</h5>
                    <form id="accountForm">
                      <div class="mb-3">
                        <label for="email" class="form-label">Email Address</label>
                        <input type="email" class="form-control" id="email" value="${this.user.email}" disabled>
                        <small class="text-muted">Email address cannot be changed</small>
                      </div>
                      <div class="mb-3">
                        <label for="userId" class="form-label">User ID</label>
                        <input type="text" class="form-control" id="userId" value="${this.user.id}" disabled>
                        <small class="text-muted">Your unique user identifier</small>
                      </div>
                      <div class="mb-3">
                        <label for="createdAt" class="form-label">Account Created</label>
                        <input type="text" class="form-control" id="createdAt" value="${new Date(this.user.created_at).toLocaleString()}" disabled>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Password Settings -->
          <div class="tab-pane fade" id="password" role="tabpanel">
            <div class="row">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Change Password</h5>
                    <form id="passwordForm">
                      <div class="mb-3">
                        <label for="newPassword" class="form-label">New Password</label>
                        <input type="password" class="form-control" id="newPassword" required minlength="6">
                        <small class="text-muted">Minimum 6 characters</small>
                      </div>
                      <div class="mb-3">
                        <label for="confirmPassword" class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="confirmPassword" required minlength="6">
                      </div>
                      <button type="submit" class="btn btn-primary" id="updatePasswordBtn">
                        <span id="btnText">Update Password</span>
                        <span id="spinner" class="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Profile Modal -->
        <div class="modal fade" id="editProfileModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Edit Profile</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="profileForm">
                  <!-- Profile Picture Upload -->
                  <div class="mb-4 text-center">
                    <div id="profilePicturePreview" class="profile-picture-large mb-3">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div class="mb-2">
                      <input type="file" class="form-control" id="profilePictureInput" accept="image/*">
                      <small class="text-muted">JPG, PNG or GIF (Max 5MB)</small>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="fullName" class="form-label">Full Name</label>
                      <input type="text" class="form-control" id="fullName" placeholder="John Doe">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="phoneNumber" class="form-label">Phone Number</label>
                      <input type="tel" class="form-control" id="phoneNumber" placeholder="+1 (555) 000-0000">
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="company" class="form-label">Company</label>
                      <input type="text" class="form-control" id="company" placeholder="Your Company">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="email" class="form-label">Email</label>
                      <input type="email" class="form-control" id="email" placeholder="Email" disabled>
                      <small class="text-muted">Email cannot be changed here</small>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="address" class="form-label">Address</label>
                    <input type="text" class="form-control" id="address" placeholder="Street address">
                  </div>

                  <div class="mb-3">
                    <label for="bio" class="form-label">Bio / Additional Info</label>
                    <textarea class="form-control" id="bio" rows="3" placeholder="Tell us about yourself..."></textarea>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="saveProfileBtn">
                  <span id="profileBtnText">Save Profile</span>
                  <span id="profileSpinner" class="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

        this.setupEventListeners()
        this.updateProfileDisplay()
        this.setPageTitle()
    }

    setupEventListeners() {
        const links = this.container.querySelectorAll('a[href^="#"]:not(.dropdown-toggle)')
        const passwordForm = this.container.querySelector('#passwordForm')
        const editProfileBtn = this.container.querySelector('#editProfileBtn')
        const saveProfileBtn = this.container.querySelector('#saveProfileBtn')
        const profilePictureInput = this.container.querySelector('#profilePictureInput')

        // Setup navbar event listeners
        NavBar.setupListeners(
            this.container,
            () => this.router.push('/settings'),
            () => this.handleLogout()
        )

        // Navigation links
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault()
                const path = link.getAttribute('href').substring(1) || '/'
                this.router.push(path)
            })
        })

        // Logout
        // Password form submission
        passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e))

        // Profile editing
        editProfileBtn?.addEventListener('click', () => this.openEditProfileModal())
        saveProfileBtn?.addEventListener('click', () => this.saveProfile())
        profilePictureInput?.addEventListener('change', (e) => this.handleProfilePictureChange(e))
    }

    async loadUserProfile() {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', this.user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                // PGRST116 is "no rows found" which is fine for new users
                console.warn('Error loading profile:', error.message)
            } else if (data) {
                this.userProfile = data
            } else {
                this.userProfile = null
            }
        } catch (err) {
            console.warn('Error loading profile:', err)
            this.userProfile = null
        }
    }

    openEditProfileModal() {
        // Populate form with current profile data
        if (this.userProfile) {
            this.container.querySelector('#fullName').value = this.userProfile.full_name || ''
            this.container.querySelector('#phoneNumber').value = this.userProfile.phone_number || ''
            this.container.querySelector('#company').value = this.userProfile.company || ''
            this.container.querySelector('#address').value = this.userProfile.address || ''
            this.container.querySelector('#bio').value = this.userProfile.bio || ''
        }

        this.container.querySelector('#email').value = this.user.email

        // Show modal
        const modal = new bootstrap.Modal(this.container.querySelector('#editProfileModal'))
        modal.show()
    }

    handleProfilePictureChange(e) {
        const file = e.target.files[0]
        if (!file) return

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('File size cannot exceed 5MB')
            return
        }

        // Show preview
        const reader = new FileReader()
        reader.onload = (event) => {
            const profilePicturePreview = this.container.querySelector('#profilePicturePreview')
            profilePicturePreview.innerHTML = `<img src="${event.target.result}" alt="Profile Picture" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
        }
        reader.readAsDataURL(file)
    }

    async saveProfile() {
        if (this.isLoading) return

        this.isLoading = true

        const fullName = this.container.querySelector('#fullName').value.trim()
        const phoneNumber = this.container.querySelector('#phoneNumber').value.trim()
        const company = this.container.querySelector('#company').value.trim()
        const address = this.container.querySelector('#address').value.trim()
        const bio = this.container.querySelector('#bio').value.trim()
        const profilePictureInput = this.container.querySelector('#profilePictureInput')

        try {
            let profilePictureUrl = this.userProfile?.profile_picture_url

            // Handle profile picture upload
            if (profilePictureInput.files.length > 0) {
                const file = profilePictureInput.files[0]
                const fileName = `${this.user.id}-${Date.now()}`

                const { error: uploadError } = await supabase.storage
                    .from('profile-pictures')
                    .upload(fileName, file, { upsert: true })

                if (uploadError) throw uploadError

                // Get public URL
                const { data } = supabase.storage
                    .from('profile-pictures')
                    .getPublicUrl(fileName)

                profilePictureUrl = data.publicUrl
            }

            // Update or insert profile
            if (this.userProfile) {
                const { error } = await supabase
                    .from('user_profiles')
                    .update({
                        full_name: fullName,
                        phone_number: phoneNumber,
                        company,
                        address,
                        bio,
                        profile_picture_url: profilePictureUrl,
                        updated_at: new Date()
                    })
                    .eq('user_id', this.user.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('user_profiles')
                    .insert({
                        user_id: this.user.id,
                        full_name: fullName,
                        phone_number: phoneNumber,
                        company,
                        address,
                        bio,
                        profile_picture_url: profilePictureUrl,
                        email: this.user.email
                    })

                if (error) throw error
            }

            this.showSuccess('Profile updated successfully!')

            // Reload profile data
            await this.loadUserProfile()
            this.updateProfileDisplay()

            // Close modal
            const modal = bootstrap.Modal.getInstance(this.container.querySelector('#editProfileModal'))
            modal?.hide()
        } catch (err) {
            this.showError('Error saving profile: ' + err.message)
        } finally {
            this.isLoading = false
            this.setProfileLoading(false)
        }
    }

    updateProfileDisplay() {
        if (this.userProfile) {
            this.container.querySelector('#displayFullName').textContent = this.userProfile.full_name || 'Not provided'
            this.container.querySelector('#displayPhoneNumber').textContent = this.userProfile.phone_number || 'Not provided'
            this.container.querySelector('#displayCompany').textContent = this.userProfile.company || 'Not provided'
            this.container.querySelector('#displayAddress').textContent = this.userProfile.address || 'Not provided'
            this.container.querySelector('#displayBio').textContent = this.userProfile.bio || 'Not provided'

            // Update profile picture
            if (this.userProfile.profile_picture_url) {
                const profilePictureDisplay = this.container.querySelector('#profilePictureDisplay')
                profilePictureDisplay.innerHTML = `<img src="${this.userProfile.profile_picture_url}" alt="Profile Picture" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
            }
        }
    }

    setProfileLoading(loading) {
        const spinner = this.container.querySelector('#profileSpinner')
        const btnText = this.container.querySelector('#profileBtnText')
        const saveProfileBtn = this.container.querySelector('#saveProfileBtn')

        if (loading) {
            spinner.classList.remove('d-none')
            btnText.textContent = 'Saving'
            saveProfileBtn.disabled = true
        } else {
            spinner.classList.add('d-none')
            btnText.textContent = 'Save Profile'
            saveProfileBtn.disabled = false
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault()

        if (this.isLoading) return

        const newPassword = this.container.querySelector('#newPassword').value
        const confirmPassword = this.container.querySelector('#confirmPassword').value

        if (newPassword !== confirmPassword) {
            this.showError('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            this.showError('Password must be at least 6 characters long')
            return
        }

        this.setLoading(true)

        try {
            const { error } = await auth.updatePassword(newPassword)

            if (error) {
                this.showError(error.message || 'Failed to update password')
                return
            }

            this.showSuccess('Password updated successfully!')
            this.container.querySelector('#passwordForm').reset()
        } catch (err) {
            this.showError('An unexpected error occurred: ' + err.message)
        } finally {
            this.setLoading(false)
        }
    }

    async handleLogout() {
        const { error } = await auth.logout()
        if (error) {
            this.showError('Logout failed: ' + error.message)
        } else {
            this.showSuccess('Logged out successfully. Redirecting...')
            setTimeout(() => {
                this.router.push('/')
            }, 1500)
        }
    }

    showError(message) {
        const errorAlert = this.container.querySelector('#errorAlert')
        if (errorAlert) {
            errorAlert.textContent = message
            errorAlert.classList.remove('d-none')
            this.container.querySelector('#successAlert')?.classList.add('d-none')
        }
    }

    showSuccess(message) {
        const successAlert = this.container.querySelector('#successAlert')
        if (successAlert) {
            successAlert.textContent = message
            successAlert.classList.remove('d-none')
            this.container.querySelector('#errorAlert')?.classList.add('d-none')
        }
    }

    setLoading(loading) {
        this.isLoading = loading
        const spinner = this.container.querySelector('#spinner')
        const btnText = this.container.querySelector('#btnText')
        const updatePasswordBtn = this.container.querySelector('#updatePasswordBtn')

        if (loading) {
            spinner.classList.remove('d-none')
            btnText.textContent = 'Updating'
            updatePasswordBtn.disabled = true
        } else {
            spinner.classList.add('d-none')
            btnText.textContent = 'Update Password'
            updatePasswordBtn.disabled = false
        }
    }
}
