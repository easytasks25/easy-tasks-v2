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
  let userTest = '❌ Not tested'
  let orgTest = '❌ Not tested'
  
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    
    // Test basic connection
    const { data, error } = await supabase.from('organizations').select('count').limit(1)
    supabaseTest = error ? `❌ Error: ${error.message}` : '✅ Connected'
    
    // Test user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    userTest = userError ? `❌ Error: ${userError.message}` : user ? `✅ User: ${user.email}` : '❌ No user'
    
    // Test organization access
    if (user) {
      const { data: memberships, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
      
      orgTest = orgError ? `❌ Error: ${orgError.message}` : 
                memberships && memberships.length > 0 ? `✅ ${memberships.length} organization(s)` : 
                '⚠️ No organizations'
    } else {
      orgTest = '⚠️ No user to test'
    }
  } catch (error) {
    supabaseTest = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
  }

  return NextResponse.json({
    environment: envCheck,
    supabaseConnection: supabaseTest,
    userTest,
    organizationTest: orgTest,
    timestamp: new Date().toISOString(),
  })
}
