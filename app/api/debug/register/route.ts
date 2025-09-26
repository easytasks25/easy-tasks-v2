import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { name, email, password, orgType, teamName } = await req.json()

    console.log('DEBUG_REGISTER: Starting registration with:', { name, email, orgType, teamName })

    const result = await prisma.$transaction(async (tx) => {
      console.log('DEBUG_REGISTER: Creating user...')
      
      const user = await tx.user.create({
        data: { 
          name, 
          email,
          password: password || 'test-password' // Fallback für Test
        },
      })

      console.log('DEBUG_REGISTER: User created with ID:', user.id)

      console.log('DEBUG_REGISTER: Creating organization...')
      
      const org = await tx.organization.create({
        data: {
          name: teamName || 'Test Organization',
          type: orgType === 'company' ? 'company' : 'team',
          createdById: user.id, // ✅ FK existiert sicher
        },
      })

      console.log('DEBUG_REGISTER: Organization created with ID:', org.id)

      console.log('DEBUG_REGISTER: Creating user organization membership...')
      
      await tx.userOrganization.create({
        data: { 
          userId: user.id, 
          organizationId: org.id, 
          role: 'OWNER' 
        },
      })

      console.log('DEBUG_REGISTER: Membership created successfully')

      return { userId: user.id, organizationId: org.id }
    })

    console.log('DEBUG_REGISTER: Transaction completed successfully')

    return NextResponse.json({ 
      ok: true, 
      message: 'Debug registration successful',
      ...result 
    })

  } catch (error) {
    console.error('DEBUG_REGISTER_ERROR', error)
    
    return NextResponse.json(
      { 
        ok: false, 
        error: String(error),
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
