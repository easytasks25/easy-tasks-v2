-- Erweitertes SQL-Fix für alle möglichen Probleme
-- Führe dieses Script im Supabase SQL Editor aus

-- 1. Prüfe alle Tabellen
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

-- 4. Erstelle pgcrypto Extension falls nicht vorhanden
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 5. Erstelle alle fehlenden Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrgType') THEN
    CREATE TYPE "OrgType" AS ENUM ('company','team');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrganizationRole') THEN
    CREATE TYPE "OrganizationRole" AS ENUM ('OWNER','ADMIN','MANAGER','MEMBER','VIEWER');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProjectRole') THEN
    CREATE TYPE "ProjectRole" AS ENUM ('OWNER','MANAGER','MEMBER','VIEWER');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskPriority') THEN
    CREATE TYPE "TaskPriority" AS ENUM ('LOW','MEDIUM','HIGH');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskStatus') THEN
    CREATE TYPE "TaskStatus" AS ENUM ('PENDING','IN_PROGRESS','COMPLETED','CANCELLED');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BucketType') THEN
    CREATE TYPE "BucketType" AS ENUM ('TODAY','TOMORROW','THIS_WEEK','CUSTOM');
  END IF;
END $$;

-- 6. Erstelle users Tabelle falls nicht vorhanden
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    password TEXT,
    avatar TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- 7. Erstelle organizations Tabelle falls nicht vorhanden
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type "OrgType" NOT NULL DEFAULT 'team',
    domain TEXT,
    settings JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- 8. Erstelle user_organizations Tabelle falls nicht vorhanden
CREATE TABLE IF NOT EXISTS public.user_organizations (
    id TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    role "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT user_organizations_pkey PRIMARY KEY (id)
);

-- 9. Erstelle projects Tabelle falls nicht vorhanden
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT projects_pkey PRIMARY KEY (id)
);

-- 10. Erstelle buckets Tabelle falls nicht vorhanden
CREATE TABLE IF NOT EXISTS public.buckets (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    type "BucketType" NOT NULL DEFAULT 'CUSTOM',
    color TEXT NOT NULL DEFAULT '#3b82f6',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    CONSTRAINT buckets_pkey PRIMARY KEY (id)
);

-- 11. Setze Defaults für alle ID-Spalten
ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.organizations 
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.user_organizations 
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.projects 
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.buckets 
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 12. Setze Defaults für updatedAt-Spalten
ALTER TABLE public.users 
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE public.organizations 
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE public.projects 
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE public.buckets 
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- 13. Erstelle Unique Constraints
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON public.users(email);
CREATE UNIQUE INDEX IF NOT EXISTS user_organizations_userId_organizationId_key ON public.user_organizations("userId", "organizationId");
CREATE UNIQUE INDEX IF NOT EXISTS buckets_userId_projectId_name_key ON public.buckets("userId", "projectId", name);

-- 14. Erstelle Foreign Key Constraints
ALTER TABLE public.organizations 
DROP CONSTRAINT IF EXISTS organizations_createdById_fkey,
ADD CONSTRAINT organizations_createdById_fkey 
FOREIGN KEY ("createdById") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_organizations 
DROP CONSTRAINT IF EXISTS user_organizations_userId_fkey,
ADD CONSTRAINT user_organizations_userId_fkey 
FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_organizations 
DROP CONSTRAINT IF EXISTS user_organizations_organizationId_fkey,
ADD CONSTRAINT user_organizations_organizationId_fkey 
FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_organizationId_fkey,
ADD CONSTRAINT projects_organizationId_fkey 
FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.buckets 
DROP CONSTRAINT IF EXISTS buckets_userId_fkey,
ADD CONSTRAINT buckets_userId_fkey 
FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.buckets 
DROP CONSTRAINT IF EXISTS buckets_organizationId_fkey,
ADD CONSTRAINT buckets_organizationId_fkey 
FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.buckets 
DROP CONSTRAINT IF EXISTS buckets_projectId_fkey,
ADD CONSTRAINT buckets_projectId_fkey 
FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE CASCADE;

-- 15. Finale Prüfung
SELECT 'users' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
UNION ALL
SELECT 'organizations' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'organizations'
UNION ALL
SELECT 'user_organizations' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_organizations'
UNION ALL
SELECT 'projects' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'projects'
UNION ALL
SELECT 'buckets' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'buckets'
ORDER BY table_name, column_name;
