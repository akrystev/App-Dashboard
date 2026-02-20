# Architecture Diagram - Shortcut Management System

## System Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     APP DASHBOARD                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ADMIN USERS          REGULAR USERS
                    │                   │
        ┌───────────┴──────────┐        │
        │                      │        │
    Admin Panel          Dashboard  Dashboard
        │                      │        │
    ┌───┴─────┐          ┌─────┴──┐    │
    │          │          │        │    │
  Users    Shortcuts  Own Shortcuts Shared
    │       Tab          │        │   Shortcuts
    │   ┌───────────┐     │        │    │
    │   │           │     │        │    │
    │  Create    Manage   User ID───┬───┘
    │  Shortcut  Access           │
    │   │         │               │
    └──────┬──────┘               │
           │                      │
           └──────────┬───────────┘
                      │
            ┌─────────▼──────────────┐
            │   SUPABASE DATABASE    │
            └────────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
      shortcuts  shortcut_visibility  users
          │           │           │
      ┌───┴───┐   ┌───┴───┐  ┌────┴───┐
      │ id    │   │ id    │  │ id     │
      │ name  │   │ short │  │ email  │
      │ url   │   │ cut_id│  │ role   │
      │ icon  │   │ user_ │  │ status │
      │ desc  │   │ id    │  │ ...    │
      │ user_ │   │ gran- │  └────────┘
      │ id    │   │ ted_  │
      │ ...   │   │ by    │
      └───────┘   │ ...   │
                  └───────┘
```

## Data Flow Diagram

### Creating a Shortcut
```
Admin Panel
  │
  ├─→ "Create Shortcut" Button Clicked
  │     │
  │     └─→ Modal Opens
  │          │
  │          ├─→ User Fills Form
  │          │     ├─ Name (required)
  │          │     ├─ URL (required)
  │          │     ├─ Icon (optional)
  │          │     └─ Description (optional)
  │          │
  │          └─→ "Create Shortcut" Clicked
  │               │
  │               └─→ ShortcutsManagement.createShortcut()
  │                    │
  │                    ├─→ Validate Form Data
  │                    │
  │                    ├─→ INSERT INTO shortcuts
  │                    │     (name, url, icon, desc, user_id)
  │                    │
  │                    ├─→ Modal Closes
  │                    │
  │                    ├─→ Show Success Message
  │                    │
  │                    └─→ Reload Shortcuts Table
```

### Managing Access
```
Admin Panel → Shortcuts Table
  │
  ├─→ Click "👥 People" Button
  │     │
  │     └─→ openManageAccessModal(shortcut_id)
  │          │
  │          ├─→ Load All Users
  │          │     │
  │          │     └─→ SELECT id, email FROM users
  │          │
  │          ├─→ Load Current Visibility
  │          │     │
  │          │     └─→ SELECT user_id FROM shortcut_visibility
  │          │          WHERE shortcut_id = ?
  │          │
  │          └─→ Render Modal with Checkboxes
  │               │
  │               ├─→ User Can Check/Uncheck
  │               │
  │               └─→ Click "Save Changes"
  │                    │
  │                    └─→ saveShortcutAccess()
  │                         │
  │                         ├─→ DELETE FROM shortcut_visibility
  │                         │   WHERE shortcut_id = ?
  │                         │
  │                         ├─→ INSERT INTO shortcut_visibility
  │                         │   FOR EACH checked user
  │                         │
  │                         ├─→ Show Success Message
  │                         │
  │                         └─→ Update Badge Display
```

### User Viewing Shortcuts
```
User Dashboard
  │
  └─→ loadShortcuts()
       │
       ├─→ SELECT * FROM shortcuts
       │   WHERE user_id = current_user_id
       │
       ├─→ SELECT shortcuts.* FROM shortcuts
       │   JOIN shortcut_visibility
       │   WHERE shortcut_visibility.user_id = current_user_id
       │
       ├─→ Merge Both Results
       │   (remove duplicates)
       │
       └─→ Display Combined Shortcuts
           ├─ User's own shortcuts
           └─ Shared shortcuts from admin
