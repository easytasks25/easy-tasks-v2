-- Kompletter SQL-Fix für organizations Tabelle
-- Führe dieses Script im Supabase SQL Editor aus

-- 1. Prüfe aktuellen Status
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations' 
ORDER BY ordinal_position;

-- 2. Erstelle pgcrypto Extension falls nicht vorhanden
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Füge fehlende Spalten hinzu (falls nicht vorhanden)
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS description text;

-- 4. Erstelle OrgType Enum falls nicht vorhanden
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrgType') THEN
    CREATE TYPE "OrgType" AS ENUM ('company','team');
  END IF;
END $$;

-- 5. Füge type-Spalte hinzu falls nicht vorhanden
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS "type" "OrgType" NOT NULL DEFAULT 'team';

-- 6. Setze Default für id-Spalte
ALTER TABLE public.organizations 
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 7. Setze Default für updatedAt-Spalte
ALTER TABLE public.organizations 
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- 8. Prüfe das finale Ergebnis
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations' 
ORDER BY ordinal_position;
