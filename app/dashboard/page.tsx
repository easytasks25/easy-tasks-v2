'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSession, signOut } from 'next-auth/react'
import useSWR from 'swr'
import { Header } from '@/components/Header'
import { Dashboard } from '@/components/Dashboard'
import { BucketBoard } from '@/components/BucketBoard'
import { ArchiveView } from '@/components/ArchiveView'
import { FilteredTasksView } from '@/components/FilteredTasksView'
import { Task, TaskPriority, TaskStatus } from '@/types/task'
import { useBuckets } from '@/hooks/useBuckets'
import { toast } from 'react-hot-toast'
import type { View } from '@/lib/view'

interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

interface Organization {
  id: string
  name: string
  description?: string
  userRole: string
}

// SWR Fetcher
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
})

export default function DashboardPage() {
  console.log('DASHBOARD: Component rendering...')
  
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<View>('buckets')
  const [isLoading, setIsLoading] = useState(true)
  const [filterState, setFilterState] = useState<{
    type: 'status' | 'member' | 'none'
    value: string
    label: string
  }>({ type: 'none', value: '', label: '' })

  const router = useRouter()
  const supabase = createClient()
  const { moveOverdueToToday, moveIncompleteTodayTasks, getActiveBuckets } = useBuckets()

  // SWR für Dashboard-Daten
  const { data: dashboardData, error: dashboardError, isLoading: dashboardLoading } = useSWR(
    user ? '/api/dashboard' : null,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    console.log('DASHBOARD: useEffect - checkUser called')
    checkUser()
  }, [status, session])

  useEffect(() => {
    if (user && selectedOrg) {
      loadTasks()
    }
  }, [user, selectedOrg])

  const checkUser = async () => {
    console.log('DASHBOARD: checkUser started')
    console.log('DASHBOARD: NextAuth session status:', status)
    console.log('DASHBOARD: NextAuth session data:', session)
    
    try {
      if (status === 'loading') {
        console.log('DASHBOARD: NextAuth still loading...')
        return
      }

      if (status === 'unauthenticated' || !session) {
        console.log('DASHBOARD: No NextAuth session found, redirecting to login')
        router.push('/auth/signin')
        return
      }

      // NextAuth Session gefunden
      console.log('DASHBOARD: Using NextAuth session:', session.user)
      const userData: User = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name || session.user.email!.split('@')[0],
        avatar_url: session.user.image || undefined
      }

      setUser(userData)

      // Organisationen laden
      await loadOrganizations(session.user.id)
      setIsLoading(false)
    } catch (error) {
      console.error('DASHBOARD: Error checking user:', error)
      setIsLoading(false)
    }
  }

  const loadOrganizations = async (userId: string) => {
    try {
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations (
            id,
            name,
            description,
            type,
            domain,
            created_at,
            updated_at
          )
        ` as any)
        .eq('user_id', userId)

      if (error) {
        console.error('Error loading organizations:', error)
        setIsLoading(false)
        return
      }

      const orgs = memberships?.map((membership: any) => ({
        ...membership.organizations,
        userRole: membership.role,
      })) || []

      setOrganizations(orgs)

      // Erste Organisation automatisch auswählen
      if (orgs.length > 0) {
        setSelectedOrg(orgs[0])
      } else {
        // Keine Organisationen - zur Erstellung weiterleiten
        setIsLoading(false)
        router.push('/organizations/create')
        return
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
      setIsLoading(false)
    }
  }

  const loadTasks = async () => {
    if (!selectedOrg) return

    try {
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select(`
          *,
          created_by_user:created_by (
            id,
            email,
            raw_user_meta_data
          ),
          assigned_to_user:assigned_to (
            id,
            email,
            raw_user_meta_data
          )
        ` as any)
        .eq('organization_id', selectedOrg.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading tasks:', error)
        return
      }

      // Transform data to match our Task interface
      const transformedTasks: Task[] = tasksData?.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority as TaskPriority,
        status: task.status as TaskStatus,
        dueDate: task.due_date,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        category: task.category,
        location: task.location,
        assignedTo: task.assigned_to_user?.raw_user_meta_data?.name || task.assigned_to_user?.email,
        notes: task.notes,
        createdBy: task.created_by_user?.raw_user_meta_data?.name || task.created_by_user?.email,
        startedAt: task.started_at ? new Date(task.started_at) : undefined,
        completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
        completedBy: task.completed_by,
      })) || []

      setTasks(transformedTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addTask = async (taskData: Partial<Task>) => {
    if (!user || !selectedOrg) return

    try {
      const taskResult = await supabase
        .from('tasks')
        .insert({
          title: taskData.title!,
          description: taskData.description,
          priority: taskData.priority || 'medium',
          status: taskData.status || 'pending',
          due_date: taskData.dueDate!,
          organization_id: selectedOrg.id,
          created_by: user.id,
          assigned_to: taskData.assignedTo,
          category: taskData.category,
          location: taskData.location,
          notes: taskData.notes,
        } as any)
        .select()
        .single()

      if (taskResult.error) {
        console.error('Error creating task:', taskResult.error)
        toast.error('Fehler beim Erstellen der Aufgabe')
        return
      }

      // Tasks neu laden
      await loadTasks()
      toast.success('Aufgabe erfolgreich erstellt')
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Fehler beim Erstellen der Aufgabe')
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Fehler beim Aktualisieren der Aufgabe')
        return
      }

      // Tasks neu laden
      await loadTasks()
      toast.success('Aufgabe erfolgreich aktualisiert')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Fehler beim Aktualisieren der Aufgabe')
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Fehler beim Löschen der Aufgabe')
        return
      }

      // Tasks neu laden
      await loadTasks()
      toast.success('Aufgabe erfolgreich gelöscht')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Fehler beim Löschen der Aufgabe')
    }
  }

  const handleLogout = async () => {
    try {
      // NextAuth.js abmelden
      await signOut({ redirect: false })
      
      // Supabase Auth auch abmelden (falls vorhanden)
      await supabase.auth.signOut()
      
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleFilteredTasksView = (filterType: 'status' | 'member', filterValue: string, filterLabel: string) => {
    setFilterState({ type: filterType, value: filterValue, label: filterLabel })
    setView('filtered-tasks')
  }

  // Loading state
  console.log('DASHBOARD: Loading state check - isLoading:', isLoading, 'dashboardLoading:', dashboardLoading)
  if (isLoading || dashboardLoading) {
    console.log('DASHBOARD: Showing loading screen')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    )
  }

  // Dashboard API Error state
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-md border border-red-200 bg-red-50 p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 mb-2">Dashboard-Fehler</h3>
            <p className="text-sm text-red-700 mb-4">
              Konnte Dashboard nicht laden. {String(dashboardError.message)}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard API unauthorized
  if (dashboardData && !dashboardData.ok) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">Nicht angemeldet oder keine Berechtigung.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Anmelden
          </button>
        </div>
      </div>
    )
  }

  // Dashboard API empty state
  if (dashboardData && dashboardData.empty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Noch keine Organisation/Team</h2>
            <p className="text-gray-600 mb-6">
              Erstelle eine Organisation und lade Team-Mitglieder ein, um mit der Aufgabenverwaltung zu beginnen.
            </p>
            <button
              onClick={() => router.push('/organizations/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Organisation anlegen
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No user state
  console.log('DASHBOARD: User state check - user:', user)
  if (!user) {
    console.log('DASHBOARD: No user found, showing login prompt')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Benutzer nicht gefunden.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Anmelden
          </button>
        </div>
      </div>
    )
  }

  // No organization state
  if (!selectedOrg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Keine Organisation gefunden</h2>
          <p className="text-gray-600 mb-6">
            Sie sind noch keiner Organisation zugeordnet. Erstellen Sie eine neue Organisation oder treten Sie einer bestehenden bei.
          </p>
          <button
            onClick={() => router.push('/organizations/create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Organisation erstellen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        view={view}
        onViewChange={(v: View) => setView(v)}
        selectedDate={new Date()}
        onDateChange={() => {}}
        onLogout={handleLogout}
        user={{
          name: user.name,
          email: user.email,
          role: selectedOrg.userRole
        }}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {view === 'buckets' && (
          <BucketBoard
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onAddTask={addTask}
          />
        )}

        {view === 'dashboard' && (
          <Dashboard 
            tasks={tasks}
            user={{
              name: user.name,
              email: user.email,
              role: selectedOrg.userRole
            }}
            onViewChange={(view) => {
              if (view.startsWith('filtered-tasks:')) {
                const [, filterType, filterValue, filterLabel] = view.split(':')
                handleFilteredTasksView(filterType as 'status' | 'member', filterValue, filterLabel)
              } else {
                setView(view as View)
              }
            }}
          />
        )}

        {view === 'archive' && (
          <ArchiveView
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        )}

        {view === 'filtered-tasks' && (
          <FilteredTasksView
            tasks={tasks}
            filterType={filterState.type}
            filterValue={filterState.value}
            filterLabel={filterState.label}
            onViewChange={(view) => setView(view as View)}
          />
        )}
      </main>
    </div>
  )
}