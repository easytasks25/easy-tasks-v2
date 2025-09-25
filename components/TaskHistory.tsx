'use client'

import { useState } from 'react'
import { TaskHistoryEntry, getActionDescription, getActionIcon, getActionColor } from '@/types/taskHistory'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  ClockIcon, 
  UserIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface TaskHistoryProps {
  history: TaskHistoryEntry[]
  taskTitle?: string
  className?: string
}

export function TaskHistory({ history, taskTitle, className = '' }: TaskHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  if (!history || history.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center text-gray-500">
          <ClockIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">Keine Historie verfügbar</span>
        </div>
      </div>
    )
  }

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const recentEntries = sortedHistory.slice(0, 3)
  const allEntries = sortedHistory

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">
              Aufgaben-Historie
            </h3>
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {history.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-gray-600"
              title={showDetails ? 'Details ausblenden' : 'Details anzeigen'}
            >
              {showDetails ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
            
            {history.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Historie-Einträge */}
      <div className="divide-y divide-gray-100">
        {(isExpanded ? allEntries : recentEntries).map((entry, index) => (
          <div key={entry.id} className="px-4 py-3 hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActionColor(entry.action)}`}>
                {getActionIcon(entry.action)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {entry.changes?.description || getActionDescription(entry.action, entry.changes)}
                  </p>
                  <time className="text-xs text-gray-500">
                    {format(new Date(entry.timestamp), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </time>
                </div>

                <div className="flex items-center mt-1">
                  <UserIcon className="h-3 w-3 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">
                    {entry.userName}
                  </span>
                </div>

                {/* Details anzeigen */}
                {showDetails && entry.changes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    {entry.changes.field && (
                      <div className="mb-1">
                        <span className="font-medium text-gray-700">Feld:</span> {entry.changes.field}
                      </div>
                    )}
                    {entry.changes.oldValue && (
                      <div className="mb-1">
                        <span className="font-medium text-gray-700">Vorher:</span> 
                        <span className="ml-1 px-1 py-0.5 bg-red-100 text-red-800 rounded">
                          {entry.changes.oldValue}
                        </span>
                      </div>
                    )}
                    {entry.changes.newValue && (
                      <div>
                        <span className="font-medium text-gray-700">Nachher:</span> 
                        <span className="ml-1 px-1 py-0.5 bg-green-100 text-green-800 rounded">
                          {entry.changes.newValue}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {history.length > 3 && !isExpanded && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            {history.length - 3} weitere Einträge anzeigen
          </button>
        </div>
      )}
    </div>
  )
}

// Kompakte Version für Listen
export function TaskHistoryCompact({ history, className = '' }: { history: TaskHistoryEntry[], className?: string }) {
  if (!history || history.length === 0) {
    return null
  }

  const latestEntry = history[0]
  const entryCount = history.length

  return (
    <div className={`flex items-center text-xs text-gray-500 ${className}`}>
      <ClockIcon className="h-3 w-3 mr-1" />
      <span>
        {format(new Date(latestEntry.timestamp), 'dd.MM HH:mm', { locale: de })} 
        {entryCount > 1 && ` (+${entryCount - 1})`}
      </span>
    </div>
  )
}
