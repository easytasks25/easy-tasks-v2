import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = { 
  name: string
  type: 'COMPANY' | 'PERSONAL'
  domain?: string
}

export async function POST(req: Request) {
  try {
    // NextAuth.js Session prüfen
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const { name, type, domain } = (await req.json()) as Body

    if (!name?.trim()) {
      return NextResponse.json({ ok: false, error: 'missing_organization_name' }, { status: 400 })
    }
    
    if (type !== 'COMPANY' && type !== 'PERSONAL') {
      return NextResponse.json({ ok: false, error: 'invalid_org_type' }, { status: 400 })
    }

    // Prisma verwenden für Organisation-Erstellung
    const result = await prisma.$transaction(async (tx) => {
      // Organisation erstellen
      const organization = await tx.organization.create({
        data: {
          name: name.trim(),
          type: type === 'COMPANY' ? 'company' : 'team',
          domain: domain || null,
          createdById: userId
        }
      })

      // Benutzer als Owner hinzufügen
      await tx.userOrganization.create({
        data: {
          userId: userId,
          organizationId: organization.id,
          role: 'OWNER'
        }
      })

      // Standard-Buckets erstellen
      const buckets = [
        { name: 'Heute', type: 'TODAY' as const, color: '#ef4444', order: 1 },
        { name: 'Morgen', type: 'TOMORROW' as const, color: '#f97316', order: 2 },
        { name: 'Diese Woche', type: 'THIS_WEEK' as const, color: '#eab308', order: 3 },
        { name: 'Später', type: 'CUSTOM' as const, color: '#6b7280', order: 4 }
      ]

      await tx.bucket.createMany({
        data: buckets.map(bucket => ({
          ...bucket,
          userId: userId,
          organizationId: organization.id
        }))
      })

      return { organizationId: organization.id }
    })

    return NextResponse.json({ 
      ok: true, 
      organizationId: result.organizationId,
      message: 'Organization created successfully'
    })
  } catch (e: any) {
    console.error('ORG_CREATE_ERROR', e)
    
    // Prisma-spezifische Fehlerbehandlung
    if (e?.code === 'P2002') {
      // Unique-Constraint verletzt
      return NextResponse.json({ 
        ok: false, 
        error: 'unique_violation', 
        detail: 'Organization name already exists' 
      }, { status: 409 })
    }
    
    if (e?.code === 'P1001') {
      return NextResponse.json({ 
        ok: false, 
        error: 'db_unreachable' 
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      ok: false, 
      error: 'server_error',
      detail: e.message 
    }, { status: 500 })
  }
}
