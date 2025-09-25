'use client'

import { useState } from 'react'
import { Task } from '@/types/task'
import { TaskHistory } from './TaskHistory'
import { 
  XMarkIcon,
  CalendarDaysIcon,
  UserIcon,
  TagIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

export function TaskDetailModal({ task, isOpen, onClose, onUpdate }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')

  if (!isOpen || !task) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Ausstehend'
      case 'in-progress': return 'In Arbeit'
      case 'completed': return 'Erledigt'
      case 'cancelled': return 'Abgebrochen'
      default: return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Hoch'
      case 'medium': return 'Mittel'
      case 'low': return 'Niedrig'
      default: return priority
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </span>
                {task.category && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {task.category}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Historie
                {task.history && task.history.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {task.history.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Beschreibung */}
                {task.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Beschreibung</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                )}

                {/* Metadaten */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Fälligkeitsdatum</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(task.dueDate), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </p>
                      </div>
                    </div>

                    {task.assignedTo && (
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Zugewiesen an</p>
                          <p className="text-sm text-gray-600">{task.assignedTo}</p>
                        </div>
                      </div>
                    )}

                    {task.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Standort</p>
                          <p className="text-sm text-gray-600">{task.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Erstellt</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(task.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Zuletzt aktualisiert</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(task.updatedAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </p>
                      </div>
                    </div>

                    {task.completedAt && (
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Abgeschlossen</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(task.completedAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notizen */}
                {task.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Notizen
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.notes}</p>
                    </div>
                  </div>
                )}

                {/* Anhänge */}
                {task.attachments && task.attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Anhänge</h3>
                    <div className="space-y-2">
                      {task.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <TaskHistory 
                history={task.history || []} 
                taskTitle={task.title}
                className="max-w-none"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
