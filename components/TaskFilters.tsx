'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { TaskFilter, TaskPriority, TaskStatus } from '@/types/task'

interface TaskFiltersProps {
  filters: TaskFilter
  onFiltersChange: (filters: TaskFilter) => void
  onClose: () => void
}

export function TaskFilters({ filters, onFiltersChange, onClose }: TaskFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TaskFilter>(filters)

  const handleStatusChange = (status: TaskStatus, checked: boolean) => {
    const currentStatuses = localFilters.status || []
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status)
    
    setLocalFilters(prev => ({ ...prev, status: newStatuses }))
  }

  const handlePriorityChange = (priority: TaskPriority, checked: boolean) => {
    const currentPriorities = localFilters.priority || []
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority)
    
    setLocalFilters(prev => ({ ...prev, priority: newPriorities }))
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = localFilters.category || []
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category)
    
    setLocalFilters(prev => ({ ...prev, category: newCategories }))
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleClear = () => {
    setLocalFilters({})
    onFiltersChange({})
  }

  const statusOptions = [
    { value: 'pending', label: 'Ausstehend' },
    { value: 'in-progress', label: 'In Arbeit' },
    { value: 'completed', label: 'Erledigt' },
    { value: 'cancelled', label: 'Abgebrochen' },
  ]

  const priorityOptions = [
    { value: 'low', label: 'Niedrig' },
    { value: 'medium', label: 'Mittel' },
    { value: 'high', label: 'Hoch' },
  ]

  const categoryOptions = [
    { value: 'planning', label: 'Planung' },
    { value: 'construction', label: 'Bauarbeiten' },
    { value: 'inspection', label: 'Kontrolle' },
    { value: 'safety', label: 'Sicherheit' },
    { value: 'maintenance', label: 'Wartung' },
    { value: 'other', label: 'Sonstiges' },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filter</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Status</h4>
          <div className="space-y-2">
            {statusOptions.map(({ value, label }) => (
              <label key={value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.status?.includes(value as TaskStatus) || false}
                  onChange={(e) => handleStatusChange(value as TaskStatus, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Priorität</h4>
          <div className="space-y-2">
            {priorityOptions.map(({ value, label }) => (
              <label key={value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.priority?.includes(value as TaskPriority) || false}
                  onChange={(e) => handlePriorityChange(value as TaskPriority, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Kategorie</h4>
          <div className="space-y-2">
            {categoryOptions.map(({ value, label }) => (
              <label key={value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.category?.includes(value) || false}
                  onChange={(e) => handleCategoryChange(value, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleClear}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Alle zurücksetzen
        </button>
        <button
          onClick={handleApply}
          className="btn-primary"
        >
          Filter anwenden
        </button>
      </div>
    </div>
  )
}
