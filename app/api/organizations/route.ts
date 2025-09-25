import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all organizations for the user
    const userOrganizations = await prisma.userOrganization.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                users: true,
                projects: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    return NextResponse.json(userOrganizations.map(uo => ({
      ...uo.organization,
      userRole: uo.role,
      memberCount: uo.organization._count.users,
      projectCount: uo.organization._count.projects
    })))
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, domain } = body

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        type: type === 'COMPANY' ? 'company' : 'team',
        domain,
        createdById: session.user.id,
        settings: {
          timezone: 'Europe/Berlin',
          language: 'de',
          dateFormat: 'DD.MM.YYYY'
        }
      }
    })

    // Add creator as owner
    await prisma.userOrganization.create({
      data: {
        userId: session.user.id,
        organizationId: organization.id,
        role: 'OWNER'
      }
    })

    // Create default project
    const defaultProject = await prisma.project.create({
      data: {
        name: 'Standard-Projekt',
        description: 'Standard-Projekt für die Organisation',
        color: '#3b82f6',
        organizationId: organization.id
      }
    })

    // Create default buckets for the organization
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
          userId: session.user.id,
          organizationId: organization.id,
          projectId: defaultProject.id,
        }
      })
    }

    return NextResponse.json({
      ...organization,
      userRole: 'OWNER',
      memberCount: 1,
      projectCount: 1
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
