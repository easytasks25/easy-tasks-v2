import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Get buckets for organization
    const { data: buckets, error } = await supabase
      .from('buckets')
      .select(`
        *,
        created_by_user:created_by (
          id,
          email,
          raw_user_meta_data
        )
      ` as any)
      .eq('organization_id', organizationId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching buckets:', error)
      return NextResponse.json({ error: 'Failed to fetch buckets' }, { status: 500 })
    }

    return NextResponse.json(buckets || [])
  } catch (error) {
    console.error('Error fetching buckets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch buckets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.organizationId) {
      return NextResponse.json(
        { error: 'Name and organizationId are required' },
        { status: 400 }
      )
    }

    // Create bucket
    const { data: bucket, error } = await supabase
      .from('buckets')
      .insert({
        name: body.name,
        description: body.description,
        color: body.color || '#3B82F6',
        organization_id: body.organizationId,
        created_by: user.id,
        is_default: body.isDefault || false,
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating bucket:', error)
      return NextResponse.json({ error: 'Failed to create bucket' }, { status: 500 })
    }

    return NextResponse.json(bucket, { status: 201 })
  } catch (error) {
    console.error('Error creating bucket:', error)
    return NextResponse.json(
      { error: 'Failed to create bucket' },
      { status: 500 }
    )
  }
}
