# Quick Start Guide - Admin Shortcut Management

## 🚀 How to Use the New Features

### Creating a Shortcut (Admin Only)

1. **Login as Admin**
   - Email: `admin@demo.com`
   - Password: `Admin2026Secure!`

2. **Navigate to Admin Panel**
   - Click "Admin Panel" in the navbar

3. **Go to "All Shortcuts" Tab**
   - Click the shortcuts tab to see shortcut management

4. **Click "Create Shortcut" (Green Button)**

5. **Fill in the Form**
   ```
   Name:         Google (required)
   URL:          https://google.com (required)
   Icon Class:   bi-google (optional, default: bi-link-45deg)
   Description:  Search engine (optional)
   ```

6. **Click "Create Shortcut"**
   - Shortcut will appear in the table

---

### Assigning Users to Shortcuts (Admin Only)

1. **In Admin Panel → All Shortcuts Tab**

2. **Find the Shortcut to Share**

3. **Click the "👥 People" Button** (in Actions column)

4. **Manage Access Modal Opens**
   - See all registered users
   - Check/Uncheck to grant/revoke access

5. **Click "Save Changes"**
   - The badge updates showing number of users with access

---

## 👤 User Experience

### Viewing Shared Shortcuts

1. **Regular users see shared shortcuts on their Dashboard**

2. **No action needed** - shared shortcuts automatically appear

3. **Can use shared shortcuts like their own**
   - Open in new tab
   - See shortcut details
   - Edit/Delete button only available for own shortcuts

---

## 📊 Example Scenario

### Setup
- 1 Admin: `admin@demo.com`
- 2 Users: `demo@demo.com`, `user2@example.com`

### Workflow
```
Admin creates: Confluence Shortcut → https://confluence.company.com
Admin opens Manage Access modal
Admin checks users: ✓ demo@demo.com, ✓ user2@example.com
Admin clicks Save

Result:
- Both users see Confluence in their dashboard
- Both can click and access it
- Cannot delete (only their own shortcuts)
```

---

## 🎯 Key Points

| Feature | Admin | User |
|---------|-------|------|
| Create shortcut | ✅ Yes | ❌ No |
| Edit own shortcut | ✅ Yes | ✅ Yes |
| Delete own shortcut | ✅ Yes | ✅ Yes |
| Share shortcut with users | ✅ Yes | ❌ No |
| View shared shortcuts | ✅ Yes | ✅ Yes |
| Access shared shortcuts | ✅ Yes | ✅ Yes |

---

## 🔐 Security Notes

- Shortcuts created by admins belong to admin account
- Users can only edit/delete their own shortcuts
- Access control via visible badge in admin panel
- All changes are audited (granted_by field)

---

## 🐛 Troubleshooting

### Shortcut not appearing in user dashboard
- Check if user is selected in "Manage Access"
- Refresh the dashboard page
- Check browser console for errors

### "Create Shortcut" button not visible
- Verify you're logged in as admin
- Check user role in database
- Clear browser cache and reload

### Can't save access changes
- Verify internet connection
- Check if user has admin role
- Review browser console for error messages

---

## 📱 Icon Reference

Common Bootstrap icons for shortcuts:
```
bi-chrome        Google Chrome
bi-firefox       Firefox
bi-microsoft     Microsoft/Windows
bi-apple         Apple
bi-github        GitHub
bi-google        Google
bi-slack         Slack
bi-discord       Discord
bi-search        Search/Magnifier
bi-link-45deg    Generic Link (default)
bi-gear          Settings/Tools
bi-building      Office/Company
bi-database      Database
bi-folder        Folder/File
bi-link          Web Link
```

Find more: https://icons.getbootstrap.com/

---

## 💡 Tips

1. **Use Descriptive Names** - Make shortcut names clear (e.g., "Company Wiki" not "WK")

2. **Add Icons** - Visual shortcuts are easier to identify

3. **Write Descriptions** - Help users understand what each shortcut does

4. **Regularly Review** - Check who has access to keep it organized

5. **Test After Sharing** - Have users test shortcuts before relying on them

---

## 📞 Support

For issues or questions:
1. Check browser console (F12 → Console tab)
2. Verify admin account has correct role
3. Check Supabase dashboard for shortcut_visibility table
4. Review migration files to ensure all tables created
