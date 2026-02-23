# Application Dashboard
The project is about a app that acts as Personal Application dashboard (like Heimdall or HomeScreen applications). It includes Home Screen with shortcuts to URL or local addresses.
The project includes user registration and one admininstrator witch manages all users.
Each user should be able to register and in its own dashboard to create shortcuts with icons whitch points to a location in the local network or public URL.
The administrator should be able to manage all users and their shortcuts, e.g. delete inappropriate shortcuts, block users, etc.

## Technologies
    • Frontend: Implement your app in HTML, CSS, JavaScript, Vite and Bootstrap. Use simple but looking good UI libraries and components. Keep it simple, without TypeScript and UI frameworks like React and Vite.
    • Backend: Use Supabase as a backend (database, authentication and storage).
## Architecture
    • Use Node.js, npm and Vite to structure your app.
    • Use multi-page navigation (instead of single page with popups) and keep each page in separate file.
    • Each page should have its own JavaScript file with the page logic and its own CSS file with the page styles. Use modular design to keep the code organized and maintainable.
    • Use modular design: split the app into self-contained components (e.g. UI pages, services, utils) to improve project maintenance. When reasonable, use separate files for the UI, business logic, styles, and other app assets. Avoid big and complex monolith code.
## User Interface (UI)
    • Implement minimum 5 app screens (pages / popups / others).
    • Example: register, login, main page, view / add / edit / delete entity and admin panel.
    • Admin panel should be only for admin users and should allow to manage all users and their shortcuts.
    • Main page should be the dashboard with shortcuts to local network or public URLs.
    • Keep different app screens in separate files (for higher maintenance).
    • Use Bootstrap components and utilities to create a clean, responsive and user-friendly UI.
    • Implement  modern, responsive UI design with semantic HTML.
## Backend
    • Use Supabase as a backend to keep all your app data.
    • Use Supabase DB for data tables.
    • Use Supabase Auth for authentication (users, register, login, logout).
    • Use Supabase Storage to upload photos and files at the server-side.
    • Optionally, use Supabase Edge Functions for special server-side interactions.
## Authentication and Authorization
    • Use Supabase Auth for authentication.
    • Implement users (register, login, logout) and roles (normal and admin users).
    • Implement admin panel (or similar concept for special users, different from regular).
    • Implement RLS policies to restrict access to data based on user roles and permissions.
    • Implement user roles with separate DB table `user_roles`  + enum `roles` (e.g. admin, user, etc.)
    • Provide sample credentials (demo@demo.com / Demo2026Secure! and admin@demo.com / Admin2026Secure!) to simplify testing the app.
    • When changing the database schema, always use Supabase Migrations to keep track and changes.
    • Never change the database schema directly in the Supabase UI without using Migrations, because it will cause problems with the project maintenance and deployment.
    • Never hardcode credentials in the code, use environment variables instead.
## Database
    • The database should hold minimum 4 DB tables (with relationships between them).
    • Example: users, user roles, user profiles, shortcuts, pictures, comments.
    • The Supabase will be connected via MCP
    • When changing the database schema, always use Supabase Migrations to keep track and changes.
    • Never change the database schema directly in the Supabase UI without using Migrations, because it will cause problems with the project maintenance and deployment.
    Implement user roles in Supabase:
    • Enum: app_role (user | admin)
    • Table: user_roles (user_id, user_role)
    Define RLS policies:
    • Everyone can read user_roles
    • Database function is_admin()
    • Only admins can write user_roles
    • Everyone can read public app data
    • Only owners and admins can edit app data
## Storage
    • The app should store user files (like photos and documents) in Supabase Storage.
    • The project should use file upload and download somewhere, e.g. profile pictures or product photos.
## Deployment
    • The project should be deployed live on the Internet in this case in Netlify.
    • Provide sample credentials (demo@demo.com / Demo2026Secure! and admin@demo.com / Admin2026Secure!) to simplify testing the app.
## Pages and Navigation
    • Use routing to navigate between pages.
    • Use full URLs like: /, /login, /register, /dashboards, /admin, etc.