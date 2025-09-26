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
    const userEmail = session.user.email

    console.log('DEBUG_API: Session user ID:', userId)
    console.log('DEBUG_API: Session user email:', userEmail)

    // User-Details laden (versuche sowohl ID als auch Email)
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    // Falls User nicht über ID gefunden, versuche über Email
    if (!user && userEmail) {
      console.log('DEBUG_API: User not found by ID, trying email')
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      })
    }

    console.log('DEBUG_API: Found user:', user)

    // Organisationen des Users laden (verwende die gefundene User-ID)
    const actualUserId = user?.id || userId
    console.log('DEBUG_API: Using user ID for organizations:', actualUserId)
    
    const userOrganizations = await prisma.userOrganization.findMany({
      where: {
        userId: actualUserId,
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
