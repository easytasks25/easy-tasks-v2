# Supabase Authentication Redirects Setup

## 🔧 Supabase Dashboard → Authentication → URL Configuration

### Site URL
```
https://your-app.vercel.app
```

### Additional Redirect URLs
```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/demo
https://your-app.vercel.app/
```

### Für Preview Deployments (optional)
```
https://your-app-git-main.vercel.app
https://your-app-git-main.vercel.app/auth/callback
https://your-app-git-main.vercel.app/demo
```

## 📱 Email Configuration

### Email Templates
- **Confirm signup**: Aktiviert
- **Reset password**: Aktiviert
- **Magic Link**: Optional

### SMTP Settings (optional)
Falls Sie eigene E-Mail-Provider verwenden möchten:
- **Host**: smtp.gmail.com (für Gmail)
- **Port**: 587
- **Username**: Ihre E-Mail
- **Password**: App-Passwort

## 🔐 Auth Providers

### Email/Password
- ✅ **Enable email confirmations**: Aktiviert
- ✅ **Enable email change confirmations**: Aktiviert

### Social Providers (optional)
- Google
- GitHub
- Discord
- etc.

## 🛡️ Security Settings

### Password Requirements
- **Minimum length**: 6 Zeichen
- **Require uppercase**: Optional
- **Require lowercase**: Optional
- **Require numbers**: Optional
- **Require special characters**: Optional

### Session Settings
- **JWT expiry**: 3600 (1 Stunde)
- **Refresh token expiry**: 2592000 (30 Tage)

## ✅ Checkliste

- [ ] Site URL auf Vercel-Domain gesetzt
- [ ] Redirect URLs konfiguriert
- [ ] Email confirmations aktiviert
- [ ] Password requirements konfiguriert
- [ ] Session settings angepasst
- [ ] Auth providers aktiviert
- [ ] SMTP konfiguriert (falls gewünscht)
