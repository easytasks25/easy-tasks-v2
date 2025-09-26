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

    // User-Details laden
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    // Organisationen des Users laden
    const userOrganizations = await prisma.userOrganization.findMany({
      where: {
        userId: userId,
        isActive: true  // Nur aktive Mitgliedschaften
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json({ 
      ok: true, 
      user,
      organizations: userOrganizations.map(uo => ({
        id: uo.organization.id,
        name: uo.organization.name,
        type: uo.organization.type,
        role: uo.role,
        createdAt: uo.organization.createdAt
      }))
    })

  } catch (error) {
    console.error('DEBUG_REGISTRATION_ERROR', error)
    return NextResponse.json({ ok: false, reason: 'server-error', error: String(error) }, { status: 500 })
  }
}
