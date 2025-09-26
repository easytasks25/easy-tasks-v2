import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // NextAuth.js Session prüfen
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    console.log('ORGANIZATIONS_API: Loading organizations for user:', userId)

    // Organisationen des Users laden
    const userOrganizations = await prisma.userOrganization.findMany({
      where: {
        userId: userId
      },
      include: {
        organization: true
      }
    })

    console.log('ORGANIZATIONS_API: Raw userOrganizations:', userOrganizations)

    const organizations = userOrganizations.map(uo => ({
      id: uo.organization.id,
      name: uo.organization.name,
      description: uo.organization.description,
      type: uo.organization.type,
      userRole: uo.role,
      createdAt: uo.organization.createdAt,
      updatedAt: uo.organization.updatedAt
    }))

    console.log('ORGANIZATIONS_API: Processed organizations:', organizations)

    return NextResponse.json({ 
      ok: true, 
      organizations 
    })

  } catch (error) {
    console.error('ORGANIZATIONS_ERROR', error)
    return NextResponse.json({ ok: false, reason: 'server-error' }, { status: 500 })
  }
}