-- Supabase SQL-Funktion für Organisation-Erstellung mit Mitgliedschaft
-- Diese Funktion erstellt eine Organisation und fügt den Benutzer als Owner hinzu

CREATE OR REPLACE FUNCTION create_organization_with_member(
  org_name TEXT,
  org_type TEXT DEFAULT 'COMPANY',
  org_domain TEXT DEFAULT NULL,
  user_id UUID
)
RETURNS TABLE(organization_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Organisation erstellen
  INSERT INTO organizations (name, type, domain, owner_id)
  VALUES (org_name, org_type, org_domain, user_id)
  RETURNING id INTO new_org_id;
  
  -- Benutzer als Owner hinzufügen
  INSERT INTO organization_members (user_id, organization_id, role)
  VALUES (user_id, new_org_id, 'owner');
  
  -- Standard-Buckets erstellen
  INSERT INTO buckets (name, type, color, "order", user_id, organization_id)
  VALUES 
    ('Heute', 'today', '#ef4444', 1, user_id, new_org_id),
    ('Morgen', 'tomorrow', '#f97316', 2, user_id, new_org_id),
    ('Diese Woche', 'this_week', '#eab308', 3, user_id, new_org_id),
    ('Später', 'custom', '#6b7280', 4, user_id, new_org_id);
  
  RETURN QUERY SELECT new_org_id;
END;
$$;
