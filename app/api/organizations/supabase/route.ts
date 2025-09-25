import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all organizations for the user
    const { data: memberships, error } = await supabase
      .from('organization_members')
      .select(`
        role,
        organizations (
          id,
          name,
          description,
          type,
          domain,
          created_at,
          updated_at
        )
      ` as any)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching organizations:', error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

    const organizations = memberships?.map((membership: any) => ({
      ...membership.organizations,
      userRole: membership.role,
    })) || []

    return NextResponse.json(organizations)
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, domain } = body

    // Create organization
    const orgResult = await supabase
      .from('organizations')
      .insert({
        name,
        description: `Organisation ${name}`,
        type: type === 'COMPANY' ? 'company' : 'team',
        domain,
        createdById: user.id,
      } as any)
      .select()
      .single()

    if (orgResult.error) {
      console.error('Error creating organization:', orgResult.error)
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
    }

    const organization = orgResult.data as any

    // Add creator as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        user_id: user.id,
        organization_id: organization.id,
        role: 'owner',
      } as any)

    if (memberError) {
      console.error('Error adding user to organization:', memberError)
      // Try to clean up the organization
      await supabase
        .from('organizations')
        .delete()
        .eq('id', organization.id)
      return NextResponse.json({ error: 'Failed to add user to organization' }, { status: 500 })
    }

    return NextResponse.json({
      ...organization,
      userRole: 'owner',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}