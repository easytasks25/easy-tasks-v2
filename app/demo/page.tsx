'use client'

import { useState, useEffect } from 'react'
import { TaskList } from '@/components/TaskList'
import { TaskForm } from '@/components/TaskForm'
import { CalendarView } from '@/components/CalendarView'
import { NotesSection } from '@/components/NotesSection'
import { QuickActions } from '@/components/QuickActions'
import { Header } from '@/components/Header'
import { BucketBoard } from '@/components/BucketBoard'
import { Dashboard } from '@/components/Dashboard'
import { ArchiveView } from '@/components/ArchiveView'
import { FilteredTasksView } from '@/components/FilteredTasksView'
import { Task, TaskPriority, TaskStatus } from '@/types/task'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useBuckets } from '@/hooks/useBuckets'
import { useTaskHistory } from '@/hooks/useTaskHistory'
import { toast } from 'react-hot-toast'
import nextDynamic from 'next/dynamic'
import type { View } from '@/lib/view'

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
    createdBy: 'demo-user',
    attachments: [],
    photos: [],
    voiceNotes: [],
    history: [
      {
        id: 'hist-1',
        taskId: 'task-1',
        action: 'created',
        timestamp: new Date(Date.now() - 86400000), // Gestern
        userId: 'demo-user',
        userName: 'Max Mustermann',
        changes: {
          description: 'Aufgabe "Baustellenbesichtigung" erstellt'
        }
      },
      {
        id: 'hist-2',
        taskId: 'task-1',
        action: 'priority_changed',
        timestamp: new Date(Date.now() - 43200000), // Vor 12 Stunden
        userId: 'demo-user',
        userName: 'Max Mustermann',
        changes: {
          field: 'priority',
          oldValue: 'medium',
          newValue: 'high',
          description: 'Priorität geändert von "Mittel" zu "Hoch"'
        }
      }
    ]
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
  image: null,
  role: 'manager' // Demo: Manager-Rolle für Dashboard-Zugriff
}

// Client-Komponente für die Hauptfunktionalität
function DemoHome() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('lwtasks-demo-tasks', demoTasks)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<View>('buckets')
  const [isOffline, setIsOffline] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterState, setFilterState] = useState<{
    type: 'status' | 'member' | 'none'
    value: string
    label: string
  }>({ type: 'none', value: '', label: '' })

  const { moveOverdueToToday, moveIncompleteTodayTasks, getActiveBuckets } = useBuckets()
  
  // Task-Historie Hook
  const {
    logTaskCreation,
    logStatusChange,
    logPriorityChange,
    logAssignmentChange,
    logNoteChange,
    logDueDateChange,
    logTaskUpdate,
    updateTaskWithHistory
  } = useTaskHistory({
    currentUser: {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email
    }
  })

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
        createdBy: demoUser.id,
      }
      
      // Logge die Erstellung
      logTaskCreation(newTask)
      
      // Aktualisiere Task mit Historie
      const taskWithHistory = updateTaskWithHistory(newTask)
      
      setTasks(prev => [taskWithHistory, ...prev])
      toast.success('Aufgabe erstellt!')
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error('Fehler beim Erstellen der Aufgabe')
    }
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const oldTask = { ...task }
        const updatedTask = { ...task, ...updates, updatedAt: new Date() }
        
        // Logge spezifische Änderungen
        if (updates.status && updates.status !== oldTask.status) {
          logStatusChange(id, oldTask.status, updates.status)
        }
        
        if (updates.priority && updates.priority !== oldTask.priority) {
          logPriorityChange(id, oldTask.priority, updates.priority)
        }
        
        if (updates.assignedTo !== oldTask.assignedTo) {
          logAssignmentChange(id, oldTask.assignedTo, updates.assignedTo)
        }
        
        if (updates.dueDate && updates.dueDate !== oldTask.dueDate) {
          logDueDateChange(id, oldTask.dueDate, updates.dueDate)
        }
        
        if (updates.notes && updates.notes !== oldTask.notes) {
          logNoteChange(id, 'note_updated', updates.notes)
        }
        
        // Logge andere Änderungen
        Object.keys(updates).forEach(key => {
          if (key !== 'status' && key !== 'priority' && key !== 'assignedTo' && 
              key !== 'dueDate' && key !== 'notes' && key !== 'updatedAt' && 
              updates[key as keyof Task] !== oldTask[key as keyof Task]) {
            logTaskUpdate(id, key, oldTask[key as keyof Task], updates[key as keyof Task])
          }
        })
        
        return updateTaskWithHistory(updatedTask)
      }
      return task
    }))
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

  const handleFilteredTasksView = (filterType: 'status' | 'member', filterValue: string, filterLabel: string) => {
    setFilterState({ type: filterType, value: filterValue, label: filterLabel })
    setView('filtered-tasks')
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
        onViewChange={(v: View) => setView(v)}
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

        {view === 'dashboard' && (
          <Dashboard 
            tasks={tasks}
            user={demoUser}
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
