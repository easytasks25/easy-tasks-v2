'use client'

import { useState } from 'react'
import { Task, TaskStatus } from '@/types/task'
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface FilteredTasksViewProps {
  tasks: Task[]
  filterType: 'status' | 'member' | 'none'
  filterValue: string
  filterLabel: string
  onViewChange: (view: string) => void
}

export function FilteredTasksView({ 
  tasks, 
  filterType, 
  filterValue, 
  filterLabel,
  onViewChange 
}: FilteredTasksViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')

  // Filtere Aufgaben basierend auf dem Dashboard-Filter
  const getFilteredTasks = () => {
    let filteredTasks = tasks.filter(task => 
      task.status !== 'completed' && task.status !== 'cancelled'
    )

    // Dashboard-Filter anwenden
    if (filterType === 'status') {
      if (filterValue === 'pending') {
        filteredTasks = filteredTasks.filter(task => task.status === 'pending')
      } else if (filterValue === 'overdue') {
        const now = new Date()
        filteredTasks = filteredTasks.filter(task => {
          const taskDate = new Date(task.dueDate)
          return taskDate < now && task.status !== 'completed'
        })
      }
    } else if (filterType === 'member') {
      // Hier würden wir normalerweise nach assignedTo filtern
      // Da wir Mock-Daten haben, simulieren wir das
      filteredTasks = filteredTasks.filter(task => {
        return Math.random() > 0.5 // Zufällige Zuweisung für Demo
      })
    }

    // Zusätzliche Filter
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.notes?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter

    return filteredTasks.filter(task => matchesSearch && matchesStatus)
  }

  const filteredTasks = getFilteredTasks()

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return 'Offen'
      case 'in_progress': return 'In Bearbeitung'
      case 'completed': return 'Erledigt'
      case 'cancelled': return 'Abgebrochen'
      default: return 'Unbekannt'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'hoch': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'mittel': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'niedrig': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getFilterIcon = () => {
    switch (filterType) {
      case 'status':
        return filterValue === 'pending' ? 
          <ClockIcon className="h-5 w-5" /> : 
          <ExclamationTriangleIcon className="h-5 w-5" />
      case 'member':
        return <UserIcon className="h-5 w-5" />
      default:
        return <FunnelIcon className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getFilterIcon()}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gefilterte Aufgaben
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filterLabel} • {filteredTasks.length} {filteredTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onViewChange('dashboard')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <XMarkIcon className="h-4 w-4 mr-2" />
          Zurück zum Dashboard
        </button>
      </div>

      {/* Filter Badge */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Aktiver Filter:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
            {filterLabel}
          </span>
        </div>
      </div>

      {/* Zusätzliche Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Aufgaben durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle Status</option>
              <option value="pending">Offen</option>
              <option value="in_progress">In Bearbeitung</option>
              <option value="completed">Erledigt</option>
              <option value="cancelled">Abgebrochen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <FunnelIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Keine Aufgaben gefunden</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || statusFilter !== 'all' 
              ? 'Keine Aufgaben entsprechen den aktuellen Filtern.'
              : 'Keine Aufgaben für den ausgewählten Filter gefunden.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {task.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Fällig: {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: de })}</span>
                    {task.category && <span>Kategorie: {task.category}</span>}
                    {task.location && <span>Standort: {task.location}</span>}
                    {task.assignedTo && <span>Zugewiesen: {task.assignedTo}</span>}
                  </div>
                  
                  {task.notes && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <strong>Notizen:</strong> {task.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
