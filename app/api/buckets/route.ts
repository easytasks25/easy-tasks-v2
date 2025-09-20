import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const organizationId = searchParams.get('organizationId')

    const buckets = await prisma.bucket.findMany({
      where: {
        userId: session.user.id,
        ...(organizationId && { organizationId }),
        ...(projectId && { projectId }),
      },
      include: {
        tasks: {
          include: {
            attachments: true,
            photos: true,
            voiceNotes: true,
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(buckets)
  } catch (error) {
    console.error('Error fetching buckets:', error)
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
    const { name, type, color, order, projectId, organizationId } = body

    const bucket = await prisma.bucket.create({
      data: {
        name,
        type: (type || 'CUSTOM') as any,
        color: color || '#3b82f6',
        order: order || 0,
        projectId,
        organizationId: organizationId || 'default-org', // Fallback für Demo
        userId: session.user.id,
      },
      include: {
        tasks: true
      }
    })

    return NextResponse.json(bucket, { status: 201 })
  } catch (error) {
    console.error('Error creating bucket:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
