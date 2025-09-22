'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { TaskList } from '@/components/TaskList'
import { TaskForm } from '@/components/TaskForm'
import { CalendarView } from '@/components/CalendarView'
import { NotesSection } from '@/components/NotesSection'
import { QuickActions } from '@/components/QuickActions'
import { Header } from '@/components/Header'
import { BucketBoard } from '@/components/BucketBoard'
import { OutlookIntegration } from '@/components/OutlookIntegration'
import { EmailIntegration } from '@/components/EmailIntegration'
import { Task, TaskPriority, TaskStatus } from '@/types/task'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useBuckets } from '@/hooks/useBuckets'
import { toast } from 'react-hot-toast'

export default function Home() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useLocalStorage<Task[]>('lwtasks-tasks', [])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'buckets' | 'list' | 'calendar' | 'notes' | 'integrations'>('buckets')
  const [isOffline, setIsOffline] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  const { moveOverdueToToday, moveIncompleteTodayTasks, getActiveBuckets } = useBuckets()

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Wird geladen...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect to sign in
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Willkommen bei easy-tasks
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bitte melden Sie sich an, um fortzufahren
          </p>
          <div className="mt-6 space-y-3">
            <a
              href="/auth/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Anmelden
            </a>
            <a
              href="/auth/signup"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Registrieren
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsOffline(!navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Move overdue tasks to "Heute" bucket and keep incomplete tasks in "Heute"
  useEffect(() => {
    moveOverdueToToday(tasks)
    moveIncompleteTodayTasks(tasks)
  }, [tasks, moveOverdueToToday, moveIncompleteTodayTasks])

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks(prev => [newTask, ...prev])
    toast.success('Aufgabe erstellt!')
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ))
    toast.success('Aufgabe aktualisiert!')
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
    toast.success('Aufgabe gelöscht!')
  }

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed'
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : undefined,
          updatedAt: new Date()
        }
      }
      return task
    }))
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Indicator */}
      {isOffline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Offline-Modus:</strong> Sie arbeiten offline. Änderungen werden synchronisiert, sobald Sie wieder online sind.
              </p>
            </div>
          </div>
        </div>
      )}

      <Header 
        view={view}
        onViewChange={setView}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onLogout={handleLogout}
        user={session?.user}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {view === 'buckets' && (
          <BucketBoard
            tasks={tasks}
            onToggleTask={toggleTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onCreateTask={() => setShowTaskForm(true)}
          />
        )}

        {view === 'list' && (
          <TaskList
            tasks={tasks}
            onToggleTask={toggleTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onCreateTask={() => setShowTaskForm(true)}
          />
        )}

        {view === 'calendar' && (
          <CalendarView
            tasks={tasks}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onToggleTask={toggleTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onCreateTask={() => setShowTaskForm(true)}
          />
        )}

        {view === 'notes' && (
          <NotesSection />
        )}

        {view === 'integrations' && (
          <div className="space-y-6">
            <OutlookIntegration />
            <EmailIntegration />
          </div>
        )}
      </main>

      <TaskForm
        onSubmit={(data) => {
          if (editingTask) {
            updateTask(editingTask.id, data)
          } else {
            addTask(data as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>)
          }
        }}
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false)
          setEditingTask(null)
        }}
        initialData={editingTask}
        buckets={getActiveBuckets()}
        defaultBucketId={getActiveBuckets().find(b => b.type === 'today')?.id}
      />
    </div>
  )
}