import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validierung
    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData

    console.log('LOGIN_ATTEMPT:', { email })

    // Benutzer in der Datenbank suchen
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      console.log('LOGIN_ERROR: User not found')
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    // Passwort überprüfen
    if (!user.password) {
      console.log('LOGIN_ERROR: No password set for user')
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.log('LOGIN_ERROR: Invalid password')
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    console.log('LOGIN_SUCCESS:', { userId: user.id, email: user.email })

    // Passwort aus der Antwort entfernen
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Anmeldung erfolgreich',
      user: userWithoutPassword,
      organizations: user.organizations.map(uo => uo.organization)
    })

  } catch (error) {
    console.error('LOGIN_ERROR', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        ok: false,
        error: String(error)
      },
      { status: 500 }
    )
  }
}
