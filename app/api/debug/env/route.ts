import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Nur in Development oder mit speziellem Debug-Key
  const debugKey = request.nextUrl.searchParams.get('key')
  if (process.env.NODE_ENV === 'production' && debugKey !== 'debug-123') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  const envCheck = {
    // Client Environment Variables
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? '✅ Set' : '❌ Missing',
    
    // Server Environment Variables
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
    DIRECT_URL: process.env.DIRECT_URL ? '✅ Set' : '❌ Missing',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    
    // App Configuration
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ? '✅ Vercel' : '❌ Not Vercel',
    VERCEL_URL: process.env.VERCEL_URL || 'Not set',
  }

  // Test Supabase Connection
  let supabaseTest = '❌ Not tested'
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data, error } = await supabase.from('organizations').select('count').limit(1)
    supabaseTest = error ? `❌ Error: ${error.message}` : '✅ Connected'
  } catch (error) {
    supabaseTest = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
  }

  return NextResponse.json({
    environment: envCheck,
    supabaseConnection: supabaseTest,
    timestamp: new Date().toISOString(),
  })
}
