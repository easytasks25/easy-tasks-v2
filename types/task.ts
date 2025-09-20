export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled'

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  createdAt: Date
  updatedAt: Date
  category?: string
  location?: string
  assignedTo?: string
  attachments?: Attachment[]
  notes?: string
  materials?: Material[]
  photos?: Photo[]
  voiceNotes?: VoiceNote[]
  isRecurring?: boolean
  recurringPattern?: RecurringPattern
  parentTaskId?: string
  subtasks?: string[]
  linkedTasks?: string[]
  startedAt?: Date
  completedAt?: Date
  completedBy?: string
}

export interface Attachment {
  id: string
  name: string
  type: 'image' | 'document' | 'pdf' | 'other'
  url: string
  size: number
  uploadedAt: Date
}

export interface Photo {
  id: string
  url: string
  caption?: string
  location?: {
    lat: number
    lng: number
  }
  takenAt: Date
  exifData?: any
}

export interface VoiceNote {
  id: string
  url: string
  duration: number
  transcribedText?: string
  recordedAt: Date
}

export interface Material {
  id: string
  name: string
  quantity: number
  unit: string
  supplier?: string
  cost?: number
  status: 'needed' | 'ordered' | 'delivered' | 'used'
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  endDate?: string
}

export interface TaskFilter {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  category?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  thisWeek: number
  thisMonth: number
}
