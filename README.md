# 🏗️ LW Tasks - Bauleiter Aufgabenverwaltung

Eine moderne, digitale Aufgabenverwaltung speziell für Bauleiter mit Multi-User-Support, Real-time-Synchronisation und PWA-Funktionalität.

## ✨ Features

### 🎯 Kernfunktionen
- **Multi-User-System** mit Rollen-basierter Zugriffskontrolle
- **Bucket-System** für Aufgabenorganisation (Heute, Morgen, Diese Woche)
- **Real-time Synchronisation** zwischen allen Geräten
- **PWA-Funktionalität** - funktioniert wie eine native App
- **Offline-Modus** mit automatischer Synchronisation
- **Sprachaufnahmen** mit Transkription
- **Foto-Upload** für Baustellen-Dokumentation
- **Kalender-Integration** mit Drag & Drop
- **Projekt-Management** für Teams

### 🔐 Benutzerrollen
- **Admin**: Vollzugriff auf alle Projekte und Benutzer
- **Manager**: Projekt-spezifische Verwaltung
- **User**: Eigene Aufgaben + Projekt-Zugriff
- **Viewer**: Nur Lesen-Zugriff

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 18+ 
- PostgreSQL-Datenbank (Supabase empfohlen)
- Git

### 1. Repository klonen
```bash
git clone https://github.com/ihr-username/lwtasks.git
cd lwtasks
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren
Erstellen Sie eine `.env.local` Datei:

```bash
# Database
DATABASE_URL="postgresql://postgres:[PASSWORT]@db.[PROJEKT-ID].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ihr-geheimer-schlüssel-hier"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="LW Tasks"
```

### 4. Datenbank einrichten
```bash
# Prisma-Client generieren
npm run db:generate

# Datenbank-Schema erstellen
npm run db:push

# Admin-Benutzer und Standard-Daten erstellen
npm run db:setup
```

### 5. Entwicklungsserver starten
```bash
npm run dev
```

Die App ist jetzt unter [http://localhost:3000](http://localhost:3000) verfügbar.

## 🌐 Deployment

### Vercel + Supabase (Empfohlen)

#### 1. Supabase einrichten
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein neues Projekt
3. Kopieren Sie die DATABASE_URL

#### 2. Vercel deployen
1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Importieren Sie Ihr GitHub-Repository
3. Setzen Sie die Umgebungsvariablen
4. Deployen Sie die App

#### 3. Datenbank initialisieren
```bash
# Lokal ausführen
npm run db:setup
```

### Alternative Deployment-Optionen
- **Railway**: All-in-One Hosting
- **AWS**: Enterprise-Lösung
- **Netlify**: Static Hosting (ohne Backend)

## 📱 Mobile App

### PWA Installation
1. Öffnen Sie die App-URL auf Ihrem Smartphone
2. Tippen Sie auf "Zum Startbildschirm hinzufügen"
3. App-Icon erscheint wie eine native App

### Offline-Funktionalität
- Alle Daten werden lokal gespeichert
- Automatische Synchronisation bei Internetverbindung
- Funktioniert auch ohne Internet

## 👥 Team-Einrichtung

### Admin-Benutzer
- **E-Mail**: admin@lwtasks.com
- **Passwort**: admin123 (nach Setup)

### Weitere Benutzer hinzufügen
1. Melden Sie sich als Admin an
2. Gehen Sie zu "Benutzer verwalten"
3. Klicken Sie auf "Neuer Benutzer"
4. E-Mail + Passwort eingeben
5. Rolle zuweisen

### Projekte erstellen
1. Gehen Sie zu "Projekte"
2. Klicken Sie auf "Neues Projekt"
3. Name und Beschreibung eingeben
4. Team-Mitglieder zuweisen

## 🔧 Entwicklung

### Projekt-Struktur
```
lwtasks/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Authentifizierung
│   └── page.tsx           # Hauptseite
├── components/            # React-Komponenten
├── hooks/                 # Custom Hooks
├── lib/                   # Utilities
├── prisma/                # Datenbank-Schema
├── public/                # Statische Dateien
└── types/                 # TypeScript-Typen
```

### Verfügbare Scripts
```bash
npm run dev          # Entwicklungsserver
npm run build        # Production Build
npm run start        # Production Server
npm run lint         # Code-Linting
npm run db:generate  # Prisma-Client generieren
npm run db:push      # Datenbank-Schema aktualisieren
npm run db:setup     # Datenbank initialisieren
npm run db:studio    # Prisma Studio öffnen
```

### Datenbank-Management
```bash
# Prisma Studio öffnen
npm run db:studio

# Datenbank-Migrationen
npm run db:migrate

# Seed-Daten erstellen
npm run db:seed
```

## 🔐 Sicherheit

### Authentifizierung
- JWT-basierte Sessions
- Passwort-Hashing mit bcrypt
- Session-Management mit NextAuth.js

### Datenbank-Sicherheit
- Row Level Security (RLS)
- Benutzer-spezifische Datenfilterung
- Projekt-basierte Zugriffskontrolle

### API-Sicherheit
- Middleware für Authentifizierung
- CORS-Konfiguration
- Rate Limiting (empfohlen)

## 📊 Monitoring

### Vercel Analytics
- Besucher-Statistiken
- Performance-Monitoring
- Error Tracking

### Supabase Dashboard
- Datenbank-Performance
- API-Usage
- Real-time Monitoring

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch
3. Committen Sie Ihre Änderungen
4. Pushen Sie zum Branch
5. Erstellen Sie einen Pull Request

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🆘 Support

### Häufige Probleme
- **Datenbank-Verbindung**: Prüfen Sie die DATABASE_URL
- **Authentifizierung**: Überprüfen Sie NEXTAUTH_SECRET
- **Mobile App**: Löschen Sie Browser-Cache

### Hilfe erhalten
- **GitHub Issues**: Technische Probleme
- **Vercel Support**: Hosting-Probleme
- **Supabase Support**: Datenbank-Probleme

## 🎯 Roadmap

### Geplante Features
- [ ] **E-Mail-Integration** für Outlook
- [ ] **Push-Benachrichtigungen**
- [ ] **Erweiterte Berichte**
- [ ] **API für Drittanbieter**
- [ ] **Mobile App** (React Native)

---

**Entwickelt mit ❤️ für Bauleiter und ihre Teams** 🏗️✨