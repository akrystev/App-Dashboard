# App Dashboard

A web application that serves as a central hub for app shortcuts and dashboard management. Users can register, login, and create shortcuts to local network or public URLs.

## Features

- User registration and authentication via Supabase Auth
- Multi-page application with clean routing
- Bootstrap-based responsive UI
- **Admin panel for user management** ✅
- **Shortcut management system** ✅
- **User roles (admin/user)** ✅
- Supabase integration for database, auth, and storage

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Vite
- **UI Framework**: Bootstrap 5
- **Backend**: Supabase (Database, Auth, Storage)
- **Icons**: Bootstrap Icons

## Project Structure

```
src/
├── js/
│   ├── main.js              # Application entry point
│   ├── router.js            # Client-side routing
│   ├── pages/
│   │   ├── page.js          # Base page class
│   │   ├── index-page.js    # Home page
│   │   └── dashboard-page.js # Dashboard page
│   └── services/
│       └── supabase.js      # Supabase configuration and helpers
├── styles/
│   └── main.css             # Global styles
└── assets/                  # Images, icons, etc.

index.html                   # HTML entry point
vite.config.js              # Vite configuration
package.json                # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase project account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. (Optional) Set up VS Code MCP configuration:
```bash
cp .vscode/mcp.json.example .vscode/mcp.json
```
Then edit `.vscode/mcp.json` with your Supabase project reference.

### Development

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Demo Accounts

Demo accounts are available for testing:

**Regular User:**
- **Email**: demo@demo.com
- **Password**: Demo2026Secure!

**Admin User:**
- **Email**: admin@demo.com
- **Password**: Admin2026Secure!

Use these credentials to login and test the dashboard functionality without creating a new account. The admin account has access to the Admin Panel for managing all users and shortcuts.

> **Security Note**: These are demo/test credentials. In production, use strong unique passwords and enable MFA.

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```
register` - User registration
- `/dashboard` - User dashboard for managing shortcuts
- `/settings` - User settings and profile management
- `/admin` - Admin panel for user and shortcut management (admin only)

## Admin Panel

The admin panel is accessible only to users with the `admin` role. Features include:

- **User Management**: View all users, edit user status (active/blocked/suspended), assign roles
- **Shortcut Management**: View and delete shortcuts from all users
- **Statistics**: Overview of users and shortcuts

### Making a User Admin

To promote a user to admin, run the SQL script in `supabase/scripts/make_user_admin.sql`:

```sql
-- Replace YOUR_USER_EMAIL with the actual email
UPDATE users 
SET role = 'admin', updated_at = timezone('UTC'::text, now())
WHERE email = 'YOUR_USER_EMAIL';

INSERT INTO user_roles (user_id, role, assigned_at)
SELECT id, 'admin', timezone('UTC'::text, now())
FROM users
WHERE email = 'YOUR_USER_EMAIL'
ON CONFLICT (user_id, role) 
DO UPDATE SET assigned_at = timezone('UTC'::text, now());
```

## Future Pages

- `/dashboard` - User dashboard for managing shortcuts

## Future Pages

- `/register` - User registration
- `/admin` - Admin panel for user management
- `/settings` - User settings

## Contributing

This project is part of SoftUni AI curriculum.

## License

MIT
