import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'manager' | 'member'
  joined_at: string
  invited_by?: string
  user?: User
}

// Client-side auth functions
export const supabaseAuth = {
  async signUp(email: string, password: string, name?: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    })

    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  async signOut() {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const supabase = createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        organizations (
          id,
          name,
          description,
          owner_id,
          created_at,
          updated_at
        )
      ` as any)
      .eq('user_id', userId)

    if (error) throw error
    
    return data?.map((item: any) => item.organizations).filter(Boolean) as Organization[]
  },

  async getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        organization_id,
        user_id,
        role,
        joined_at,
        invited_by,
        user:user_id (
          id,
          email,
          raw_user_meta_data
        )
      ` as any)
      .eq('organization_id', organizationId)

    if (error) throw error
    
    return data?.map((member: any) => ({
      ...member,
      user: member.user ? {
        id: member.user.id,
        email: member.user.email,
        name: member.user.raw_user_meta_data?.name || member.user.email.split('@')[0],
        avatar_url: member.user.raw_user_meta_data?.avatar_url,
        created_at: member.user.raw_user_meta_data?.created_at || new Date().toISOString(),
        updated_at: member.user.raw_user_meta_data?.updated_at || new Date().toISOString(),
      } : undefined
    })) as OrganizationMember[]
  },

  async createOrganization(name: string, description?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name,
        description,
        owner_id: user.id,
      } as any)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async inviteUserToOrganization(organizationId: string, email: string, role: 'admin' | 'manager' | 'member' = 'member') {
    const supabase = createClient()
    
    // First, get the user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) throw userError
    
    const invitedUser = users.find(u => u.email === email)
    if (!invitedUser) {
      throw new Error('User not found')
    }

    // Add user to organization
    const { data, error } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: invitedUser.id,
        role,
      } as any)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Server-side auth functions
export const supabaseServerAuth = {
  async getCurrentUser() {
    const supabase = createServerClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        organizations (
          id,
          name,
          description,
          owner_id,
          created_at,
          updated_at
        )
      ` as any)
      .eq('user_id', userId)

    if (error) throw error
    
    return data?.map((item: any) => item.organizations).filter(Boolean) as Organization[]
  }
}
