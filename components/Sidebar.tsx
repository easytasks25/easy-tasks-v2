'use client'

import { useState } from 'react'
import { format, isToday, isTomorrow, isYesterday, addDays, subDays } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  CalendarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Task } from '@/types/task'
import { useBuckets } from '@/hooks/useBuckets'

interface SidebarProps {
  tasks: Task[]
  onDateSelect: (date: Date) => void
  selectedDate: Date
  onSearchResults?: (results: Task[]) => void
}

export function Sidebar({ tasks, onDateSelect, selectedDate, onSearchResults }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showWeekSearch, setShowWeekSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [searchBucket, setSearchBucket] = useState('')
  const [searchAssignee, setSearchAssignee] = useState('')
  const [searchStatus, setSearchStatus] = useState<string[]>([])
  
  const { buckets } = useBuckets()

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  const getTodaysTasks = () => getTasksForDate(new Date())
  const getTomorrowsTasks = () => getTasksForDate(addDays(new Date(), 1))
  const getYesterdaysTasks = () => getTasksForDate(subDays(new Date(), 1))

  const getOverdueTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today && task.status !== 'completed'
    })
  }

  const getUpcomingTasks = () => {
    const today = new Date()
    const nextWeek = addDays(today, 7)
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate)
      return dueDate >= today && dueDate <= nextWeek && task.status !== 'completed'
    })
  }

  // Search function for "Diese Woche"
  const searchTasks = () => {
    let filteredTasks = tasks

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.notes?.toLowerCase().includes(query)
      )
    }

    // Date search
    if (searchDate) {
      const searchDateObj = new Date(searchDate)
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.dueDate)
        return taskDate.toDateString() === searchDateObj.toDateString()
      })
    }

    // Bucket search
    if (searchBucket) {
      const bucket = buckets.find(b => 
        b.name.toLowerCase().includes(searchBucket.toLowerCase())
      )
      if (bucket) {
        // Filter tasks that are in this bucket
        const bucketTaskIds = tasks
          .filter(task => {
            // This would need to be implemented with task-bucket relationships
            // For now, we'll search in category as fallback
            return task.category?.toLowerCase().includes(searchBucket.toLowerCase())
          })
          .map(task => task.id)
        filteredTasks = filteredTasks.filter(task => bucketTaskIds.includes(task.id))
      } else {
        // Fallback to category search
        filteredTasks = filteredTasks.filter(task =>
          task.category?.toLowerCase().includes(searchBucket.toLowerCase())
        )
      }
    }

        // Assignee search
        if (searchAssignee) {
          filteredTasks = filteredTasks.filter(task =>
            task.assignedTo?.toLowerCase().includes(searchAssignee.toLowerCase())
          )
        }

        // Status search
        if (searchStatus.length > 0) {
          filteredTasks = filteredTasks.filter(task =>
            searchStatus.includes(task.status)
          )
        }

        return filteredTasks
  }

  const handleWeekSearch = () => {
    const searchResults = searchTasks()
    if (onSearchResults) {
      onSearchResults(searchResults)
    }
    console.log('Search results:', searchResults.length)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchDate('')
    setSearchBucket('')
    setSearchAssignee('')
    setSearchStatus([])
  }

  const handleStatusToggle = (status: string) => {
    setSearchStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const quickDates = [
    { 
      label: 'Heute', 
      date: new Date(), 
      count: getTodaysTasks().length, 
      icon: CalendarIcon,
      showDate: true
    },
    { 
      label: 'Morgen', 
      date: addDays(new Date(), 1), 
      count: getTomorrowsTasks().length, 
      icon: ClockIcon,
      showDate: true
    },
    { 
      label: 'Aufgabe finden', 
      date: addDays(new Date(), 7), 
      count: getUpcomingTasks().length, 
      icon: CalendarIcon,
      showDate: false,
      isSearchable: true
    },
  ]

  const overdueCount = getOverdueTasks().length

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white shadow-sm border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <CalendarIcon className="h-6 w-6 text-gray-600" />
        </button>
        {overdueCount > 0 && (
          <div className="relative">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {overdueCount}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Schnellzugriff</h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Overdue Tasks Alert */}
        {overdueCount > 0 && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-800">
                {overdueCount} überfällige Aufgabe{overdueCount > 1 ? 'n' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Quick Date Selection */}
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Schnellauswahl</h3>
          {quickDates.map(({ label, date, count, icon: Icon, showDate, isSearchable }) => (
            <div key={label}>
              <button
                onClick={() => {
                  if (isSearchable) {
                    setShowWeekSearch(!showWeekSearch)
                  } else {
                    onDateSelect(date)
                  }
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedDate.toDateString() === date.toDateString()
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{label}</span>
                    {showDate && (
                      <span className="text-xs text-gray-500">
                        {format(date, 'dd.MM.yy', { locale: de })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {count > 0 && (
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {count}
                    </span>
                  )}
                  {isSearchable && (
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Search Panel for "Diese Woche" */}
              {isSearchable && showWeekSearch && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium text-gray-700">Aufgaben suchen</h4>
                    <button
                      onClick={() => setShowWeekSearch(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Text Search */}
                  <div>
                    <input
                      type="text"
                      placeholder="Freitextsuche..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Date Search */}
                  <div>
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Bucket Search */}
                  <div>
                    <select
                      value={searchBucket}
                      onChange={(e) => setSearchBucket(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">Alle Buckets</option>
                      {buckets.map((bucket) => (
                        <option key={bucket.id} value={bucket.name}>
                          {bucket.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Search */}
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Status</div>
                    <div className="space-y-1">
                      {[
                        { value: 'pending', label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-800' },
                        { value: 'in-progress', label: 'In Arbeit', color: 'bg-blue-100 text-blue-800' },
                        { value: 'completed', label: 'Erledigt', color: 'bg-green-100 text-green-800' },
                        { value: 'cancelled', label: 'Abgebrochen', color: 'bg-red-100 text-red-800' }
                      ].map((status) => (
                        <label key={status.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={searchStatus.includes(status.value)}
                            onChange={() => handleStatusToggle(status.value)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-3 w-3"
                          />
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${status.color}`}>
                            {status.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Assignee Search */}
                  <div>
                    <input
                      type="text"
                      placeholder="Zugewiesener Mitarbeiter..."
                      value={searchAssignee}
                      onChange={(e) => setSearchAssignee(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  {/* Search Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleWeekSearch}
                      className="flex-1 bg-primary-600 text-white text-xs px-3 py-1 rounded hover:bg-primary-700 transition-colors"
                    >
                      Suchen
                    </button>
                    <button
                      onClick={clearSearch}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Löschen
                    </button>
                  </div>

                  {/* Search Results Count */}
                  {searchQuery || searchDate || searchBucket || searchAssignee ? (
                    <div className="text-xs text-gray-600">
                      {searchTasks().length} Aufgaben gefunden
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recent Tasks */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Letzte Aufgaben</h3>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => onDateSelect(new Date(task.dueDate))}
              >
                <div className={`w-3 h-3 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: de })}
                  </p>
                </div>
                <div className={`px-2 py-1 text-xs rounded-full ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.status === 'completed' ? 'Erledigt' :
                   task.status === 'in-progress' ? 'In Arbeit' : 'Ausstehend'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
