import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Lokale Speicherung - Mock-Daten für Demo
const mockBuckets = [
  {
    id: 'bucket-0',
    name: 'Heute',
    type: 'today',
    color: '#ef4444',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'demo-user',
    organizationId: 'demo-org',
    projectId: 'demo-project',
    isDefault: true,
    tasks: []
  },
  {
    id: 'bucket-1',
    name: 'Morgen',
    type: 'tomorrow',
    color: '#f59e0b',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'demo-user',
    organizationId: 'demo-org',
    projectId: 'demo-project',
    isDefault: true,
    tasks: []
  },
  {
    id: 'bucket-2',
    name: 'Diese Woche',
    type: 'this-week',
    color: '#3b82f6',
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'demo-user',
    organizationId: 'demo-org',
    projectId: 'demo-project',
    isDefault: true,
    tasks: []
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
    const organizationId = searchParams.get('organizationId')

    // Filter Mock-Daten basierend auf Parametern
    let filteredBuckets = mockBuckets.filter(bucket => {
      if (organizationId && bucket.organizationId !== organizationId) return false
      if (projectId && bucket.projectId !== projectId) return false
      return true
    })

    // Sortiere nach Reihenfolge
    filteredBuckets.sort((a, b) => a.order - b.order)

    return NextResponse.json(filteredBuckets)
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

    // Erstelle neuen Bucket mit Mock-Daten
    const newBucket = {
      id: `bucket-${Date.now()}`,
      name,
      type: type || 'custom',
      color: color || '#3b82f6',
      order: order || mockBuckets.length,
      projectId: projectId || 'demo-project',
      organizationId: organizationId || 'demo-org',
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false,
      tasks: []
    }

    // In einer echten lokalen Speicherung würden wir hier localStorage verwenden
    // Für die Demo geben wir einfach den erstellten Bucket zurück
    console.log('Bucket erstellt (lokale Speicherung):', newBucket)

    return NextResponse.json(newBucket, { status: 201 })
  } catch (error) {
    console.error('Error creating bucket:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
