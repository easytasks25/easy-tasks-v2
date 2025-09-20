# 🚀 LW Tasks - Live Setup Anleitung

## 📋 Schritt-für-Schritt Anleitung

### **Schritt 1: Supabase einrichten**

#### 1.1 Supabase-Account erstellen:
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Klicken Sie auf **"Start your project"**
3. Melden Sie sich mit Ihrem **GitHub-Account** an
4. Bestätigen Sie Ihre E-Mail-Adresse

#### 1.2 Neues Projekt erstellen:
1. Klicken Sie auf **"New Project"**
2. Wählen Sie Ihre **Organisation** (oder erstellen Sie eine neue)
3. Füllen Sie die Details aus:
   - **Name**: `lwtasks-production`
   - **Database Password**: Erstellen Sie ein starkes Passwort (notieren Sie es!)
   - **Region**: `Central Europe (Frankfurt)`
4. Klicken Sie auf **"Create new project"**

#### 1.3 Datenbank-URL kopieren:
1. Gehen Sie zu **"Settings"** → **"Database"**
2. Scrollen Sie zu **"Connection string"**
3. Wählen Sie **"URI"** aus
4. Kopieren Sie die **DATABASE_URL**

### **Schritt 2: Vercel einrichten**

#### 2.1 Vercel-Account erstellen:
1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Klicken Sie auf **"Sign Up"**
3. Melden Sie sich mit Ihrem **GitHub-Account** an

#### 2.2 Projekt importieren:
1. Klicken Sie auf **"New Project"**
2. Wählen Sie **"Import Git Repository"**
3. Wählen Sie Ihr **LW Tasks Repository** aus
4. Klicken Sie auf **"Import"**

#### 2.3 Projekt konfigurieren:
- **Framework Preset**: `Next.js`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `out`
- **Install Command**: `npm install`

### **Schritt 3: Umgebungsvariablen setzen**

#### 3.1 In Vercel Dashboard:
1. Gehen Sie zu **"Settings"** → **"Environment Variables"**
2. Fügen Sie folgende Variablen hinzu:

```bash
# Database (ersetzen Sie [IHR-PASSWORT] und [PROJEKT-ID])
DATABASE_URL = postgresql://postgres:[IHR-PASSWORT]@db.[PROJEKT-ID].supabase.co:5432/postgres

# NextAuth (ersetzen Sie den geheimen Schlüssel)
NEXTAUTH_URL = https://ihre-app.vercel.app
NEXTAUTH_SECRET = generieren-sie-einen-zufaelligen-string-hier

# App Configuration
NEXT_PUBLIC_APP_URL = https://ihre-app.vercel.app
NEXT_PUBLIC_APP_NAME = LW Tasks
```

#### 3.2 NEXTAUTH_SECRET generieren:
```bash
# Öffnen Sie ein Terminal und führen Sie aus:
openssl rand -base64 32

# Oder verwenden Sie einen Online-Generator:
# https://generate-secret.vercel.app/32
```

### **Schritt 4: Lokale .env.local erstellen**

Erstellen Sie eine `.env.local` Datei im Projektverzeichnis:

```bash
# Database
DATABASE_URL="postgresql://postgres:[IHR-PASSWORT]@db.[PROJEKT-ID].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ihr-geheimer-schlüssel-hier"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="LW Tasks"
```

### **Schritt 5: Datenbank initialisieren**

#### 5.1 Lokal ausführen:
```bash
# Dependencies installieren
npm install

# Prisma-Client generieren
npx prisma generate

# Datenbank-Schema erstellen
npx prisma db push

# Seed-Daten erstellen
npx prisma db seed
```

#### 5.2 Admin-Benutzer erstellen:
```bash
# Admin-Benutzer wird automatisch erstellt:
# E-Mail: admin@lwtasks.com
# Passwort: (wird in der Konsole angezeigt)
```

### **Schritt 6: Deployment starten**

#### 6.1 In Vercel:
1. Klicken Sie auf **"Deploy"**
2. Warten Sie auf den Build-Prozess (2-3 Minuten)
3. Notieren Sie sich die **App-URL**

#### 6.2 Umgebungsvariablen aktualisieren:
1. Gehen Sie zu **"Settings"** → **"Environment Variables"**
2. Aktualisieren Sie `NEXTAUTH_URL` und `NEXT_PUBLIC_APP_URL` mit Ihrer echten URL
3. Klicken Sie auf **"Redeploy"**

### **Schritt 7: App testen**

#### 7.1 Web-App testen:
1. Öffnen Sie Ihre App-URL
2. Melden Sie sich mit dem Admin-Account an
3. Erstellen Sie eine Test-Aufgabe
4. Testen Sie alle Funktionen

#### 7.2 Mobile App installieren:
1. Öffnen Sie die App-URL auf Ihrem Smartphone
2. Tippen Sie auf **"Zum Startbildschirm hinzufügen"**
3. App-Icon erscheint wie eine echte App

### **Schritt 8: Team einrichten**

#### 8.1 Weitere Benutzer hinzufügen:
1. Melden Sie sich als Admin an
2. Gehen Sie zu **"Benutzer verwalten"**
3. Klicken Sie auf **"Neuer Benutzer"**
4. E-Mail + Passwort eingeben
5. Rolle zuweisen (Manager/User/Viewer)

#### 8.2 Projekte erstellen:
1. Gehen Sie zu **"Projekte"**
2. Klicken Sie auf **"Neues Projekt"**
3. Name und Beschreibung eingeben
4. Team-Mitglieder zuweisen

## 🎯 Nach dem Setup

### **Sofort verfügbar:**
- ✅ **Web-App** unter Ihrer Vercel-URL
- ✅ **Mobile App** als PWA
- ✅ **Admin-Dashboard** für Benutzerverwaltung
- ✅ **Projekt-Management** für Teams
- ✅ **Real-time Synchronisation** zwischen Geräten

### **Erste Schritte:**
1. **Alle Notizbuch-Daten** übertragen
2. **Team-Mitglieder** einladen
3. **Projekte** organisieren
4. **Workflows** etablieren

### **Support:**
- **GitHub Issues**: Technische Probleme
- **Vercel Dashboard**: Hosting-Status
- **Supabase Dashboard**: Datenbank-Status

## 🚀 Fertig!

Ihre LW Tasks App ist jetzt live und bereit für den produktiven Einsatz! 🎉✨

---

**Zeitaufwand**: 30-45 Minuten
**Kosten**: Kostenlos für den Start
**Skalierung**: Automatisch mit Ihrem Wachstum
