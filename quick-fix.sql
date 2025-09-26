-- Schnellfix für fehlende Spalten in Supabase
-- Führe dieses Script im Supabase SQL Editor aus

-- Spalte "description" ergänzen, falls sie fehlt
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS description text;

-- Enum + type-Spalte sicherstellen:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrgType') THEN
    CREATE TYPE "OrgType" AS ENUM ('company','team');
  END IF;
END $$;

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS "type" "OrgType" NOT NULL DEFAULT 'team';

-- Prüfen ob alles korrekt ist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
ORDER BY ordinal_position;
