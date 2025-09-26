import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

const inviteSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER']).default('MEMBER'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = inviteSchema.parse(body)
    const { email, role } = validatedData

    // Check if user has permission to invite to this organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId: params.id,
        role: {
          in: ['OWNER', 'ADMIN']
        }
      }
    })

    if (!userOrg) {
      return NextResponse.json({ error: 'Keine Berechtigung für Einladungen' }, { status: 403 })
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          where: {
            organizationId: params.id
          }
        }
      }
    })

    if (existingUser?.organizations && existingUser.organizations.length > 0) {
      return NextResponse.json({ error: 'Benutzer ist bereits Mitglied der Organisation' }, { status: 400 })
    }

    // Check for existing invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        organizationId: params.id,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Einladung bereits versendet' }, { status: 400 })
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email,
        organizationId: params.id,
        role,
        token,
        expiresAt,
        invitedById: session.user.id
      },
      include: {
        organization: true
      }
    })

    // TODO: Send email with invitation link
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

    return NextResponse.json({
      invitation,
      invitationUrl,
      qrCodeData: invitationUrl
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating invitation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
