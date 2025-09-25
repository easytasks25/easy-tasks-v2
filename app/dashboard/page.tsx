'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<View>('buckets')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterState, setFilterState] = useState<{
    type: 'status' | 'member' | 'none'
    value: string
    label: string
  }>({ type: 'none', value: '', label: '' })

  const router = useRouter()
  const supabase = createClient()
  const { moveOverdueToToday, moveIncompleteTodayTasks, getActiveBuckets } = useBuckets()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && selectedOrg) {
      loadTasks()
    }
  }, [user, selectedOrg])

  const checkUser = async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error || !authUser) {
        router.push('/auth/signin')
        return
      }

      // Benutzerdaten aus Supabase Auth extrahieren
      const userData: User = {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
        avatar_url: authUser.user_metadata?.avatar_url
      }

      setUser(userData)

      // Organisationen laden
      await loadOrganizations(authUser.id)
    } catch (error) {
      console.error('Error checking user:', error)
      setError('Fehler beim Laden der Benutzerdaten')
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
        setError('Fehler beim Laden der Organisationen')
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
      setError('Fehler beim Laden der Organisationen')
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
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  // No user state
  if (!user) {
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