```

## Database Schema Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHORTCUT_VISIBILITY TABLE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PK: id (UUID)                                                   │
│  FK: shortcut_id ───────────→ shortcuts.id                       │
│  FK: user_id ─────────────→ auth.users.id                        │
│  FK: granted_by ──────────→ auth.users.id (admin)               │
│  Timestamp: granted_at                                           │
│                                                                   │
│  UNIQUE INDEX: (shortcut_id, user_id)                           │
│  REGULAR INDEX: shortcut_id                                     │
│  REGULAR INDEX: user_id                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
        
Example Data:
┌─────────────┬────────────────────┬────────────────────┐
│ shortcut_id │ user_id            │ granted_by         │
├─────────────┼────────────────────┼────────────────────┤
│ uuid-123    │ demo-user-id       │ admin-id           │
│ uuid-123    │ user2-id           │ admin-id           │
│ uuid-456    │ demo-user-id       │ admin-id           │
│ uuid-789    │ user3-id           │ admin-id           │
└─────────────┴────────────────────┴────────────────────┘
```

## Request/Response Flow

### Create Shortcut Request
```
HTTP POST /api/shortcuts
{
  "name": "GitHub",
  "url": "https://github.com",
  "icon": "bi-github",
  "description": "Code repository",
  "user_id": "admin-user-id"
}
     │
     └─→ Supabase
          │
          └─→ INSERT INTO shortcuts (...)
               │
               └─→ RLS Check: user_id matches admin
                    │
                    └─→ Success (200 OK)
                         │
                         └─→ Return created shortcut
```

### Manage Access Request
```
HTTP POST /api/shortcut_visibility
{
  "shortcut_id": "uuid-123",
  "user_ids": [
    "demo-user-id",
    "user2-id"
  ]
}
     │
     └─→ Supabase
          │
          ├─→ DELETE FROM shortcut_visibility
          │   WHERE shortcut_id = uuid-123
          │
          ├─→ INSERT INTO shortcut_visibility (...)
          │   FOR EACH user_id
          │
          └─→ RLS Check: admin accessing
               │
               └─→ Success (200 OK)
```

## Component Interaction Diagram

```
                    AdminPage
                        │
                        ├─→ UsersManagement
                        │    └─ Handles user management
                        │
                        └─→ ShortcutsManagement
                             │
                             ├─ loadShortcutVisibility()
                             ├─ renderShortcutsTable()
                             ├─ createShortcut()
                             ├─ openManageAccessModal()
                             └─ saveShortcutAccess()

                    DashboardPage
                        │
                        └─→ loadShortcuts()
                             │
                             ├─ Fetch own shortcuts
                             ├─ Fetch shared shortcuts
                             ├─ Merge & deduplicate
                             └─ Render grid view
```

## User Permission Matrix

```
                  ┌─────────────┬─────────────┐
                  │   ADMIN     │   USER      │
├─────────────────┼─────────────┼─────────────┤
│ Create Shortcut │      ✅     │     ❌      │
│ Edit Own        │      ✅     │     ✅      │
│ Delete Own      │      ✅     │     ✅      │
│ Share Shortcut  │      ✅     │     ❌      │
│ Revoke Access   │      ✅     │     ❌      │
│ View Own        │      ✅     │     ✅      │
│ View Shared     │      ✅     │     ✅      │
│ View All Access │      ✅     │     ❌      │
└─────────────────┴─────────────┴─────────────┘
```

## Security Model

```
ADMIN Creates Shortcut
    │
    └─→ shortcut.user_id = admin_user_id
         │
         └─→ Only admin can use in manage access

ADMIN Assigns Users
    │
    └─→ INSERT INTO shortcut_visibility
         │
         ├─ RLS Check: Is admin?
         │   └─ Only admin can write
         │
         └─ User sees shortcut on next load

USER Views Dashboard
    │
    └─→ Query shortcuts + visibility
         │
         ├─ RLS Check: user_id = current_user
         │   └─ Only own entries visible
         │
         └─ Display all shortcuts user can see
```

## Deployment Checklist

```
1. Database Migration
   ├─ Run migration: 20260220240000_add_shortcut_visibility.sql
   ├─ Verify tables created
   └─ Verify RLS policies active

2. Application Deployment
   ├─ Deploy updated code
   ├─ Run: npm run build
   ├─ Verify build succeeds
   └─ Deploy to hosting

3. Post-Deployment Testing
   ├─ Admin can create shortcuts
   ├─ Admin can manage access
   ├─ Users see shared shortcuts
   └─ All modals function correctly
```
