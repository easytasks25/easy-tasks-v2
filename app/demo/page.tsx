'use client'

import { useState, useEffect } from 'react'
import { TaskList } from '@/components/TaskList'
import { TaskForm } from '@/components/TaskForm'
import { CalendarView } from '@/components/CalendarView'
import { NotesSection } from '@/components/NotesSection'
import { QuickActions } from '@/components/QuickActions'
import { Header } from '@/components/Header'
import { BucketBoard } from '@/components/BucketBoard'
import { Task, TaskPriority, TaskStatus } from '@/types/task'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useBuckets } from '@/hooks/useBuckets'
import { toast } from 'react-hot-toast'
import nextDynamic from 'next/dynamic'

// Dynamische Imports für Components, die window verwenden könnten
const OutlookIntegration = nextDynamic(() => import('@/components/OutlookIntegration').then(mod => ({ default: mod.OutlookIntegration })), { ssr: false })
const EmailIntegration = nextDynamic(() => import('@/components/EmailIntegration').then(mod => ({ default: mod.EmailIntegration })), { ssr: false })

// Demo-Daten für lokale Speicherung
const demoTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Baustellenbesichtigung',
    description: 'Wöchentliche Baustellenbesichtigung durchführen und Fortschritt dokumentieren',
    priority: 'high',
    status: 'pending',
    dueDate: new Date().toISOString(),
    category: 'Baustelle',
    location: 'Musterstraße 123, 12345 Musterstadt',
    createdAt: new Date(),
    updatedAt: new Date(),
    attachments: [],
    photos: [],
    voiceNotes: []
  },
  {
    id: 'task-2',
    title: 'Materialbestellung',
    description: 'Zement und Stahl für nächste Woche bestellen - Angebote einholen',
    priority: 'medium',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Morgen
    category: 'Einkauf',
    createdAt: new Date(),
    updatedAt: new Date(),
    attachments: [],
    photos: [],
    voiceNotes: []
  },
  {
    id: 'task-3',
    title: 'Team-Meeting',
    description: 'Wöchentliches Team-Meeting mit allen Handwerkern - Terminplanung',
    priority: 'low',
    status: 'completed',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // Gestern
    category: 'Team',
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    attachments: [],
    photos: [],
    voiceNotes: []
  },
  {
    id: 'task-4',
    title: 'Sicherheitsprüfung',
    description: 'Monatliche Sicherheitsprüfung aller Baustellenausrüstung',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 172800000).toISOString(), // Übermorgen
    category: 'Sicherheit',
    createdAt: new Date(),
    updatedAt: new Date(),
    attachments: [],
    photos: [],
    voiceNotes: []
  },
  {
    id: 'task-5',
    title: 'Kundenbesprechung',
    description: 'Besprechung mit Bauherren über Änderungswünsche',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 259200000).toISOString(), // In 3 Tagen
    category: 'Kunde',
    createdAt: new Date(),
    updatedAt: new Date(),
    attachments: [],
    photos: [],
    voiceNotes: []
  }
]

// Demo-User für die Anzeige
const demoUser = {
  id: 'demo-user',
  name: 'Max Mustermann',
  email: 'max.mustermann@baubetrieb.de',
  image: null
}

// Client-Komponente für die Hauptfunktionalität
function DemoHome() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('lwtasks-demo-tasks', demoTasks)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<'buckets' | 'list' | 'calendar' | 'notes' | 'integrations'>('buckets')
  const [isOffline, setIsOffline] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const { moveOverdueToToday, moveIncompleteTodayTasks, getActiveBuckets } = useBuckets()

  // Offline detection
  useEffect(() => {
    if (typeof window === 'undefined') return
    
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
    try {
      const newTask: Task = {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setTasks(prev => [newTask, ...prev])
      toast.success('Aufgabe erstellt!')
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error('Fehler beim Erstellen der Aufgabe')
    }
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
    // In der Demo-Version einfach zur Hauptseite weiterleiten
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo-Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Demo-Modus:</strong> Diese Version läuft ohne Datenbank und speichert alle Daten lokal im Browser.
            </p>
          </div>
        </div>
      </div>

      {/* Offline Indicator */}
      {isOffline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Offline-Modus:</strong> Sie arbeiten offline. Änderungen werden lokal gespeichert.
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
        user={demoUser}
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

        {view === 'list' && (
          <TaskList
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onAddTask={() => setShowTaskForm(true)}
          />
        )}

        {view === 'calendar' && (
          <CalendarView
            tasks={tasks}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onTaskClick={handleEditTask}
            onUpdateTask={updateTask}
          />
        )}

        {view === 'notes' && (
          <NotesSection />
        )}

        {view === 'integrations' && (
          <div className="space-y-6">
            <OutlookIntegration 
              tasks={tasks}
              onTasksUpdate={setTasks}
            />
            <EmailIntegration 
              onTasksCreated={(newTasks) => setTasks(prev => [...prev, ...newTasks])}
            />
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

// Hauptkomponente mit dynamischem Import
export default function DemoPage() {
  return <DemoHome />
}
