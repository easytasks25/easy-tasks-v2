# Supabase Setup Anleitung

## 1. Supabase Projekt erstellen

1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein neues Konto oder loggen Sie sich ein
3. Klicken Sie auf "New Project"
4. Wählen Sie Ihre Organisation
5. Geben Sie folgende Details ein:
   - **Name**: `easy-tasks`
   - **Database Password**: Generieren Sie ein sicheres Passwort
   - **Region**: Wählen Sie die nächstgelegene Region (z.B. `Central EU`)

## 2. Datenbankschema einrichten

1. Gehen Sie zu **SQL Editor** in Ihrem Supabase Dashboard
2. Kopieren Sie den Inhalt von `supabase/schema.sql`
3. Fügen Sie das SQL in den Editor ein
4. Klicken Sie auf **Run** um das Schema zu erstellen

## 3. Umgebungsvariablen konfigurieren

1. Gehen Sie zu **Settings** → **API** in Ihrem Supabase Dashboard
2. Kopieren Sie die folgenden Werte:
   - **Project URL**
   - **anon public key**
   - **service_role key** (für Admin-Operationen)

3. Erstellen Sie eine `.env.local` Datei in Ihrem Projekt:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="easy-tasks"
```

## 4. Authentifizierung konfigurieren

1. Gehen Sie zu **Authentication** → **Settings** in Ihrem Supabase Dashboard
2. Konfigurieren Sie die **Site URL**: `http://localhost:3000` (für Entwicklung)
3. Fügen Sie **Redirect URLs** hinzu:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (für Produktion)

## 5. E-Mail-Konfiguration (optional)

1. Gehen Sie zu **Authentication** → **Settings** → **SMTP Settings**
2. Konfigurieren Sie Ihren E-Mail-Provider:
   - **Gmail**: Verwenden Sie App-Passwörter
   - **SendGrid**: API-Key verwenden
   - **Andere**: SMTP-Details eingeben

## 6. Erste Organisation erstellen

Nach dem Setup können Sie:

1. Die App starten: `npm run dev`
2. Ein Konto registrieren
3. Eine Organisation erstellen
4. Team-Mitglieder einladen

## 7. Produktions-Deployment

Für Vercel:

1. Fügen Sie die Umgebungsvariablen in Vercel hinzu
2. Aktualisieren Sie die **Site URL** in Supabase auf Ihre Vercel-Domain
3. Fügen Sie die Produktions-URL zu den **Redirect URLs** hinzu

## 8. Datenbank-Features

Das Schema enthält:

- **Organizations**: Unternehmen/Teams
- **Organization Members**: Benutzer mit Rollen
- **Tasks**: Aufgaben mit vollständiger Historie
- **Buckets**: Kategorien für Aufgaben
- **Task History**: Änderungsprotokoll
- **Row Level Security**: Automatische Berechtigungen

## 9. Rollen und Berechtigungen

- **Owner**: Vollzugriff auf Organisation
- **Admin**: Kann Mitglieder verwalten
- **Manager**: Kann Aufgaben verwalten
- **Member**: Kann eigene Aufgaben bearbeiten

## 10. Nützliche Queries

```sql
-- Alle Aufgaben einer Organisation
SELECT * FROM tasks WHERE organization_id = 'your-org-id';

-- Team-Mitglieder mit Rollen
SELECT om.*, u.email 
FROM organization_members om
JOIN auth.users u ON om.user_id = u.id
WHERE om.organization_id = 'your-org-id';

-- Aufgaben-Historie
SELECT th.*, u.email as changed_by
FROM task_history th
JOIN auth.users u ON th.created_by = u.id
WHERE th.task_id = 'your-task-id';
```

## Troubleshooting

### Häufige Probleme:

1. **RLS-Fehler**: Stellen Sie sicher, dass der Benutzer Mitglied der Organisation ist
2. **Auth-Fehler**: Überprüfen Sie die Redirect URLs
3. **CORS-Fehler**: Überprüfen Sie die Site URL in den Auth-Einstellungen

### Support:

- [Supabase Dokumentation](https://supabase.com/docs)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
