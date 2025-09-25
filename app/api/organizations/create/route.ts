import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Body = { 
  name: string
  type: 'COMPANY' | 'PERSONAL'
  domain?: string
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const { name, type, domain } = (await req.json()) as Body

    if (!name?.trim()) {
      return NextResponse.json({ ok: false, error: 'missing_organization_name' }, { status: 400 })
    }
    
    if (type !== 'COMPANY' && type !== 'PERSONAL') {
      return NextResponse.json({ ok: false, error: 'invalid_org_type' }, { status: 400 })
    }

    // Verwende die bestehende Supabase-API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
      body: JSON.stringify({
        name: name.trim(),
        type: type,
        domain: domain || null,
        owner_id: user.id
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('ORG_CREATE_ERROR', errorData)
      
      if (response.status === 409) {
        return NextResponse.json({ 
          ok: false, 
          error: 'unique_violation', 
          detail: 'Organization name already exists' 
        }, { status: 409 })
      }
      
      return NextResponse.json({ 
        ok: false, 
        error: 'server_error',
        detail: errorData.message || 'Failed to create organization'
      }, { status: response.status })
    }

    const organization = await response.json()

    // Benutzer als Owner hinzufügen
    const memberResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/organization_members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
      body: JSON.stringify({
        user_id: user.id,
        organization_id: organization.id,
        role: 'owner'
      })
    })

    if (!memberResponse.ok) {
      console.error('MEMBER_CREATE_ERROR', await memberResponse.json())
      return NextResponse.json({ 
        ok: false, 
        error: 'server_error',
        detail: 'Failed to add user as member' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      ok: true, 
      organizationId: organization.id,
      message: 'Organization created successfully'
    })
  } catch (e: any) {
    console.error('ORG_CREATE_ERROR', e)
    return NextResponse.json({ 
      ok: false, 
      error: 'server_error',
      detail: e.message 
    }, { status: 500 })
  }
}
