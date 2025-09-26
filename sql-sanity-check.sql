-- DB-Sanity-Check für Registrierung
-- Führe dieses Script im Supabase SQL Editor aus

-- 1. Prüfe existierende Tabellen
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Prüfe users Tabelle
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
ORDER BY ordinal_position;

-- 3. Prüfe organizations Tabelle
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations' 
ORDER BY ordinal_position;

-- 4. Prüfe user_organizations Tabelle
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_organizations' 
ORDER BY ordinal_position;

-- 5. Prüfe Enums
SELECT typname, enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname IN ('OrgType', 'OrganizationRole', 'ProjectRole', 'TaskPriority', 'TaskStatus', 'BucketType')
ORDER BY typname, enumlabel;

-- 6. Test-Insert (nur wenn Tabellen existieren)
-- Führe das nur aus, wenn die obigen Queries erfolgreich waren

-- Test User erstellen
INSERT INTO public.users (id, email, name, password) 
VALUES ('test-user-debug', 'test@debug.com', 'Test User', 'test-password')
ON CONFLICT (id) DO NOTHING;

-- Test Organization erstellen
INSERT INTO public.organizations (id, name, type, "createdById") 
VALUES ('test-org-debug', 'Test Organization', 'team', 'test-user-debug')
ON CONFLICT (id) DO NOTHING;

-- Test UserOrganization erstellen
INSERT INTO public.user_organizations (id, "userId", "organizationId", role) 
VALUES ('test-membership-debug', 'test-user-debug', 'test-org-debug', 'OWNER')
ON CONFLICT (id) DO NOTHING;

-- 7. Prüfe ob Test-Daten erstellt wurden
SELECT 'users' as table_name, COUNT(*) as count FROM public.users WHERE id = 'test-user-debug'
UNION ALL
SELECT 'organizations' as table_name, COUNT(*) as count FROM public.organizations WHERE id = 'test-org-debug'
UNION ALL
SELECT 'user_organizations' as table_name, COUNT(*) as count FROM public.user_organizations WHERE id = 'test-membership-debug';

-- 8. Cleanup (optional - entfernt Test-Daten)
-- DELETE FROM public.user_organizations WHERE id = 'test-membership-debug';
-- DELETE FROM public.organizations WHERE id = 'test-org-debug';
-- DELETE FROM public.users WHERE id = 'test-user-debug';
