import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const prisma = new PrismaClient()

const registerSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
  organizationName: z.string().min(2, 'Organisationsname ist erforderlich'),
  organizationType: z.enum(['COMPANY', 'PERSONAL']).default('COMPANY'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validierung
    const validatedData = registerSchema.parse(body)
    const { name, email, password, organizationName, organizationType } = validatedData

    // Prüfen ob Benutzer bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits' },
        { status: 400 }
      )
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 12)

    // Benutzer erstellen
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })

    // Organisation erstellen
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        type: organizationType,
        createdById: user.id,
        settings: {
          timezone: 'Europe/Berlin',
          language: 'de',
          dateFormat: 'DD.MM.YYYY'
        }
      }
    })

    // Benutzer als Owner zur Organisation hinzufügen
    await prisma.userOrganization.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: 'OWNER'
      }
    })

    // Standard-Projekt für die Organisation erstellen
    const defaultProject = await prisma.project.create({
      data: {
        name: 'Standard-Projekt',
        description: 'Standard-Projekt für die Organisation',
        color: '#3b82f6',
        organizationId: organization.id
      }
    })

    // Standard-Buckets für die Organisation erstellen
    const defaultBuckets = [
      {
        name: 'Heute',
        type: 'TODAY' as const,
        color: '#ef4444',
        order: 0,
      },
      {
        name: 'Morgen',
        type: 'TOMORROW' as const,
        color: '#f59e0b',
        order: 1,
      },
      {
        name: 'Diese Woche',
        type: 'THIS_WEEK' as const,
        color: '#3b82f6',
        order: 2,
      },
    ]

    for (const bucketData of defaultBuckets) {
      await prisma.bucket.create({
        data: {
          ...bucketData,
          userId: user.id,
          organizationId: organization.id,
          projectId: defaultProject.id,
        }
      })
    }

    // Passwort aus der Antwort entfernen
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'Benutzer erfolgreich erstellt',
        user: userWithoutPassword 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registrierungsfehler:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}
