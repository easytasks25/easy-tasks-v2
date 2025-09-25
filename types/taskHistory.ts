// Typen für Aufgaben-Historie

export type TaskHistoryAction = 
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'
  | 'note_added'
  | 'note_updated'
  | 'note_deleted'
  | 'attachment_added'
  | 'attachment_removed'
  | 'due_date_changed'
  | 'priority_changed'
  | 'category_changed'
  | 'location_changed'
  | 'deleted'
  | 'restored'

export interface TaskHistoryEntry {
  id: string
  taskId: string
  action: TaskHistoryAction
  timestamp: Date
  userId: string
  userName: string
  userEmail?: string
  
  // Änderungsdetails
  changes?: {
    field?: string
    oldValue?: any
    newValue?: any
    description?: string
  }
  
  // Zusätzliche Metadaten
  metadata?: {
    ipAddress?: string
    userAgent?: string
    source?: 'web' | 'mobile' | 'api'
  }
}

export interface TaskHistorySummary {
  totalEntries: number
  lastModified: Date
  lastModifiedBy: string
  createdBy: string
  createdAt: Date
  statusChanges: number
  noteChanges: number
  assignmentChanges: number
}

// Hilfsfunktionen für Historie
export function createHistoryEntry(
  taskId: string,
  action: TaskHistoryAction,
  userId: string,
  userName: string,
  changes?: TaskHistoryEntry['changes'],
  metadata?: TaskHistoryEntry['metadata']
): Omit<TaskHistoryEntry, 'id'> {
  return {
    taskId,
    action,
    timestamp: new Date(),
    userId,
    userName,
    changes,
    metadata
  }
}

export function getActionDescription(action: TaskHistoryAction, changes?: TaskHistoryEntry['changes']): string {
  switch (action) {
    case 'created':
      return 'Aufgabe erstellt'
    case 'updated':
      return changes?.field ? `${changes.field} geändert` : 'Aufgabe aktualisiert'
    case 'status_changed':
      return `Status geändert von "${changes?.oldValue}" zu "${changes?.newValue}"`
    case 'assigned':
      return `Zugewiesen an ${changes?.newValue}`
    case 'unassigned':
      return `Zuweisung entfernt von ${changes?.oldValue}`
    case 'note_added':
      return 'Notiz hinzugefügt'
    case 'note_updated':
      return 'Notiz aktualisiert'
    case 'note_deleted':
      return 'Notiz gelöscht'
    case 'attachment_added':
      return `Anhang hinzugefügt: ${changes?.newValue}`
    case 'attachment_removed':
      return `Anhang entfernt: ${changes?.oldValue}`
    case 'due_date_changed':
      return `Fälligkeitsdatum geändert von "${changes?.oldValue}" zu "${changes?.newValue}"`
    case 'priority_changed':
      return `Priorität geändert von "${changes?.oldValue}" zu "${changes?.newValue}"`
    case 'category_changed':
      return `Kategorie geändert von "${changes?.oldValue}" zu "${changes?.newValue}"`
    case 'location_changed':
      return `Standort geändert von "${changes?.oldValue}" zu "${changes?.newValue}"`
    case 'deleted':
      return 'Aufgabe gelöscht'
    case 'restored':
      return 'Aufgabe wiederhergestellt'
    default:
      return 'Unbekannte Aktion'
  }
}

export function getActionIcon(action: TaskHistoryAction): string {
  switch (action) {
    case 'created':
      return '➕'
    case 'updated':
      return '✏️'
    case 'status_changed':
      return '🔄'
    case 'assigned':
    case 'unassigned':
      return '👤'
    case 'note_added':
    case 'note_updated':
    case 'note_deleted':
      return '📝'
    case 'attachment_added':
    case 'attachment_removed':
      return '📎'
    case 'due_date_changed':
      return '📅'
    case 'priority_changed':
      return '⚡'
    case 'category_changed':
      return '🏷️'
    case 'location_changed':
      return '📍'
    case 'deleted':
      return '🗑️'
    case 'restored':
      return '♻️'
    default:
      return '❓'
  }
}

export function getActionColor(action: TaskHistoryAction): string {
  switch (action) {
    case 'created':
      return 'text-green-600 bg-green-100'
    case 'status_changed':
      return 'text-blue-600 bg-blue-100'
    case 'assigned':
    case 'unassigned':
      return 'text-purple-600 bg-purple-100'
    case 'note_added':
    case 'note_updated':
    case 'note_deleted':
      return 'text-yellow-600 bg-yellow-100'
    case 'attachment_added':
    case 'attachment_removed':
      return 'text-gray-600 bg-gray-100'
    case 'due_date_changed':
      return 'text-indigo-600 bg-indigo-100'
    case 'priority_changed':
      return 'text-orange-600 bg-orange-100'
    case 'category_changed':
      return 'text-pink-600 bg-pink-100'
    case 'location_changed':
      return 'text-teal-600 bg-teal-100'
    case 'deleted':
      return 'text-red-600 bg-red-100'
    case 'restored':
      return 'text-green-600 bg-green-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}
