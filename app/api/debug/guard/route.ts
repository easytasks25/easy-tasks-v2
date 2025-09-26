import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Session prüfen
    const session = await getServerSession(authOptions)
    console.log('GUARD_DEBUG: Session:', session)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        ok: false, 
        reason: 'no-session',
        session: session 
      }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email
    console.log('GUARD_DEBUG: User ID:', userId, 'Email:', userEmail)

    // 2. User finden
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!user && userEmail) {
      console.log('GUARD_DEBUG: User not found by ID, trying email')
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true, email: true, name: true }
      })
    }

    if (!user) {
      return NextResponse.json({ 
        ok: false, 
        reason: 'user-not-found',
        userId,
        userEmail
      }, { status: 404 })
    }

    console.log('GUARD_DEBUG: Found user:', user)

    // 3. Membership count prüfen (das ist der Guard!)
    const membershipCount = await prisma.userOrganization.count({
      where: { 
        userId: user.id,
        isActive: true 
      }
    })

    console.log('GUARD_DEBUG: Membership count:', membershipCount)

    // 4. Detaillierte Membership-Info
    const memberships = await prisma.userOrganization.findMany({
      where: { 
        userId: user.id,
        isActive: true 
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

    console.log('GUARD_DEBUG: Memberships:', memberships)

    // 5. Guard-Entscheidung
    const shouldRedirectToCreate = membershipCount === 0

    return NextResponse.json({ 
      ok: true,
      session: {
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name
      },
      user: user,
      membershipCount,
      memberships: memberships.map(m => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt,
        organization: m.organization
      })),
      guardDecision: {
        shouldRedirectToCreate,
        reason: shouldRedirectToCreate ? 'no-memberships' : 'has-memberships'
      }
    })

  } catch (error) {
    console.error('GUARD_DEBUG_ERROR', error)
    return NextResponse.json({ 
      ok: false, 
      reason: 'server-error',
      error: String(error)
    }, { status: 500 })
  }
}
