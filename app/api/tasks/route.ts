import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Lokale Speicherung - Mock-Daten für Demo
const mockTasks = [
  {
    id: 'task-1',
    title: 'Baustellenbesichtigung',
    description: 'Wöchentliche Baustellenbesichtigung durchführen',
    priority: 'high',
    status: 'pending',
    dueDate: new Date().toISOString(),
    category: 'Baustelle',
    location: 'Musterstraße 123',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'demo-user',
    organizationId: 'demo-org',
    bucketId: 'bucket-0',
    attachments: [],
    photos: [],
    voiceNotes: []
  },
  {
    id: 'task-2',
    title: 'Materialbestellung',
    description: 'Zement und Stahl für nächste Woche bestellen',
    priority: 'medium',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Morgen
    category: 'Einkauf',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'demo-user',
    organizationId: 'demo-org',
    bucketId: 'bucket-1',
    attachments: [],
    photos: [],
    voiceNotes: []
  },
  {
    id: 'task-3',
    title: 'Team-Meeting',
    description: 'Wöchentliches Team-Meeting mit allen Handwerkern',
    priority: 'low',
    status: 'completed',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // Gestern
    category: 'Team',
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'demo-user',
    organizationId: 'demo-org',
    bucketId: 'bucket-0',
    attachments: [],
    photos: [],
    voiceNotes: []
  }
]

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

    // Filter Mock-Daten basierend auf Parametern
    let filteredTasks = mockTasks.filter(task => {
      if (projectId && task.projectId !== projectId) return false
      if (bucketId && task.bucketId !== bucketId) return false
      if (status && task.status !== status) return false
      return true
    })

    // Sortiere nach Erstellungsdatum (neueste zuerst)
    filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(filteredTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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

    // Erstelle neue Task mit Mock-Daten
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description,
      priority: priority || 'medium',
      status: status || 'pending',
      dueDate: dueDate || new Date().toISOString(),
      category,
      assignedTo,
      notes,
      bucketId: bucketId || 'bucket-0',
      projectId: projectId || 'demo-project',
      organizationId: 'demo-org',
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      photos: [],
      voiceNotes: []
    }

    // In einer echten lokalen Speicherung würden wir hier localStorage verwenden
    // Für die Demo geben wir einfach die erstellte Task zurück
    console.log('Task erstellt (lokale Speicherung):', newTask)

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
