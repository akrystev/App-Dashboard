# App Dashboard

A web application that serves as a central hub for app shortcuts and dashboard management. Users can register, login, and create shortcuts to local network or public URLs.

## Features

- User registration and authentication via Supabase Auth
- Multi-page application with clean routing
- Bootstrap-based responsive UI
- Admin panel for user management (planned)
- Shortcut management system (planned)
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

### Development

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Demo Account

A demo account is available for testing:

- **Email**: demo@demo.com
- **Password**: demo123

Use these credentials to login and test the dashboard functionality without creating a new account.

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Pages

- `/` - Home page with welcome message and navigation
- `/login` - User login
- `/dashboard` - User dashboard for managing shortcuts

## Future Pages

- `/register` - User registration
- `/admin` - Admin panel for user management
- `/settings` - User settings

## Contributing

This project is part of SoftUni AI curriculum.

## License

MIT
