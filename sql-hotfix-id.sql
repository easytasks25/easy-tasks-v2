-- Schneller SQL-Hotfix für organizations.id Default
-- Führe dieses Script im Supabase SQL Editor aus

-- Prüfe den aktuellen Typ der id-Spalte
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations' 
AND column_name = 'id';

-- Erstelle pgcrypto Extension falls nicht vorhanden
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Setze Default für id-Spalte (funktioniert für text und uuid)
ALTER TABLE public.organizations 
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Prüfe das Ergebnis
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations' 
AND column_name = 'id';
