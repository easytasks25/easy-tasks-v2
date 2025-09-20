# 🏗️ Multi-User Setup für LW Tasks

## 📋 Übersicht

Diese Anleitung zeigt, wie Sie die LW Tasks App für mehrere Benutzer und Geräte einrichten.

## 🗄️ Datenbank-Setup

### 1. Supabase (Empfohlen)

#### Supabase-Projekt erstellen:
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein neues Projekt
3. Notieren Sie die Database URL

#### Umgebungsvariablen:
```bash
# .env.local
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
NEXTAUTH_URL="https://ihre-domain.vercel.app"
NEXTAUTH_SECRET="ihr-geheimer-schlüssel"
NEXT_PUBLIC_APP_URL="https://ihre-domain.vercel.app"
```

### 2. Alternative: PlanetScale (MySQL)

#### PlanetScale-Datenbank erstellen:
1. Gehen Sie zu [planetscale.com](https://planetscale.com)
2. Erstellen Sie eine neue Datenbank
3. Notieren Sie die Connection String

#### Prisma-Schema anpassen:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## 🚀 Deployment-Optionen

### Option 1: Vercel + Supabase (Empfohlen)

#### Vercel Setup:
1. **Repository zu GitHub pushen**
2. **Vercel-Projekt erstellen**
3. **Umgebungsvariablen setzen**
4. **Deploy**

#### Supabase Setup:
1. **Datenbank-Migrationen ausführen**
2. **Row Level Security aktivieren**
3. **API-Keys konfigurieren**

### Option 2: Railway (All-in-One)

#### Railway Setup:
1. **Railway-Account erstellen**
2. **PostgreSQL-Datenbank hinzufügen**
3. **App deployen**
4. **Umgebungsvariablen setzen**

### Option 3: AWS (Enterprise)

#### AWS Setup:
1. **RDS PostgreSQL erstellen**
2. **ECS/EKS für App**
3. **CloudFront für CDN**
4. **Route 53 für DNS**

## 👥 Benutzer-Management

### Benutzerrollen:

#### Admin:
- ✅ **Alle Projekte verwalten**
- ✅ **Benutzer hinzufügen/entfernen**
- ✅ **System-Einstellungen**
- ✅ **Alle Aufgaben einsehen**

#### Manager:
- ✅ **Projekt-spezifische Verwaltung**
- ✅ **Team-Mitglieder verwalten**
- ✅ **Aufgaben zuweisen**
- ✅ **Berichte erstellen**

#### User:
- ✅ **Eigene Aufgaben verwalten**
- ✅ **Projekt-Aufgaben einsehen**
- ✅ **Sprachnotizen erstellen**
- ✅ **Fotos hochladen**

#### Viewer:
- ✅ **Nur Lesen-Zugriff**
- ✅ **Aufgaben einsehen**
- ✅ **Berichte anzeigen**

### Benutzer-Erstellung:

#### Automatische Registrierung:
```typescript
// app/api/auth/register/route.ts
export async function POST(request: NextRequest) {
  const { email, password, name, role } = await request.json()
  
  // Benutzer erstellen
  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 12),
      name,
      role: role || 'USER'
    }
  })
  
  // Standard-Projekt zuweisen
  await prisma.projectUser.create({
    data: {
      userId: user.id,
      projectId: 'default-project',
      role: 'MEMBER'
    }
  })
}
```

#### Admin-Erstellung:
```bash
# Admin-Benutzer erstellen
npm run db:seed
```

## 🔐 Sicherheit

### Row Level Security (RLS):

#### Supabase RLS Policies:
```sql
-- Tasks können nur von Projekt-Mitgliedern gesehen werden
CREATE POLICY "Users can view tasks from their projects" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_users pu
      WHERE pu.user_id = auth.uid()
      AND pu.project_id = tasks.project_id
    )
  );

-- Benutzer können nur eigene Aufgaben bearbeiten
CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (user_id = auth.uid());
```

### API-Sicherheit:

#### Middleware für Authentifizierung:
```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Zusätzliche Sicherheitsprüfungen
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/api/tasks/:path*", "/api/buckets/:path*", "/api/projects/:path*"]
}
```

## 📱 Mobile Synchronisation

### Offline-First-Ansatz:

#### Service Worker:
```typescript
// public/sw.js
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncTasks())
  }
})

async function syncTasks() {
  // Offline-Änderungen synchronisieren
  const offlineTasks = await getOfflineTasks()
  for (const task of offlineTasks) {
    await syncTask(task)
  }
}
```

#### Optimistic Updates:
```typescript
// hooks/useTasks.ts
const updateTask = async (id: string, updates: Partial<Task>) => {
  // Sofortige UI-Aktualisierung
  setTasks(prev => prev.map(task => 
    task.id === id ? { ...task, ...updates } : task
  ))
  
  try {
    // Server-Synchronisation
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  } catch (error) {
    // Rollback bei Fehler
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...originalTask } : task
    ))
  }
}
```

## 🔄 Real-time Updates

### WebSocket-Integration:

#### Supabase Realtime:
```typescript
// hooks/useRealtimeTasks.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function useRealtimeTasks(projectId: string) {
  useEffect(() => {
    const channel = supabase
      .channel('tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          // Task-Updates in Echtzeit
          updateTaskInState(payload)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [projectId])
}
```

## 📊 Monitoring & Analytics

### Benutzer-Aktivität:

#### Audit-Log:
```typescript
// lib/audit.ts
export async function logActivity(
  userId: string,
  action: string,
  resource: string,
  details?: any
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      details: JSON.stringify(details),
      timestamp: new Date()
    }
  })
}
```

### Performance-Monitoring:

#### Vercel Analytics:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 🚀 Deployment-Checkliste

### Vor dem Deployment:
- [ ] **Datenbank eingerichtet**
- [ ] **Umgebungsvariablen konfiguriert**
- [ ] **Prisma-Migrationen ausgeführt**
- [ ] **Admin-Benutzer erstellt**
- [ ] **SSL-Zertifikat aktiviert**
- [ ] **Domain konfiguriert**

### Nach dem Deployment:
- [ ] **App lädt korrekt**
- [ ] **Anmeldung funktioniert**
- [ ] **Aufgaben werden gespeichert**
- [ ] **Mobile-App funktioniert**
- [ ] **Offline-Modus getestet**
- [ ] **Multi-User-Zugriff getestet**

## 🔧 Troubleshooting

### Häufige Probleme:

#### Datenbank-Verbindung:
```bash
# Prisma-Client neu generieren
npm run db:generate

# Datenbank-Status prüfen
npm run db:studio
```

#### Authentifizierung:
```bash
# Session-Cookies löschen
# Browser-Entwicklertools → Application → Cookies
```

#### Mobile-Sync:
```bash
# Service Worker neu laden
# Browser-Entwicklertools → Application → Service Workers
```

## 📞 Support

Bei Problemen:
1. **GitHub Issues** erstellen
2. **Logs prüfen** (Vercel/Railway Dashboard)
3. **Datenbank-Status** überprüfen
4. **Umgebungsvariablen** validieren

---

**Die App ist jetzt bereit für Multi-User-Betrieb!** 🚀✨
