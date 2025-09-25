-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'member');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed', 'cancelled');

-- Organizations table
CREATE TABLE organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Organization members table
CREATE TABLE organization_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id),
    UNIQUE(organization_id, user_id)
);

-- Buckets table
CREATE TABLE buckets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority task_priority NOT NULL DEFAULT 'medium',
    status task_status NOT NULL DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id),
    category TEXT,
    location TEXT,
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id)
);

-- Task buckets junction table
CREATE TABLE task_buckets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    bucket_id UUID REFERENCES buckets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, bucket_id)
);

-- Task history table
CREATE TABLE task_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_tasks_organization_id ON tasks(organization_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_buckets_organization_id ON buckets(organization_id);
CREATE INDEX idx_task_buckets_task_id ON task_buckets(task_id);
CREATE INDEX idx_task_buckets_bucket_id ON task_buckets(bucket_id);
CREATE INDEX idx_task_history_task_id ON task_history(task_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buckets_updated_at BEFORE UPDATE ON buckets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their organizations" ON organizations
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their organizations" ON organizations
    FOR DELETE USING (auth.uid() = owner_id);

-- Organization members policies
CREATE POLICY "Users can view members of their organizations" ON organization_members
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization owners and admins can manage members" ON organization_members
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Buckets policies
CREATE POLICY "Users can view buckets of their organizations" ON buckets
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create buckets in their organizations" ON buckets
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update buckets in their organizations" ON buckets
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete buckets in their organizations" ON buckets
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

-- Tasks policies
CREATE POLICY "Users can view tasks of their organizations" ON tasks
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks in their organizations" ON tasks
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks in their organizations" ON tasks
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tasks in their organizations" ON tasks
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

-- Task buckets policies
CREATE POLICY "Users can view task buckets of their organizations" ON task_buckets
    FOR SELECT USING (
        task_id IN (
            SELECT id 
            FROM tasks 
            WHERE organization_id IN (
                SELECT organization_id 
                FROM organization_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage task buckets in their organizations" ON task_buckets
    FOR ALL USING (
        task_id IN (
            SELECT id 
            FROM tasks 
            WHERE organization_id IN (
                SELECT organization_id 
                FROM organization_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Task history policies
CREATE POLICY "Users can view task history of their organizations" ON task_history
    FOR SELECT USING (
        task_id IN (
            SELECT id 
            FROM tasks 
            WHERE organization_id IN (
                SELECT organization_id 
                FROM organization_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create task history in their organizations" ON task_history
    FOR INSERT WITH CHECK (
        task_id IN (
            SELECT id 
            FROM tasks 
            WHERE organization_id IN (
                SELECT organization_id 
                FROM organization_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Create default buckets for new organizations
CREATE OR REPLACE FUNCTION create_default_buckets()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default buckets for the new organization
    INSERT INTO buckets (name, description, color, organization_id, created_by, is_default)
    VALUES 
        ('Heute', 'Aufgaben für heute', '#EF4444', NEW.id, NEW.owner_id, true),
        ('Diese Woche', 'Aufgaben für diese Woche', '#F59E0B', NEW.id, NEW.owner_id, true),
        ('Diesen Monat', 'Aufgaben für diesen Monat', '#10B981', NEW.id, NEW.owner_id, true),
        ('Später', 'Aufgaben ohne festes Datum', '#6B7280', NEW.id, NEW.owner_id, true);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for default buckets
CREATE TRIGGER create_default_buckets_trigger
    AFTER INSERT ON organizations
    FOR EACH ROW EXECUTE FUNCTION create_default_buckets();

-- Create function to automatically add owner as member
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for adding owner as member
CREATE TRIGGER add_owner_as_member_trigger
    AFTER INSERT ON organizations
    FOR EACH ROW EXECUTE FUNCTION add_owner_as_member();
