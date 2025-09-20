import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const acceptInvitationSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token: params.token },
      include: {
        organization: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Einladung nicht gefunden' }, { status: 404 })
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Einladung ist abgelaufen' }, { status: 400 })
    }

    if (invitation.acceptedAt) {
      return NextResponse.json({ error: 'Einladung wurde bereits akzeptiert' }, { status: 400 })
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        organization: invitation.organization
      }
    })
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json()
    const validatedData = acceptInvitationSchema.parse(body)
    const { name, password } = validatedData

    const invitation = await prisma.invitation.findUnique({
      where: { token: params.token },
      include: {
        organization: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Einladung nicht gefunden' }, { status: 404 })
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Einladung ist abgelaufen' }, { status: 400 })
    }

    if (invitation.acceptedAt) {
      return NextResponse.json({ error: 'Einladung wurde bereits akzeptiert' }, { status: 400 })
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (!user) {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 12)
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          name,
          password: hashedPassword
        }
      })
    }

    // Add user to organization
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: invitation.organizationId
        }
      },
      update: {
        role: invitation.role,
        isActive: true
      },
      create: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role
      }
    })

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() }
    })

    return NextResponse.json({
      message: 'Einladung erfolgreich akzeptiert',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      organization: invitation.organization
    })

  } catch (error) {
    console.error('Error accepting invitation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
