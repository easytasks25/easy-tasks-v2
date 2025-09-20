'use client'

import { useState, useEffect } from 'react'
import { 
  EnvelopeIcon, 
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { emailService, emailParsingUtils } from '@/lib/email'
import { Task } from '@/types/task'
import { toast } from 'react-hot-toast'

interface EmailIntegrationProps {
  onTasksCreated: (tasks: Task[]) => void
}

export function EmailIntegration({ onTasksCreated }: EmailIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [emailTasks, setEmailTasks] = useState<any[]>([])
  const [showEmailTasks, setShowEmailTasks] = useState(false)
  const [taskEmailAddress, setTaskEmailAddress] = useState('tasks@lwtasks.de')

  useEffect(() => {
    setIsConnected(emailService.isEmailConnected())
    
    // Check for last check time
    const lastCheckTime = localStorage.getItem('email-last-check')
    if (lastCheckTime) {
      setLastCheck(new Date(lastCheckTime))
    }
  }, [])

  const handleConnect = async () => {
    try {
      const success = await emailService.connect()
      if (success) {
        setIsConnected(true)
        toast.success('E-Mail-Verbindung hergestellt!')
      } else {
        toast.error('E-Mail-Verbindung fehlgeschlagen')
      }
    } catch (error) {
      console.error('Email connection error:', error)
      toast.error('Fehler bei der E-Mail-Verbindung')
    }
  }

  const handleCheckEmails = async () => {
    if (!isConnected) {
      await handleConnect()
      return
    }

    setIsChecking(true)

    try {
      const tasks = await emailService.checkForTaskEmails()
      setEmailTasks(tasks)
      setShowEmailTasks(true)
      
      // Update last check time
      const now = new Date()
      setLastCheck(now)
      localStorage.setItem('email-last-check', now.toISOString())
      
      toast.success(`${tasks.length} E-Mail-Aufgaben gefunden!`)
    } catch (error) {
      console.error('Email check error:', error)
      toast.error('E-Mail-Prüfung fehlgeschlagen')
    } finally {
      setIsChecking(false)
    }
  }

  const handleCreateTasks = (selectedTasks: any[]) => {
    const newTasks: Task[] = selectedTasks.map(task => ({
      id: Date.now().toString() + Math.random(),
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: 'pending' as const,
      dueDate: task.dueDate,
      category: task.category,
      tags: task.tags,
      attachments: task.attachments || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: `Erstellt aus E-Mail von: ${task.sourceEmail}`,
    }))

    onTasksCreated(newTasks)
    setEmailTasks([])
    setShowEmailTasks(false)
    toast.success(`${newTasks.length} Aufgaben erstellt!`)
  }

  const handleSelectAll = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="email-task"]') as NodeListOf<HTMLInputElement>
    checkboxes.forEach(checkbox => {
      checkbox.checked = true
    })
  }

  const handleDeselectAll = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="email-task"]') as NodeListOf<HTMLInputElement>
    checkboxes.forEach(checkbox => {
      checkbox.checked = false
    })
  }

  const handleCreateSelected = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="email-task"]:checked') as NodeListOf<HTMLInputElement>
    const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.value))
    const selectedTasks = selectedIndices.map(index => emailTasks[index])
    
    if (selectedTasks.length === 0) {
      toast.error('Bitte wählen Sie mindestens eine Aufgabe aus')
      return
    }

    handleCreateTasks(selectedTasks)
  }

  return (
    <div className="space-y-6">
      {/* Email Integration Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-6 w-6 text-green-500" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">E-Mail-Integration</h3>
              <p className="text-sm text-gray-500">
                E-Mails in Aufgaben umwandeln
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {isConnected ? 'Verbunden' : 'Nicht verbunden'}
            </span>
          </div>
          
          <div className="text-sm text-gray-500">
            {lastCheck ? `Zuletzt: ${lastCheck.toLocaleString('de-DE')}` : 'Noch nie geprüft'}
          </div>
        </div>

        {/* Task Email Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-Mail-Adresse für Aufgaben
          </label>
          <div className="flex space-x-2">
            <input
              type="email"
              value={taskEmailAddress}
              onChange={(e) => setTaskEmailAddress(e.target.value)}
              className="input-field flex-1"
              placeholder="tasks@lwtasks.de"
            />
            <button
              onClick={() => navigator.clipboard.writeText(taskEmailAddress)}
              className="btn-secondary text-sm"
            >
              Kopieren
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Senden Sie E-Mails an diese Adresse, um automatisch Aufgaben zu erstellen
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCheckEmails}
            disabled={isChecking}
            className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
              isConnected
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400'
                : 'bg-gray-600 hover:bg-gray-700 text-white disabled:bg-gray-400'
            }`}
          >
            {isChecking ? (
              <ArrowDownTrayIcon className="h-5 w-5 animate-pulse" />
            ) : (
              <MagnifyingGlassIcon className="h-5 w-5" />
            )}
            <span>
              {isChecking 
                ? 'Prüfe E-Mails...' 
                : isConnected 
                  ? 'E-Mails prüfen' 
                  : 'Verbinden & E-Mails prüfen'
              }
            </span>
          </button>
        </div>

        {/* Features Info */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2">
            E-Mail-Format für Aufgaben
          </h4>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• Betreff: [AUFGABE] oder [HOCH] für Priorität</li>
            <li>• Datum: "bis Freitag" oder "bis 15.12.2024"</li>
            <li>• Kategorien: Sicherheit, Qualität, Material, etc.</li>
            <li>• Tags: #fundament #mauer #dach</li>
            <li>• Anhänge werden automatisch übernommen</li>
          </ul>
        </div>
      </div>

      {/* Email Tasks Modal */}
      {showEmailTasks && (
        <EmailTasksModal
          tasks={emailTasks}
          onClose={() => setShowEmailTasks(false)}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onCreateSelected={handleCreateSelected}
        />
      )}
    </div>
  )
}

interface EmailTasksModalProps {
  tasks: any[]
  onClose: () => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onCreateSelected: () => void
}

function EmailTasksModal({ 
  tasks, 
  onClose, 
  onSelectAll, 
  onDeselectAll, 
  onCreateSelected 
}: EmailTasksModalProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set())

  const handleTaskSelect = (index: number, selected: boolean) => {
    const newSelected = new Set(selectedTasks)
    if (selected) {
      newSelected.add(index)
    } else {
      newSelected.delete(index)
    }
    setSelectedTasks(newSelected)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            E-Mail-Aufgaben ({tasks.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={onSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Alle auswählen
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={onDeselectAll}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Auswahl aufheben
              </button>
            </div>
            
            <button
              onClick={onCreateSelected}
              disabled={selectedTasks.size === 0}
              className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {selectedTasks.size} Aufgaben erstellen
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  selectedTasks.has(index) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="email-task"
                    value={index}
                    checked={selectedTasks.has(index)}
                    onChange={(e) => handleTaskSelect(index, e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {task.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>Fällig: {new Date(task.dueDate).toLocaleDateString('de-DE')}</span>
                      {task.category && (
                        <span>Kategorie: {task.category}</span>
                      )}
                      {task.tags.length > 0 && (
                        <span>Tags: {task.tags.join(', ')}</span>
                      )}
                      {task.attachments.length > 0 && (
                        <span>Anhänge: {task.attachments.length}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
