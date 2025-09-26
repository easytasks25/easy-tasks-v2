# Datenbank-Migration in der Produktion

## Problem
Der Vercel-Build schlägt fehl, weil `prisma migrate deploy` während des Builds ausgeführt wird, aber die Datenbank-Verbindung nicht verfügbar ist.

## Lösung

### 1. Migration manuell ausführen
Nach dem Deployment auf Vercel, führe die Migration manuell aus:

```bash
# Lokal mit Produktions-Datenbank
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### 2. Oder über Vercel CLI
```bash
# Mit Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

### 3. Oder über Supabase Dashboard
1. Gehe zu deinem Supabase-Projekt
2. Öffne den SQL Editor
3. Führe die Migration-SQL-Dateien manuell aus

## Build-Script
Das Build-Script wurde angepasst:
- **Vorher**: `prisma migrate deploy && prisma generate && next build`
- **Jetzt**: `prisma generate && next build`

## Nächste Schritte
1. Committe die Änderungen
2. Pushe zu GitHub
3. Warte auf Vercel-Deployment
4. Führe die Migration manuell aus (siehe oben)

## Automatisierung (Optional)
Für zukünftige Deployments kannst du ein GitHub Action erstellen, das nach dem Vercel-Deployment automatisch die Migration ausführt.
