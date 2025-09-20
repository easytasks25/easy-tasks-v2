# 🚀 Deployment-Anleitung für easy tasks

## Option 1: Vercel + Supabase (Empfohlen)

### Schritt 1: Repository vorbereiten
```bash
# Git Repository initialisieren (falls noch nicht geschehen)
git init
git add .
git commit -m "Initial commit: easy tasks app"

# Repository auf GitHub/GitLab pushen
git remote add origin https://github.com/ihr-username/easy-tasks.git
git push -u origin main
```

### Schritt 2: Supabase einrichten
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Melden Sie sich an oder erstellen Sie ein Konto
3. Klicken Sie auf "New Project"
4. Wählen Sie Ihre Organisation (oder erstellen Sie eine neue)
5. Füllen Sie die Details aus:
   - **Name**: `easy-tasks-production`
   - **Database Password**: Erstellen Sie ein starkes Passwort (notieren Sie es!)
   - **Region**: `Central Europe (Frankfurt)`
6. Klicken Sie auf "Create new project"
7. Gehen Sie zu "Settings" → "Database"
8. Kopieren Sie die DATABASE_URL

### Schritt 3: Vercel Setup
1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Melden Sie sich an oder erstellen Sie ein Konto
3. Klicken Sie auf "New Project"
4. Wählen Sie "Import Git Repository"
5. Wählen Sie Ihr Repository aus
6. Konfiguration:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npm run build`
   - **Output Directory**: `out`

### Schritt 4: Umgebungsvariablen setzen
In Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://postgres:[IHR-PASSWORT]@db.[PROJEKT-ID].supabase.co:5432/postgres
NEXTAUTH_URL=https://ihre-app.vercel.app
NEXTAUTH_SECRET=ihr-super-geheimer-schluessel
NEXT_PUBLIC_APP_URL=https://ihre-app.vercel.app
NEXT_PUBLIC_APP_NAME=easy tasks
```

### Schritt 5: Datenbank initialisieren
Nach dem Deployment:
1. Gehen Sie zu Ihrer Vercel-App-URL
2. Die App wird automatisch die Datenbank-Tabellen erstellen
3. Oder führen Sie lokal aus:
```bash
npx prisma db push
npm run db:seed
```

## Option 2: Vercel (Alternative)

### Schritt 1: Vercel Setup
1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Melden Sie sich an oder erstellen Sie ein Konto
3. Klicken Sie auf "New Project"
4. Wählen Sie Ihr Repository aus

### Schritt 2: Konfiguration
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `out`

### Schritt 3: Umgebungsvariablen
Gleiche Variablen wie bei Netlify

## Option 3: Lokaler Test mit Build

### Schritt 1: Build erstellen
```bash
npm run build
```

### Schritt 2: Lokal testen
```bash
npm start
```

## Wichtige Hinweise

### Vor dem Deployment:
1. ✅ Alle Tests durchführen
2. ✅ Umgebungsvariablen konfigurieren
3. ✅ Datenbank-Schema prüfen
4. ✅ PWA-Features testen

### Nach dem Deployment:
1. ✅ App-URL testen
2. ✅ Registrierung testen
3. ✅ Anmeldung testen
4. ✅ PWA-Installation testen

## Troubleshooting

### Build-Fehler:
```bash
# Dependencies installieren
npm install

# Prisma generieren
npx prisma generate

# Build erneut versuchen
npm run build
```

### Datenbank-Fehler:
```bash
# Schema pushen
npx prisma db push

# Seed-Daten laden
npm run db:seed
```

## Support
Bei Problemen:
1. Netlify/Vercel Logs überprüfen
2. Browser-Konsole überprüfen
3. Datenbank-Verbindung testen
