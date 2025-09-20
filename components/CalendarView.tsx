'use client'

import React, { useState, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addDays, getWeek, startOfWeek } from 'date-fns'
import { de } from 'date-fns/locale'
import { ChevronLeftIcon, ChevronRightIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'
import { Task } from '@/types/task'
import { TaskCard } from './TaskCard'

interface CalendarViewProps {
  tasks: Task[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onTaskClick: (task: Task) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
}

export function CalendarView({ tasks, selectedDate, onDateSelect, onTaskClick, onUpdateTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [extendTask, setExtendTask] = useState<Task | null>(null)
  const [extendDays, setExtendDays] = useState(1)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add empty cells for days before month start (adjust for Monday start)
  const startDay = monthStart.getDay()
  const mondayStart = startDay === 0 ? 6 : startDay - 1 // Convert Sunday=0 to Monday=6
  const emptyStartDays = Array.from({ length: mondayStart }, (_, i) => null)

  // Group days by weeks
  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  
  // Add empty days at the beginning
  for (let i = 0; i < mondayStart; i++) {
    currentWeek.push(null as any)
  }
  
  // Add month days
  monthDays.forEach(day => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })
  
  // Add remaining empty days to complete the last week
  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push(null as any)
  }
  if (currentWeek.length === 7) {
    weeks.push(currentWeek)
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate)
      return isSameDay(taskDate, date)
    })
  }

  const getTaskCountForDate = (date: Date) => {
    return getTasksForDate(date).length
  }

  const getOverdueTasksForDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const taskDate = new Date(date)
    taskDate.setHours(0, 0, 0, 0)
    
    return getTasksForDate(date).filter(task => 
      taskDate < today && task.status !== 'completed'
    ).length
  }

  const getWeekNumber = (date: Date) => {
    return getWeek(date, { weekStartsOn: 1 }) // 1 = Monday
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  const isSelected = (date: Date) => {
    return isSameDay(date, selectedDate)
  }

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDate(date)
  }

  const handleDragLeave = () => {
    setDragOverDate(null)
  }

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault()
    if (draggedTask) {
      const newDueDate = targetDate.toISOString()
      onUpdateTask(draggedTask.id, { dueDate: newDueDate })
      setDraggedTask(null)
      setDragOverDate(null)
    }
  }

  // Extend task functionality
  const handleExtendTask = (task: Task) => {
    setExtendTask(task)
    setShowExtendModal(true)
  }

  const confirmExtendTask = () => {
    if (extendTask && extendDays > 0) {
      const currentDate = new Date(extendTask.dueDate)
      const newDueDate = addDays(currentDate, extendDays)
      onUpdateTask(extendTask.id, { dueDate: newDueDate.toISOString() })
      setShowExtendModal(false)
      setExtendTask(null)
      setExtendDays(1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Heute
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Week Headers */}
        <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
          <div className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200">
            KW
          </div>
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-8">
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {/* Week number column */}
              <div className="h-24 border-r border-b border-gray-200 bg-gray-50 flex items-center justify-center">
                {week.some(day => day && isSameMonth(day, currentMonth)) && (
                  <span className="text-sm font-medium text-gray-600">
                    KW {getWeekNumber(week.find(day => day && isSameMonth(day, currentMonth))!)}
                  </span>
                )}
              </div>
              
              {/* Days of the week */}
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <div key={`empty-${weekIndex}-${dayIndex}`} className="h-24 border-r border-b border-gray-200 bg-gray-50" />
                  )
                }

                const taskCount = getTaskCountForDate(day)
                const overdueCount = getOverdueTasksForDate(day)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isTodayDate = isToday(day)
                const isSelectedDate = isSelected(day)

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => onDateSelect(day)}
                    onDragOver={(e) => handleDragOver(e, day)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day)}
                    className={`h-24 border-r border-b border-gray-200 p-2 cursor-pointer transition-colors ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${
                      isTodayDate ? 'bg-primary-50' : ''
                    } ${
                      isSelectedDate ? 'bg-primary-100 ring-2 ring-primary-500' : 'hover:bg-gray-50'
                    } ${
                      dragOverDate && isSameDay(day, dragOverDate) ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${
                        isTodayDate ? 'text-primary-600' : ''
                      }`}>
                        {format(day, 'd')}
                      </span>
                      
                      {taskCount > 0 && (
                        <div className="flex items-center space-x-1">
                          {overdueCount > 0 && (
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                          )}
                          <span className="text-xs text-gray-500">
                            {taskCount}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Task indicators */}
                    {taskCount > 0 && (
                      <div className="space-y-1">
                        {getTasksForDate(day).slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onClick={(e) => {
                              e.stopPropagation()
                              onTaskClick(task)
                            }}
                            className={`text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm transition-all ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            } ${draggedTask?.id === task.id ? 'opacity-50' : ''}`}
                          >
                            {task.title}
                          </div>
                        ))}
                        {taskCount > 2 && (
                          <div className="text-xs text-gray-500">
                            +{taskCount - 2} weitere
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Selected Date Tasks */}
      {getTasksForDate(selectedDate).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Aufgaben für {format(selectedDate, 'dd.MM.yyyy', { locale: de })}
          </h3>
          <div className="space-y-3">
            {getTasksForDate(selectedDate).map((task) => (
              <div key={task.id} className="relative group">
                <TaskCard
                  task={task}
                  onClick={() => onTaskClick(task)}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExtendTask(task)
                    }}
                    className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    title="Aufgabe verlängern"
                  >
                    <ArrowsPointingOutIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extend Task Modal */}
      {showExtendModal && extendTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Aufgabe verlängern
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Aufgabe:</strong> {extendTask.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Aktuelles Fälligkeitsdatum:</strong> {format(new Date(extendTask.dueDate), 'dd.MM.yyyy', { locale: de })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Um wie viele Tage verlängern?
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={extendDays}
                    onChange={(e) => setExtendDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Neues Fälligkeitsdatum:</strong> {format(addDays(new Date(extendTask.dueDate), extendDays), 'dd.MM.yyyy', { locale: de })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowExtendModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={confirmExtendTask}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Verlängern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
