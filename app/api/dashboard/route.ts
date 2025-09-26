import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // NextAuth.js Session prüfen
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 })
    }

    const supabase = createClient()
    
    // User-ID aus NextAuth Session verwenden
    const userId = session.user.id

    // Aktuelle Organisation ermitteln
    const membershipResult = await (supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .limit(1)
      .single() as any)

    if (membershipResult.error || !membershipResult.data?.organization_id) {
      // WICHTIG: klarer, erfolgreicher Response ohne Daten
      return NextResponse.json({ ok: true, empty: true, stats: null })
    }

    // Normale Dashboard-Daten holen, immer org-scoped
    const orgId = membershipResult.data.organization_id

    // Mitglieder der Organisation laden
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select(`
        role,
        user:user_id (
          id,
          email,
          raw_user_meta_data
        )
      ` as any)
      .eq('organization_id', orgId)

    if (membersError) {
      console.error('Error loading members:', membersError)
      return NextResponse.json({ ok: false, reason: 'server-error' }, { status: 500 })
    }

    // Aufgaben der Organisation laden
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, status, created_at, completed_at, assigned_to')
      .eq('organization_id', orgId)

    if (tasksError) {
      console.error('Error loading tasks:', tasksError)
      return NextResponse.json({ ok: false, reason: 'server-error' }, { status: 500 })
    }

    // Aggregieren
    const perUser = members?.map((member: any) => {
      const userId = member.user.id
      const userName = member.user.raw_user_meta_data?.name || member.user.email?.split('@')[0] || 'Unbenannt'
      
      const userTasks = tasks?.filter((task: any) => task.assigned_to === userId) || []
      
      const open = userTasks.filter((task: any) => 
        task.status === 'pending' || task.status === 'in-progress'
      ).length
      
      const done7 = userTasks.filter((task: any) => {
        if (task.status !== 'completed' || !task.completed_at) return false
        const completedDate = new Date(task.completed_at)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return completedDate >= sevenDaysAgo
      }).length
      
      const oldestDays = (() => {
        const openTasks = userTasks.filter((task: any) => 
          task.status === 'pending' || task.status === 'in-progress'
        )
        if (!openTasks.length) return 0
        return Math.max(...openTasks.map((task: any) => {
          const createdDate = new Date(task.created_at)
          return Math.floor((Date.now() - createdDate.getTime()) / (24 * 60 * 60 * 1000))
        }))
      })()

      return {
        id: userId,
        name: userName,
        role: member.role,
        open,
        done7,
        oldestDays
      }
    }) || []

    return NextResponse.json({ 
      ok: true, 
      empty: false, 
      stats: { perUser },
      organization: {
        id: orgId,
        memberCount: members?.length || 0,
        taskCount: tasks?.length || 0
      }
    })
  } catch (e) {
    console.error('DASHBOARD_ERROR', e)
    return NextResponse.json({ ok: false, reason: 'server-error' }, { status: 500 })
  }
}
