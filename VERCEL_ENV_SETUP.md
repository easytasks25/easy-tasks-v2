# Vercel Environment Variables Setup

## 🔧 Erforderliche Environment Variables in Vercel

Gehen Sie zu: **Vercel Dashboard → Ihr Projekt → Settings → Environment Variables**

### 1. Frontend (Client) Variables

```
NEXT_PUBLIC_SUPABASE_URL
Wert: https://your-project-id.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
Wert: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Ihr anon key)
```

### 2. Server (API/Prisma) Variables

```
DATABASE_URL
Wert: postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

```
DIRECT_URL
Wert: postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres?sslmode=require
```

```
SUPABASE_SERVICE_ROLE_KEY
Wert: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Ihr service_role key)
```

### 3. App Configuration

```
NEXT_PUBLIC_APP_URL
Wert: https://your-app.vercel.app
```

```
NEXT_PUBLIC_APP_NAME
Wert: easy-tasks
```

## 📍 Wo Sie die Werte finden

### Supabase Dashboard → Settings → API

1. **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
2. **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **service_role**: `SUPABASE_SERVICE_ROLE_KEY`

### Supabase Dashboard → Settings → Database

1. **Connection string**: Für `DATABASE_URL` und `DIRECT_URL`
   - Verwenden Sie das **Pooled connection** Format für `DATABASE_URL`
   - Verwenden Sie das **Direct connection** Format für `DIRECT_URL`

## 🔄 Nach dem Setzen

1. **Redeploy**: Vercel → Deployments → Redeploy
2. **Testen**: Registrierung und Login testen

## 🐛 Debugging

### Vercel Function Logs prüfen:
1. Vercel → Deployments → Ihr Deployment → Functions
2. Klicken Sie auf "Registrieren" in der App
3. Schauen Sie in die Logs für Fehlermeldungen

### Typische Fehler:
- `Invalid DATABASE_URL` → Connection String falsch
- `Can't reach database server` → SSL/PGBouncer Problem
- `Missing env: SUPABASE_SERVICE_ROLE_KEY` → Service Role Key fehlt
- `RLS: permission denied` → Row Level Security Problem

## ✅ Checkliste

- [ ] `NEXT_PUBLIC_SUPABASE_URL` gesetzt
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` gesetzt
- [ ] `DATABASE_URL` mit PGBouncer gesetzt
- [ ] `DIRECT_URL` ohne PGBouncer gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` gesetzt
- [ ] `NEXT_PUBLIC_APP_URL` gesetzt
- [ ] Redeploy durchgeführt
- [ ] Supabase Redirect URLs konfiguriert
- [ ] Registrierung getestet
- [ ] Login getestet
