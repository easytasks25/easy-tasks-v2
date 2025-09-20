'use client'

import { useState } from 'react'
import { 
  PlusIcon, 
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Task, TaskPriority, TaskStatus } from '@/types/task'
import { Bucket, BucketStats } from '@/types/bucket'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { useBuckets } from '@/hooks/useBuckets'
import { BucketGuide } from './BucketGuide'
import { toast } from 'react-hot-toast'
import { format, addDays, getWeek, startOfWeek, endOfWeek } from 'date-fns'
import { de } from 'date-fns/locale'

interface BucketBoardProps {
  tasks: Task[]
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function BucketBoard({ tasks, onUpdateTask, onDeleteTask, onAddTask }: BucketBoardProps) {
  const {
    buckets,
    getTasksForBucket,
    moveTaskToBucket,
    createBucket,
    updateBucket,
    archiveBucket,
    restoreBucket,
    permanentlyDeleteBucket,
    getActiveBuckets,
    getArchivedBuckets,
    getBucketStats
  } = useBuckets()

  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showCreateBucket, setShowCreateBucket] = useState(false)
  const [editingBucket, setEditingBucket] = useState<Bucket | null>(null)
  const [newBucketName, setNewBucketName] = useState('')
  const [showArchivedBuckets, setShowArchivedBuckets] = useState(false)
  const [selectedBucketForTask, setSelectedBucketForTask] = useState<string | null>(null)

