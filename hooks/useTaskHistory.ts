import { useState, useCallback } from 'react'
import { Task, TaskStatus, TaskPriority } from '@/types/task'
import { 
  TaskHistoryEntry, 
  TaskHistoryAction, 
  createHistoryEntry, 
  getActionDescription 
} from '@/types/taskHistory'

interface UseTaskHistoryProps {
  currentUser: {
    id: string
    name: string
    email?: string
  }
}

export function useTaskHistory({ currentUser }: UseTaskHistoryProps) {
  const [historyEntries, setHistoryEntries] = useState<Map<string, TaskHistoryEntry[]>>(new Map())

  // Erstelle einen neuen Historie-Eintrag
  const addHistoryEntry = useCallback((
    taskId: string,
    action: TaskHistoryAction,
    changes?: TaskHistoryEntry['changes']
  ) => {
    const entry = createHistoryEntry(
      taskId,
      action,
      currentUser.id,
      currentUser.name,
      changes,
      {
        source: 'web',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
      }
    )

    const newEntry: TaskHistoryEntry = {
      ...entry,
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    setHistoryEntries(prev => {
      const newMap = new Map(prev)
      const existingHistory = newMap.get(taskId) || []
      newMap.set(taskId, [newEntry, ...existingHistory])
      return newMap
    })

    return newEntry
  }, [currentUser])

  // Logge die Erstellung einer Aufgabe
  const logTaskCreation = useCallback((task: Task) => {
    return addHistoryEntry(task.id, 'created', {
      description: `Aufgabe "${task.title}" erstellt`
    })
  }, [addHistoryEntry])

  // Logge Status-Änderungen
  const logStatusChange = useCallback((taskId: string, oldStatus: TaskStatus, newStatus: TaskStatus) => {
    return addHistoryEntry(taskId, 'status_changed', {
      field: 'status',
      oldValue: oldStatus,
      newValue: newStatus,
      description: getActionDescription('status_changed', {
        oldValue: getStatusLabel(oldStatus),
        newValue: getStatusLabel(newStatus)
      })
    })
  }, [addHistoryEntry])

  // Logge Prioritäts-Änderungen
  const logPriorityChange = useCallback((taskId: string, oldPriority: TaskPriority, newPriority: TaskPriority) => {
    return addHistoryEntry(taskId, 'priority_changed', {
      field: 'priority',
      oldValue: oldPriority,
      newValue: newPriority,
      description: getActionDescription('priority_changed', {
        oldValue: getPriorityLabel(oldPriority),
        newValue: getPriorityLabel(newPriority)
      })
    })
  }, [addHistoryEntry])

  // Logge Zuweisungs-Änderungen
  const logAssignmentChange = useCallback((taskId: string, oldAssignee?: string, newAssignee?: string) => {
    if (!oldAssignee && newAssignee) {
      return addHistoryEntry(taskId, 'assigned', {
        field: 'assignedTo',
        newValue: newAssignee,
        description: `Zugewiesen an ${newAssignee}`
      })
    } else if (oldAssignee && !newAssignee) {
      return addHistoryEntry(taskId, 'unassigned', {
        field: 'assignedTo',
        oldValue: oldAssignee,
        description: `Zuweisung entfernt von ${oldAssignee}`
      })
    } else if (oldAssignee && newAssignee && oldAssignee !== newAssignee) {
      return addHistoryEntry(taskId, 'assigned', {
        field: 'assignedTo',
        oldValue: oldAssignee,
        newValue: newAssignee,
        description: `Zugewiesen von ${oldAssignee} an ${newAssignee}`
      })
    }
  }, [addHistoryEntry])

  // Logge Notiz-Änderungen
  const logNoteChange = useCallback((taskId: string, action: 'note_added' | 'note_updated' | 'note_deleted', noteContent?: string) => {
    return addHistoryEntry(taskId, action, {
      field: 'notes',
      newValue: noteContent,
      description: getActionDescription(action)
    })
  }, [addHistoryEntry])

  // Logge Fälligkeitsdatum-Änderungen
  const logDueDateChange = useCallback((taskId: string, oldDueDate: string, newDueDate: string) => {
    return addHistoryEntry(taskId, 'due_date_changed', {
      field: 'dueDate',
      oldValue: oldDueDate,
      newValue: newDueDate,
      description: getActionDescription('due_date_changed', {
        oldValue: formatDate(oldDueDate),
        newValue: formatDate(newDueDate)
      })
    })
  }, [addHistoryEntry])

  // Logge allgemeine Updates
  const logTaskUpdate = useCallback((taskId: string, field: string, oldValue: any, newValue: any) => {
    return addHistoryEntry(taskId, 'updated', {
      field,
      oldValue,
      newValue,
      description: `${field} geändert`
    })
  }, [addHistoryEntry])

  // Hole Historie für eine bestimmte Aufgabe
  const getTaskHistory = useCallback((taskId: string): TaskHistoryEntry[] => {
    return historyEntries.get(taskId) || []
  }, [historyEntries])

  // Aktualisiere Task mit Historie
  const updateTaskWithHistory = useCallback((task: Task): Task => {
    const history = getTaskHistory(task.id)
    return {
      ...task,
      history,
      createdBy: task.createdBy || currentUser.id
    }
  }, [getTaskHistory, currentUser.id])

  return {
    addHistoryEntry,
    logTaskCreation,
    logStatusChange,
    logPriorityChange,
    logAssignmentChange,
    logNoteChange,
    logDueDateChange,
    logTaskUpdate,
    getTaskHistory,
    updateTaskWithHistory
  }
}

// Hilfsfunktionen
function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'pending': return 'Ausstehend'
    case 'in-progress': return 'In Arbeit'
    case 'completed': return 'Erledigt'
    case 'cancelled': return 'Abgebrochen'
    default: return status
  }
}

function getPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'low': return 'Niedrig'
    case 'medium': return 'Mittel'
    case 'high': return 'Hoch'
    default: return priority
  }
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}
