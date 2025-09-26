import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('DB_DEBUG: Testing database connection...')
    
    // Teste die Verbindung
    await prisma.$connect()
    console.log('DB_DEBUG: Connected to database')
    
    // Teste eine einfache Query
    const userCount = await prisma.user.count()
    console.log('DB_DEBUG: User count:', userCount)
    
    // Teste eine spezifische Query
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    console.log('DB_DEBUG: Sample users:', users)
    
    return NextResponse.json({
      ok: true,
      message: 'Database connection successful',
      userCount,
      sampleUsers: users
    })
    
  } catch (error) {
    console.error('DB_DEBUG_ERROR:', error)
    
    return NextResponse.json({
      ok: false,
      error: String(error),
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}
