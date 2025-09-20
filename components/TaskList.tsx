'use client'

import { useState, useMemo } from 'react'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  PhotoIcon,
  MicrophoneIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid'
import { Task, TaskPriority, TaskStatus, TaskFilter } from '@/types/task'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { TaskFilters } from './TaskFilters'

interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  selectedDate?: Date
  onTaskClick?: (task: Task) => void
  onAddTask?: () => void
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask, selectedDate, onTaskClick, onAddTask }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<TaskFilter>({})

  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.dueDate)
        return taskDate.toDateString() === selectedDate.toDateString()
      })
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status!.includes(task.status))
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority!.includes(task.priority))
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(task => 
        task.category && filters.category!.includes(task.category)
      )
    }

    // Sort by priority and due date
    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  }, [tasks, selectedDate, searchQuery, filters])

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Heute'
    if (isTomorrow(date)) return 'Morgen'
    if (isYesterday(date)) return 'Gestern'
    return format(date, 'dd.MM.yyyy', { locale: de })
  }

  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedDate ? getDateLabel(selectedDate) : 'Alle Aufgaben'}
          </h2>
          <p className="text-sm text-gray-500">
            {filteredTasks.length} von {tasks.length} Aufgaben
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filter</span>
          </button>
          
          <button
            onClick={() => {
              if (onAddTask) {
                onAddTask()
              } else {
                // Task form will be handled by parent
              }
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Neue Aufgabe</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Aufgaben durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <TaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Aufgaben gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || Object.keys(filters).length > 0
                ? 'Versuchen Sie andere Suchbegriffe oder Filter.'
                : 'Erstellen Sie Ihre erste Aufgabe.'}
            </p>
            {!searchQuery && Object.keys(filters).length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => {}}
                  className="btn-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Erste Aufgabe erstellen
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>

    </div>
  )
}
