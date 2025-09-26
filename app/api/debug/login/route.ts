import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    console.log('DEBUG_LOGIN: Attempting login for:', email)

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

    console.log('DEBUG_LOGIN: User found:', user ? 'YES' : 'NO')
    if (user) {
      console.log('DEBUG_LOGIN: User ID:', user.id)
      console.log('DEBUG_LOGIN: User has password:', !!user.password)
    }

    if (!user) {
      return NextResponse.json({
        ok: false,
        error: 'User not found',
        debug: { email, userExists: false }
      }, { status: 401 })
    }

    if (!user.password) {
      return NextResponse.json({
        ok: false,
        error: 'No password set for user',
        debug: { email, userId: user.id, hasPassword: false }
      }, { status: 401 })
    }

    // Passwort überprüfen
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('DEBUG_LOGIN: Password valid:', isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json({
        ok: false,
        error: 'Invalid password',
        debug: { email, userId: user.id, passwordValid: false }
      }, { status: 401 })
    }

    console.log('DEBUG_LOGIN: Login successful')

    // Passwort aus der Antwort entfernen
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      ok: true,
      message: 'Debug login successful',
      user: userWithoutPassword,
      organizations: user.organizations.map(uo => uo.organization)
    })

  } catch (error) {
    console.error('DEBUG_LOGIN_ERROR', error)
    
    return NextResponse.json({
      ok: false,
      error: String(error),
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
