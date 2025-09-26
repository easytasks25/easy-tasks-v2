-- Demo-User für Login-Test erstellen
-- Führe dieses Script im Supabase SQL Editor aus

-- 1. Prüfe ob Demo-User bereits existiert
SELECT id, email, name FROM public.users WHERE email = 'demo@easy-tasks.de';

-- 2. Erstelle Demo-User falls nicht vorhanden
INSERT INTO public.users (id, email, name, password, "createdAt", "updatedAt")
VALUES (
  'demo-user-id',
  'demo@easy-tasks.de',
  'Demo Benutzer',
  '$2a$12$rT.bQzjW/w6ynBbhFnjnu.cErV51Jj8dV118miVFCJLJKTvp0/xeu', -- "demo123"
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- 3. Erstelle Demo-Organisation falls nicht vorhanden
INSERT INTO public.organizations (id, name, type, "createdById", "createdAt", "updatedAt")
VALUES (
  'demo-org-id',
  'easy tasks Demo',
  'team',
  'demo-user-id',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- 4. Füge Demo-User zur Organisation hinzu
INSERT INTO public.user_organizations (id, "userId", "organizationId", role, "joinedAt", "isActive")
VALUES (
  'demo-membership-id',
  'demo-user-id',
  'demo-org-id',
  'OWNER',
  CURRENT_TIMESTAMP,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 5. Prüfe das Ergebnis
SELECT 
  u.email,
  u.name,
  o.name as organization_name,
  uo.role
FROM public.users u
JOIN public.user_organizations uo ON u.id = uo."userId"
JOIN public.organizations o ON uo."organizationId" = o.id
WHERE u.email = 'demo@easy-tasks.de';
