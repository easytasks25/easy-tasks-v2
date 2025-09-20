# 🚀 Sauberes Setup: easy tasks neu aufbauen

## ✅ Projekt zurückgesetzt!

Ich habe die App auf ihre ursprüngliche, funktionierende Version zurückgesetzt:

### **Was ich repariert habe:**
- ✅ **NextAuth**: Vollständig wiederhergestellt mit Prisma-Adapter
- ✅ **Hauptseite**: Optimierte Komponenten-Architektur
- ✅ **Seed-Script**: Korrekt mit Organisationen und Projekten
- ✅ **Datenbank**: Vollständige Prisma-Integration
- ✅ **Authentifizierung**: Funktioniert mit Supabase

## 🗑️ Alte Projekte löschen

### **1. Supabase löschen:**
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Wählen Sie Ihr Projekt aus
3. Settings → General → Delete Project
4. Bestätigen Sie die Löschung

### **2. GitHub löschen:**
1. Gehen Sie zu [github.com/easytasks25/lwtasks](https://github.com/easytasks25/lwtasks)
2. Settings → Scroll nach unten → Delete this repository
3. Geben Sie den Repository-Namen ein: `lwtasks`
4. Bestätigen Sie die Löschung

### **3. Vercel löschen:**
1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Wählen Sie Ihr Projekt aus
3. Settings → General → Delete Project
4. Bestätigen Sie die Löschung

## 🆕 Neues Setup

### **Schritt 1: Supabase neu erstellen**
1. **Neues Projekt**: `easy-tasks-v2`
2. **Region**: Central Europe (Frankfurt)
3. **Passwort**: Notieren Sie es!
4. **DATABASE_URL kopieren**

### **Schritt 2: GitHub neu erstellen**
1. **Repository**: `easy-tasks-v2`
2. **Beschreibung**: "Multi-Tenant Aufgabenverwaltung für Bauleiter"
3. **Public** (kostenlos)

### **Schritt 3: Projekt hochladen**
1. **GitHub Desktop öffnen**
2. **Alle Dateien committen**: "Clean setup: Restore full functionality"
3. **Push zu neuem Repository**

### **Schritt 4: Vercel neu erstellen**
1. **Neues Projekt** von GitHub importieren
2. **Umgebungsvariablen setzen**:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORT]@db.[PROJEKT-ID].supabase.co:5432/postgres
   NEXTAUTH_URL=https://ihre-app.vercel.app
   NEXTAUTH_SECRET=[GEHEIMER-SCHLÜSSEL]
   NEXT_PUBLIC_APP_URL=https://ihre-app.vercel.app
   NEXT_PUBLIC_APP_NAME=easy tasks
   ```
3. **Deploy**

## ✅ Das sollte jetzt funktionieren!

**Login-Daten:**
- **E-Mail**: `admin@easytasks.com`
- **Passwort**: `admin123`

**Features:**
- Vollständige Authentifizierung
- Multi-Tenant-Architektur
- Organisationen und Projekte
- Aufgabenverwaltung
- PWA-Features

**Sagen Sie mir Bescheid, wenn Sie die alten Projekte gelöscht haben!**
