'use client'

import { useState } from 'react'
import { Task, TaskStatus } from '@/types/task'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { 
  ArchiveBoxIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface ArchiveViewProps {
  tasks: Task[]
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
}

export function ArchiveView({ tasks, onUpdateTask, onDeleteTask }: ArchiveViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Filter archived tasks
  const archivedTasks = tasks.filter(task => 
    task.status === 'completed' || task.status === 'cancelled'
  )

  // Apply search and status filters
  const filteredTasks = archivedTasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Group tasks by completion date
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const date = task.status === 'completed' && task.completedAt 
      ? format(new Date(task.completedAt), 'dd.MM.yyyy', { locale: de })
      : task.status === 'cancelled' 
        ? format(new Date(task.updatedAt), 'dd.MM.yyyy', { locale: de })
        : 'Unbekannt'
    
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(task)
    return groups
  }, {} as Record<string, Task[]>)

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCloseForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleRestoreTask = (taskId: string) => {
    onUpdateTask(taskId, { 
      status: 'pending',
      completedAt: undefined,
      completedBy: undefined
    })
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'Erledigt'
      case 'cancelled':
        return 'Abgebrochen'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ArchiveBoxIcon className="h-8 w-8 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Archiv</h1>
            <p className="text-sm text-gray-600">
              {archivedTasks.length} archivierte {archivedTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Aufgaben durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle Status</option>
              <option value="completed">Erledigt</option>
              <option value="cancelled">Abgebrochen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {Object.keys(groupedTasks).length === 0 ? (
        <div className="text-center py-12">
          <ArchiveBoxIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine archivierten Aufgaben</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all' 
              ? 'Keine Aufgaben entsprechen den aktuellen Filtern.'
              : 'Abgeschlossene und abgebrochene Aufgaben werden hier angezeigt.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks)
            .sort(([a], [b]) => new Date(b.split('.').reverse().join('-')).getTime() - new Date(a.split('.').reverse().join('-')).getTime())
            .map(([date, tasks]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                {date}
              </h3>
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900 line-through">
                            {task.title}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 mb-3 line-through">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Kategorie: {task.category || 'Keine'}</span>
                          <span>Priorität: {task.priority}</span>
                          {task.completedAt && (
                            <span>
                              Erledigt: {format(new Date(task.completedAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleRestoreTask(task.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Aufgabe wiederherstellen"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          Wiederherstellen
                        </button>
                        
                        <button
                          onClick={() => handleEditTask(task)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Aufgabe bearbeiten"
                        >
                          Bearbeiten
                        </button>
                        
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title="Aufgabe endgültig löschen"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <TaskForm
                isOpen={showTaskForm}
                onClose={handleCloseForm}
                onSubmit={(taskData) => {
                  if (editingTask) {
                    onUpdateTask(editingTask.id, taskData)
                  }
                  handleCloseForm()
                }}
                initialData={editingTask}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
