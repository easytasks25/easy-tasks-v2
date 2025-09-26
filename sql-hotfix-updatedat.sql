-- Schneller SQL-Hotfix für organizations.updatedAt Default
-- Führe dieses Script im Supabase SQL Editor aus

-- Prüfe den aktuellen Status der updatedAt-Spalte
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations' 
AND column_name = 'updatedAt';

-- Setze Default für updatedAt-Spalte
ALTER TABLE public.organizations 
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Prüfe das Ergebnis
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations' 
AND column_name = 'updatedAt';
