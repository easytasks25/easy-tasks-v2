# Umgebungsvariablen Setup

## Problem
Der Fehler `Environment variable not found: DATABASE_URL` tritt auf, weil die lokale Entwicklungsumgebung nicht konfiguriert ist.

## Lösung

### 1. Lokale .env.local Datei erstellen

Erstellen Sie eine `.env.local` Datei im Projektverzeichnis mit folgenden Inhalten:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://ihr-projekt.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="ihr-anon-key"
SUPABASE_SERVICE_ROLE_KEY="ihr-service-role-key"

# Database URLs (ersetzen Sie [YOUR-PROJECT-REF] und [YOUR-PASSWORD] mit Ihren echten Werten)
DATABASE_URL="postgresql://postgres:[IHR-PASSWORT]@db.[IHR-PROJEKT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[IHR-PASSWORT]@db.[IHR-PROJEKT-REF].supabase.co:5432/postgres"

# NextAuth (für Fallback)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ihr-geheimer-schlüssel"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="easy-tasks"

# Demo-Modus (für lokale Entwicklung ohne Datenbank)
DEMO_MODE=false

# Development/Seeding (nur lokal setzen, nie in Produktion!)
SEED_DEMO=true
```

### 2. Supabase-Werte finden

1. Gehen Sie zu Ihrem Supabase-Dashboard
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu **Settings** → **API**
4. Kopieren Sie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

5. Gehen Sie zu **Settings** → **Database**
6. Kopieren Sie die **Connection string** → `DATABASE_URL`

### 3. Prisma Migrationen ausführen

Nach dem Erstellen der `.env.local` Datei:

```bash
# Prisma Client generieren
npx prisma generate

# Migrationen gegen Supabase ausführen
npx prisma migrate dev -n init

# Optional: Datenbank-Seeding
npx prisma db seed
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

## Wichtige Hinweise

- Die `.env.local` Datei ist bereits in `.gitignore` und wird nicht committet
- Verwenden Sie niemals echte Passwörter in der `env.example`
- Für Produktion (Vercel) müssen die Umgebungsvariablen in den Vercel-Einstellungen konfiguriert werden

## Troubleshooting

### Fehler: "Could not find table public.organizations"
- Stellen Sie sicher, dass die Migrationen ausgeführt wurden: `npx prisma migrate dev -n init`
- Prüfen Sie, ob die `DATABASE_URL` korrekt ist

### Fehler: "Invalid credentials"
- Überprüfen Sie die Supabase-API-Keys
- Stellen Sie sicher, dass die Service Role Key korrekt ist

### Fehler: "Connection refused"
- Prüfen Sie die Datenbank-URL
- Stellen Sie sicher, dass Ihr Supabase-Projekt aktiv ist
