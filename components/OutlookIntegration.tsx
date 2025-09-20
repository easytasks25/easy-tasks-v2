'use client'

import { useState, useEffect } from 'react'
import { 
  CloudArrowUpIcon, 
  CloudArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { outlookService } from '@/lib/outlook'
import { Task } from '@/types/task'
import { toast } from 'react-hot-toast'

interface OutlookIntegrationProps {
  tasks: Task[]
  onTasksUpdate: (tasks: Task[]) => void
}

export function OutlookIntegration({ tasks, onTasksUpdate }: OutlookIntegrationProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    setIsAuthenticated(outlookService.isAuthenticated())
    
    // Check for last sync time
    const lastSyncTime = localStorage.getItem('outlook-last-sync')
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime))
    }
  }, [])

  const handleAuthenticate = async () => {
    try {
      const success = await outlookService.authenticate()
      if (success) {
        setIsAuthenticated(true)
        toast.success('Erfolgreich mit Outlook verbunden!')
      } else {
        toast.error('Outlook-Authentifizierung fehlgeschlagen')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error('Fehler bei der Outlook-Verbindung')
    }
  }

  const handleSync = async () => {
    if (!isAuthenticated) {
      await handleAuthenticate()
      return
    }

    setIsSyncing(true)
    setSyncStatus('syncing')
    setSyncError(null)

    try {
      // Sync tasks to Outlook
      await outlookService.syncTasksWithOutlook(tasks)
      
      // Update last sync time
      const now = new Date()
      setLastSync(now)
      localStorage.setItem('outlook-last-sync', now.toISOString())
      
      setSyncStatus('success')
      toast.success('Synchronisation mit Outlook erfolgreich!')
      
      // Auto-hide success status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000)
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('error')
      setSyncError(error instanceof Error ? error.message : 'Unbekannter Fehler')
      toast.error('Synchronisation fehlgeschlagen')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleLogout = () => {
    outlookService.logout()
    setIsAuthenticated(false)
    setLastSync(null)
    localStorage.removeItem('outlook-last-sync')
    toast.success('Von Outlook abgemeldet')
  }

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Synchronisiere...'
      case 'success':
        return 'Synchronisiert'
      case 'error':
        return 'Fehler'
      default:
        return lastSync ? `Zuletzt: ${lastSync.toLocaleString('de-DE')}` : 'Noch nie synchronisiert'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Outlook-Integration</h3>
            <p className="text-sm text-gray-500">
              Synchronisiere Aufgaben mit Outlook-Kalender
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Abmelden
            </button>
          ) : (
            <button
              onClick={handleAuthenticate}
              className="btn-secondary text-sm"
            >
              Anmelden
            </button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-red-500" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {isAuthenticated ? 'Verbunden' : 'Nicht verbunden'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {getSyncStatusIcon()}
          <span className="text-sm text-gray-500">
            {getSyncStatusText()}
          </span>
        </div>
      </div>

      {/* Sync Error */}
      {syncError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700">{syncError}</span>
          </div>
        </div>
      )}

      {/* Sync Actions */}
      <div className="space-y-3">
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            isAuthenticated
              ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400'
              : 'bg-gray-600 hover:bg-gray-700 text-white disabled:bg-gray-400'
          }`}
        >
          {isSyncing ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <CloudArrowUpIcon className="h-5 w-5" />
          )}
          <span>
            {isSyncing 
              ? 'Synchronisiere...' 
              : isAuthenticated 
                ? 'Mit Outlook synchronisieren' 
                : 'Mit Outlook verbinden & synchronisieren'
            }
          </span>
        </button>

        {isAuthenticated && (
          <div className="text-xs text-gray-500 text-center">
            {tasks.length} Aufgaben werden synchronisiert
          </div>
        )}
      </div>

      {/* Features Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Was wird synchronisiert?
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Aufgaben werden als Outlook-Termine erstellt</li>
          <li>• Prioritäten werden als Wichtigkeit übertragen</li>
          <li>• Standorte werden in Outlook gespeichert</li>
          <li>• Beschreibungen werden als Notizen übertragen</li>
          <li>• Zwei-Wege-Synchronisation (geplant)</li>
        </ul>
      </div>
    </div>
  )
}
