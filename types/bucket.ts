export interface Bucket {
  id: string
  name: string
  type: 'today' | 'tomorrow' | 'this-week' | 'custom'
  color: string
  order: number
  createdAt: Date
  isDefault: boolean
  isArchived?: boolean
  archivedAt?: Date
}

export interface TaskBucket {
  taskId: string
  bucketId: string
  assignedAt: Date
  movedFrom?: string
}

export interface BucketStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
}

export const DEFAULT_BUCKETS: Omit<Bucket, 'id' | 'createdAt'>[] = [
  {
    name: 'Heute',
    type: 'today',
    color: '#ef4444', // red-500
    order: 0,
    isDefault: true
  },
  {
    name: 'Morgen',
    type: 'tomorrow',
    color: '#f59e0b', // amber-500
    order: 1,
    isDefault: true
  },
  {
    name: 'Diese Woche',
    type: 'this-week',
    color: '#3b82f6', // blue-500
    order: 2,
    isDefault: true
  }
]

export const BUCKET_COLORS = [
  '#ef4444', // red-500
  '#f59e0b', // amber-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
]