  // Date information for buckets
  const getBucketDateInfo = (bucketName: string) => {
    const today = new Date()
    const tomorrow = addDays(today, 1)
    const weekStart = startOfWeek(today, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
    const weekNumber = getWeek(today, { weekStartsOn: 1 })

    switch (bucketName.toLowerCase()) {
      case 'heute':
        return {
          date: format(today, 'dd.MM.yy', { locale: de }),
          weekNumber: null
        }
      case 'morgen':
        return {
          date: format(tomorrow, 'dd.MM.yy', { locale: de }),
          weekNumber: null
        }
      case 'diese woche':
        return {
          date: `${format(weekStart, 'dd.MM', { locale: de })} - ${format(weekEnd, 'dd.MM.yy', { locale: de })}`,
          weekNumber: weekNumber
        }
      default:
        return null
    }
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, bucketId: string) => {
    e.preventDefault()
    
    if (draggedTask) {
      moveTaskToBucket(draggedTask.id, bucketId)
      toast.success(`Aufgabe zu "${buckets.find(b => b.id === bucketId)?.name}" verschoben`)
      setDraggedTask(null)
    }
  }

  const handleTaskClick = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleQuickMove = (task: Task, fromBucketId: string) => {
    const fromBucket = buckets.find(b => b.id === fromBucketId)
    if (!fromBucket) return

    // Quick move logic
    if (fromBucket.type === 'today') {
      // Move from "Heute" to "Morgen"
      const tomorrowBucket = buckets.find(b => b.type === 'tomorrow')
      if (tomorrowBucket) {
        moveTaskToBucket(task.id, tomorrowBucket.id)
        toast.success('Aufgabe auf morgen verschoben')
      }
    } else if (fromBucket.type === 'tomorrow') {
      // Move from "Morgen" to "Diese Woche"
      const weekBucket = buckets.find(b => b.type === 'this-week')
      if (weekBucket) {
        moveTaskToBucket(task.id, weekBucket.id)
        toast.success('Aufgabe auf diese Woche verschoben')
      }
    }
  }

  const handleAddTask = (bucketId: string) => {
    setEditingTask(null)
    setShowTaskForm(true)
    // Store the target bucket for the new task
    sessionStorage.setItem('target-bucket', bucketId)
  }

  const handleCreateBucket = () => {
    if (newBucketName.trim()) {
      createBucket(newBucketName.trim())
      setNewBucketName('')
      setShowCreateBucket(false)
      toast.success(`Bucket "${newBucketName.trim()}" erstellt`)
    }
  }

  const handleCreateTaskInBucket = (bucketId: string) => {
    setSelectedBucketForTask(bucketId)
    setEditingTask(null)
    setShowTaskForm(true)
  }

  const handleArchiveBucket = (bucketId: string) => {
    archiveBucket(bucketId)
    toast.success('Bucket archiviert!')
  }

  const handleRestoreBucket = (bucketId: string) => {
    restoreBucket(bucketId)
    toast.success('Bucket wiederhergestellt!')
  }

  const handlePermanentlyDeleteBucket = (bucketId: string) => {
    if (confirm('Möchten Sie diesen Bucket wirklich dauerhaft löschen?')) {
      permanentlyDeleteBucket(bucketId)
      toast.success('Bucket dauerhaft gelöscht!')
    }
  }

  const handleDeleteBucket = (bucketId: string) => {
    const bucket = buckets.find(b => b.id === bucketId)
    if (bucket?.isDefault) {
      toast.error('Standard-Buckets können nicht gelöscht werden')
      return
    }
    
    if (confirm(`Möchten Sie den Bucket "${bucket?.name}" archivieren?`)) {
      handleArchiveBucket(bucketId)
    }
  }

  const handleEditBucket = (bucket: Bucket) => {
    setEditingBucket(bucket)
    setNewBucketName(bucket.name)
    setShowCreateBucket(true)
  }

  const handleUpdateBucket = () => {
    if (editingBucket && newBucketName.trim()) {
      updateBucket(editingBucket.id, { name: newBucketName.trim() })
      setEditingBucket(null)
      setNewBucketName('')
      setShowCreateBucket(false)
      toast.success('Bucket aktualisiert')
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Aufgaben-Buckets</h2>
          <p className="text-sm text-gray-500">
            Ziehen Sie Aufgaben zwischen den Buckets, um sie zu organisieren
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setSelectedBucketForTask(null)
              setEditingTask(null)
              setShowTaskForm(true)
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Neue Aufgabe</span>
          </button>
          
          <button
            onClick={() => setShowCreateBucket(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Neuer Bucket</span>
          </button>
        </div>
      </div>

      {/* Buckets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getActiveBuckets().map((bucket) => {
          const bucketTasks = getTasksForBucket(bucket.id, tasks)
          const stats = getBucketStats(bucket.id, tasks)
          
          return (
            <div
              key={bucket.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, bucket.id)}
            >
              {/* Bucket Header */}
              <div 
                className="p-4 border-b border-gray-200 rounded-t-lg"
                style={{ backgroundColor: `${bucket.color}15` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: bucket.color }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{bucket.name}</h3>
                      {getBucketDateInfo(bucket.name) && (
                        <div className="text-xs text-gray-500">
                          {getBucketDateInfo(bucket.name)?.date}
                          {getBucketDateInfo(bucket.name)?.weekNumber && (
                            <span className="ml-1 font-medium">
                              (KW {getBucketDateInfo(bucket.name)?.weekNumber})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {stats.totalTasks}
                    </span>
                    
                    {/* Neue Aufgabe Button */}
                    <button
                      onClick={() => handleCreateTaskInBucket(bucket.id)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Neue Aufgabe in diesem Bucket erstellen"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    
                    {!bucket.isDefault && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditBucket(bucket)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBucket(bucket.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Bucket Stats */}
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{stats.pendingTasks} ausstehend</span>
                  {stats.overdueTasks > 0 && (
                    <span className="text-red-600">{stats.overdueTasks} überfällig</span>
                  )}
                </div>
              </div>

              {/* Tasks List */}
              <div className="p-4 space-y-3 min-h-[300px]">
                {bucketTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Keine Aufgaben</p>
                    <button
                      onClick={() => handleAddTask(bucket.id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Aufgabe hinzufügen
                    </button>
                  </div>
                ) : (
                  bucketTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="cursor-move"
                    >
                      <div className="relative group">
                        <TaskCard
                          task={task}
                          onClick={() => handleTaskClick(task)}
                          onUpdate={onUpdateTask}
                          onDelete={onDeleteTask}
                          compact={true}
                        />
                        
                        {/* Quick Move Button */}
                        {(bucket.type === 'today' || bucket.type === 'tomorrow') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuickMove(task, bucket.id)
                            }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-gray-200 rounded-full p-1 hover:bg-gray-50"
                            title={bucket.type === 'today' ? 'Auf morgen verschieben' : 'Auf diese Woche verschieben'}
                          >
                            <svg className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Task Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => handleAddTask(bucket.id)}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Aufgabe hinzufügen</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create/Edit Bucket Modal */}
      {showCreateBucket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBucket ? 'Bucket bearbeiten' : 'Neuer Bucket'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateBucket(false)
                  setEditingBucket(null)
                  setNewBucketName('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bucket-Name
                  </label>
                  <input
                    type="text"
                    value={newBucketName}
                    onChange={(e) => setNewBucketName(e.target.value)}
                    className="input-field"
                    placeholder="z.B. Dringend, Wartung, etc."
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateBucket(false)
                    setEditingBucket(null)
                    setNewBucketName('')
                  }}
                  className="btn-secondary"
                >
                  Abbrechen
                </button>
                <button
                  onClick={editingBucket ? handleUpdateBucket : handleCreateBucket}
                  className="btn-primary"
                >
                  {editingBucket ? 'Aktualisieren' : 'Erstellen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archivierte Buckets */}
      {getArchivedBuckets().length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Archivierte Buckets ({getArchivedBuckets().length})
            </h3>
            <button
              onClick={() => setShowArchivedBuckets(!showArchivedBuckets)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showArchivedBuckets ? 'Ausblenden' : 'Anzeigen'}
            </button>
          </div>
          
          {showArchivedBuckets && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getArchivedBuckets().map((bucket) => (
                <div
                  key={bucket.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: bucket.color }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-700">{bucket.name}</h4>
                        <p className="text-xs text-gray-500">
                          Archiviert am {bucket.archivedAt ? format(new Date(bucket.archivedAt), 'dd.MM.yyyy', { locale: de }) : 'Unbekannt'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleRestoreBucket(bucket.id)}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Bucket wiederherstellen"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePermanentlyDeleteBucket(bucket.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Bucket dauerhaft löschen"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false)
          setEditingTask(null)
          setSelectedBucketForTask(null)
        }}
        onSubmit={(data) => {
          if (editingTask) {
            onUpdateTask(editingTask.id, data)
          } else {
            onAddTask(data as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>)
            // Move to selected bucket or target bucket
            const targetBucket = data.bucketId || selectedBucketForTask || getActiveBuckets().find(b => b.type === 'today')?.id
            if (targetBucket) {
              setTimeout(() => {
                // Find the most recently created task (assuming it's the last one)
                const newTask = tasks[tasks.length - 1]
                if (newTask) {
                  moveTaskToBucket(newTask.id, targetBucket)
                }
              }, 100)
            }
          }
          setShowTaskForm(false)
          setEditingTask(null)
          setSelectedBucketForTask(null)
        }}
        initialData={editingTask}
        buckets={getActiveBuckets()}
        selectedBucketId={selectedBucketForTask}
        defaultBucketId={getActiveBuckets().find(b => b.type === 'today')?.id}
      />
      
      <BucketGuide />
    </div>
  )
}
