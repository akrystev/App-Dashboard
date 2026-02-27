// Settings Page
/* global bootstrap */
import { Page } from '../page.js'
import { auth, supabase, getUserRole } from '../../js/services/supabase.js'
import { NavBar } from '../../js/components/navbar.js'
import './style.css'
import template from './index.html?raw'

export class SettingsPage extends Page {
    constructor(container, router) {
        super(container, router)
        this.title = 'Settings - App Dashboard'
        this.user = null
        this.userProfile = null
        this.isLoading = false
        this.userRole = 'user'
    }

    async render() {
        // Check if user is authenticated
        this.user = await auth.getCurrentUser()
        if (!this.user) {
            this.router.push('/login')
            return
        }

        // Get user role
        this.userRole = await getUserRole(this.user.id)

        // Load user profile
        await this.loadUserProfile()

        this.container.innerHTML = NavBar.createHTML(this.user, 'settings', this.userRole) + template

        // Populate account info
        this.container.querySelector('#displayEmail').textContent = this.user.email
        this.container.querySelector('#email').value = this.user.email
        this.container.querySelector('#userId').value = this.user.id
        this.container.querySelector('#createdAt').value = new Date(this.user.created_at).toLocaleString()
        this.container.querySelector('#emailModal').value = this.user.email

        this.updateProfileDisplay()
        this.setupEventListeners()
        this.setPageTitle()
    }

    async loadUserProfile() {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', this.user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.warn('Error loading profile:', error.message)
            } else if (data) {
                this.userProfile = data
            }
        } catch (err) {
            console.warn('Error loading profile:', err)
        }
    }

    updateProfileDisplay() {
        if (this.userProfile) {
            this.container.querySelector('#displayFullName').textContent = this.userProfile.full_name || 'Not provided'
            this.container.querySelector('#displayPhoneNumber').textContent = this.userProfile.phone_number || 'Not provided'
            this.container.querySelector('#displayCompany').textContent = this.userProfile.company || 'Not provided'
            this.container.querySelector('#displayAddress').textContent = this.userProfile.address || 'Not provided'
            this.container.querySelector('#displayBio').textContent = this.userProfile.bio || 'Not provided'

            if (this.userProfile.profile_picture_url) {
                const profilePictureDisplay = this.container.querySelector('#profilePictureDisplay')
                profilePictureDisplay.innerHTML = `<img src="${this.userProfile.profile_picture_url}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
            }
        }
    }

    setupEventListeners() {
        const links = this.container.querySelectorAll('a[href^="#"]:not(.dropdown-toggle)')
        const passwordForm = this.container.querySelector('#passwordForm')
        const editProfileBtn = this.container.querySelector('#editProfileBtn')
        const saveProfileBtn = this.container.querySelector('#saveProfileBtn')
        const profilePictureInput = this.container.querySelector('#profilePictureInput')

        // Setup navbar
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

        // Password form
        passwordForm?.addEventListener('submit', (e) => this.handlePasswordChange(e))

        // Profile editing
        editProfileBtn?.addEventListener('click', () => this.openEditProfileModal())
        saveProfileBtn?.addEventListener('click', () => this.saveProfile())
        profilePictureInput?.addEventListener('change', (e) => this.handleProfilePictureChange(e))
    }

    openEditProfileModal() {
        if (this.userProfile) {
            this.container.querySelector('#fullName').value = this.userProfile.full_name || ''
            this.container.querySelector('#phoneNumber').value = this.userProfile.phone_number || ''
            this.container.querySelector('#company').value = this.userProfile.company || ''
            this.container.querySelector('#address').value = this.userProfile.address || ''
            this.container.querySelector('#bio').value = this.userProfile.bio || ''
        }

        const modal = new bootstrap.Modal(this.container.querySelector('#editProfileModal'))
        modal.show()
    }

    handleProfilePictureChange(e) {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            this.showError('File size cannot exceed 5MB')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const preview = this.container.querySelector('#profilePicturePreview')
            preview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
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

            if (profilePictureInput.files.length > 0) {
                const file = profilePictureInput.files[0]
                const fileName = `${this.user.id}-${Date.now()}`

                const { error: uploadError } = await supabase.storage
                    .from('profile-pictures')
                    .upload(fileName, file, { upsert: true })

                if (uploadError) throw uploadError

                const { data } = supabase.storage
                    .from('profile-pictures')
                    .getPublicUrl(fileName)

                profilePictureUrl = data.publicUrl
            }

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
            await this.loadUserProfile()
            this.updateProfileDisplay()

            const modal = bootstrap.Modal.getInstance(this.container.querySelector('#editProfileModal'))
            modal?.hide()
        } catch (err) {
            this.showError('Error saving profile: ' + err.message)
        } finally {
            this.isLoading = false
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
