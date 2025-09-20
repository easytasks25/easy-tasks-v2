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
    const bucketId = searchParams.get('bucketId')
    const status = searchParams.get('status')

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        ...(projectId && { projectId }),
        ...(bucketId && { bucketId }),
        ...(status && { status: status as any }),
      },
      include: {
        attachments: true,
        photos: true,
        voiceNotes: true,
        bucket: true,
        project: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
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
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      category,
      assignedTo,
      notes,
      bucketId,
      projectId,
    } = body

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: (priority || 'MEDIUM') as any,
        status: (status || 'PENDING') as any,
        dueDate: dueDate ? new Date(dueDate) : null,
        category,
        assignedTo,
        notes,
        bucketId,
        projectId,
        organizationId: 'default-org', // Fallback für Demo
        userId: session.user.id,
      },
      include: {
        attachments: true,
        photos: true,
        voiceNotes: true,
        bucket: true,
        project: true,
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
