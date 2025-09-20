'use client'

import { useState } from 'react'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  PhotoIcon,
  MicrophoneIcon,
  PaperClipIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { 
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid'
import { Task, TaskPriority, TaskStatus } from '@/types/task'

interface TaskCardProps {
  task: Task
  onClick: () => void
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
  compact?: boolean
}

export function TaskCard({ task, onClick, onUpdate, onDelete, compact = false }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in-progress': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return CheckCircleIcon
      case 'in-progress': return PlayIcon
      case 'pending': return ClockIcon
      case 'cancelled': return XCircleIcon
    }
  }

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'Erledigt'
      case 'in-progress': return 'In Arbeit'
      case 'pending': return 'Ausstehend'
      case 'cancelled': return 'Abgebrochen'
    }
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Heute'
    if (isTomorrow(date)) return 'Morgen'
    if (isYesterday(date)) return 'Gestern'
    return format(date, 'dd.MM.yyyy', { locale: de })
  }

  const isOverdue = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today && task.status !== 'completed'
  }

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    onUpdate(task.id, { 
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : undefined
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
      onDelete(task.id)
    }
  }

  const StatusIcon = getStatusIcon(task.status)
  const isOverdueTask = isOverdue()

  if (compact) {
    return (
      <div
        className={`bg-white border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
          task.priority === 'high' ? 'border-l-4 border-red-500' :
          task.priority === 'medium' ? 'border-l-4 border-yellow-500' : 'border-l-4 border-green-500'
        } ${isOverdueTask ? 'border-red-300 bg-red-50' : ''}`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                {getStatusText(task.status)}
              </span>
            </div>
          </div>
          
          {isHovered && (
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusToggle(e)
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={task.status === 'completed' ? 'Als ausstehend markieren' : 'Als erledigt markieren'}
              >
                <StatusIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`task-card cursor-pointer transition-all duration-200 ${
        task.priority === 'high' ? 'priority-high' :
        task.priority === 'medium' ? 'priority-medium' : 'priority-low'
      } ${isOverdueTask ? 'border-red-300 bg-red-50' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {task.title}
            </h3>
            {isOverdueTask && (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <span className={isOverdueTask ? 'text-red-600 font-medium' : ''}>
                {getDateLabel(new Date(task.dueDate))}
              </span>
            </div>

            {task.location && (
              <div className="flex items-center space-x-1">
                <MapPinIcon className="h-4 w-4" />
                <span>{task.location}</span>
              </div>
            )}

            {task.assignedTo && (
              <div className="flex items-center space-x-1">
                <UserIcon className="h-4 w-4" />
                <span>{task.assignedTo}</span>
              </div>
            )}


          </div>


          {/* Voice Notes */}
          {task.voiceNotes && task.voiceNotes.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <MicrophoneIcon className="h-4 w-4" />
                <span>Sprachnotizen ({task.voiceNotes.length})</span>
              </div>
              {task.voiceNotes.map((voiceNote) => (
                <div key={voiceNote.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                  <audio controls className="flex-1 h-8">
                    <source src={voiceNote.url} type="audio/webm" />
                    Ihr Browser unterstützt keine Audio-Wiedergabe.
                  </audio>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <span>{Math.floor(voiceNote.duration / 60)}:{(voiceNote.duration % 60).toString().padStart(2, '0')}</span>
                    {voiceNote.transcribedText && (
                      <span className="text-blue-600" title={voiceNote.transcribedText}>
                        📝
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other Attachments indicator */}
          {(task.attachments?.length || task.photos?.length) && (
            <div className="flex items-center space-x-2 mt-2">
              {task.photos && task.photos.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <PhotoIcon className="h-4 w-4" />
                  <span>{task.photos.length}</span>
                </div>
              )}
              
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <PaperClipIcon className="h-4 w-4" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {/* Priority Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
          </span>

          {/* Status Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
            {getStatusText(task.status)}
          </span>

          {/* Action Buttons */}
          {isHovered && (
            <div className="flex items-center space-x-1">
              <button
                onClick={handleStatusToggle}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={task.status === 'completed' ? 'Als ausstehend markieren' : 'Als erledigt markieren'}
              >
                <StatusIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Aufgabe löschen"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
