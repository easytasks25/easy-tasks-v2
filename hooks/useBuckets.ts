import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { Bucket, TaskBucket, DEFAULT_BUCKETS, BUCKET_COLORS } from '@/types/bucket'
import { Task } from '@/types/task'
import { addDays, startOfWeek, endOfWeek, isWithinInterval, isToday, isTomorrow } from 'date-fns'
import { de } from 'date-fns/locale'

export function useBuckets() {
  const [buckets, setBuckets] = useLocalStorage<Bucket[]>('lwtasks-buckets', [])
  const [taskBuckets, setTaskBuckets] = useLocalStorage<TaskBucket[]>('lwtasks-task-buckets', [])

  // Initialize default buckets if none exist
  useEffect(() => {
    if (buckets.length === 0) {
      const defaultBuckets: Bucket[] = DEFAULT_BUCKETS.map((bucket, index) => ({
        ...bucket,
        id: `bucket-${index}`,
        createdAt: new Date()
      }))
      setBuckets(defaultBuckets)
    }
  }, [buckets.length, setBuckets])

  // Get tasks for a specific bucket (only active tasks)
  const getTasksForBucket = (bucketId: string, allTasks: Task[]): Task[] => {
    const bucket = buckets.find(b => b.id === bucketId)
    if (!bucket) return []

    // Filter out completed and cancelled tasks
    const activeTasks = allTasks.filter(task => 
      task.status !== 'completed' && task.status !== 'cancelled'
    )

    const taskBucketIds = taskBuckets
      .filter(tb => tb.bucketId === bucketId)
      .map(tb => tb.taskId)

    let bucketTasks = activeTasks.filter(task => taskBucketIds.includes(task.id))

    // For default buckets, also include tasks based on due date
    if (bucket.isDefault) {
      const today = new Date()
      const tomorrow = addDays(today, 1)
      const weekStart = startOfWeek(today, { weekStartsOn: 1, locale: de })
      const weekEnd = endOfWeek(today, { weekStartsOn: 1, locale: de })

      let dateFilteredTasks: Task[] = []
      
      switch (bucket.type) {
        case 'today':
          dateFilteredTasks = activeTasks.filter(task => {
            const taskDate = new Date(task.dueDate)
            return isToday(taskDate) || taskBucketIds.includes(task.id)
          })
          break
        case 'tomorrow':
          dateFilteredTasks = activeTasks.filter(task => {
            const taskDate = new Date(task.dueDate)
            return isTomorrow(taskDate) || taskBucketIds.includes(task.id)
          })
          break
        case 'this-week':
          dateFilteredTasks = activeTasks.filter(task => {
            const taskDate = new Date(task.dueDate)
            return isWithinInterval(taskDate, { start: weekStart, end: weekEnd }) || taskBucketIds.includes(task.id)
          })
          break
      }

      // Merge with manually assigned tasks
      bucketTasks = [...dateFilteredTasks]
    }

    return bucketTasks
  }

  // Get archived tasks (completed and cancelled)
  const getArchivedTasks = (allTasks: Task[]): Task[] => {
    return allTasks.filter(task => 
      task.status === 'completed' || task.status === 'cancelled'
    )
  }

  // Move task to bucket
  const moveTaskToBucket = (taskId: string, bucketId: string) => {
    const existingAssignment = taskBuckets.find(tb => tb.taskId === taskId)
    
    if (existingAssignment) {
      // Update existing assignment
      setTaskBuckets(prev => prev.map(tb => 
        tb.taskId === taskId 
          ? { ...tb, bucketId, movedFrom: tb.bucketId, assignedAt: new Date() }
          : tb
      ))
    } else {
      // Create new assignment
      setTaskBuckets(prev => [...prev, {
        taskId,
        bucketId,
        assignedAt: new Date()
      }])
    }
  }

  // Remove task from bucket
  const removeTaskFromBucket = (taskId: string) => {
    setTaskBuckets(prev => prev.filter(tb => tb.taskId !== taskId))
  }

  // Create new bucket
  const createBucket = (name: string, color?: string) => {
    const newBucket: Bucket = {
      id: `bucket-${Date.now()}`,
      name,
      type: 'custom',
      color: color || BUCKET_COLORS[buckets.length % BUCKET_COLORS.length],
      order: buckets.length,
      createdAt: new Date(),
      isDefault: false
    }
    setBuckets(prev => [...prev, newBucket])
    return newBucket
  }

  // Update bucket
  const updateBucket = (bucketId: string, updates: Partial<Bucket>) => {
    setBuckets(prev => prev.map(bucket => 
      bucket.id === bucketId 
        ? { ...bucket, ...updates }
        : bucket
    ))
  }

  // Archive bucket (instead of deleting)
  const archiveBucket = (bucketId: string) => {
    // Don't allow archiving default buckets
    const bucket = buckets.find(b => b.id === bucketId)
    if (bucket?.isDefault) return

    // Mark bucket as archived
    setBuckets(prev => prev.map(b => 
      b.id === bucketId 
        ? { ...b, isArchived: true, archivedAt: new Date() }
        : b
    ))
  }

  // Restore archived bucket
  const restoreBucket = (bucketId: string) => {
    setBuckets(prev => prev.map(b => 
      b.id === bucketId 
        ? { ...b, isArchived: false, archivedAt: undefined }
        : b
    ))
  }

  // Permanently delete bucket (only for archived buckets)
  const permanentlyDeleteBucket = (bucketId: string) => {
    const bucket = buckets.find(b => b.id === bucketId)
    if (!bucket?.isArchived) return

    // Remove all task assignments for this bucket
    setTaskBuckets(prev => prev.filter(tb => tb.bucketId !== bucketId))
    setBuckets(prev => prev.filter(b => b.id !== bucketId))
  }

  // Move task to "Heute" bucket (for overdue tasks)
  const moveOverdueToToday = (tasks: Task[]) => {
    const today = new Date()
    const todayBucket = buckets.find(b => b.type === 'today')
    
    if (!todayBucket) return

    const overdueTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate)
      return taskDate < today && task.status !== 'completed'
    })

    overdueTasks.forEach(task => {
      moveTaskToBucket(task.id, todayBucket.id)
    })
  }

  // Move incomplete tasks from "Heute" to "Heute" for next day
  const moveIncompleteTodayTasks = (tasks: Task[]) => {
    const today = new Date()
    const todayBucket = buckets.find(b => b.type === 'today')
    
    if (!todayBucket) return

    // Get tasks that were in "Heute" bucket yesterday but not completed
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const incompleteTodayTasks = tasks.filter(task => {
      const taskBucket = taskBuckets.find(tb => tb.taskId === task.id && tb.bucketId === todayBucket.id)
      return taskBucket && task.status !== 'completed'
    })

    // Keep them in "Heute" bucket for the new day
    incompleteTodayTasks.forEach(task => {
      moveTaskToBucket(task.id, todayBucket.id)
    })
  }

  // Get bucket statistics
  const getBucketStats = (bucketId: string, allTasks: Task[]) => {
    const bucketTasks = getTasksForBucket(bucketId, allTasks)
    
    return {
      totalTasks: bucketTasks.length,
      completedTasks: bucketTasks.filter(t => t.status === 'completed').length,
      pendingTasks: bucketTasks.filter(t => t.status !== 'completed').length,
      overdueTasks: bucketTasks.filter(t => {
        const taskDate = new Date(t.dueDate)
        return taskDate < new Date() && t.status !== 'completed'
      }).length
    }
  }

  // Reorder buckets
  const reorderBuckets = (bucketIds: string[]) => {
    setBuckets(prev => {
      const reorderedBuckets = bucketIds.map((id, index) => {
        const bucket = prev.find(b => b.id === id)
        return bucket ? { ...bucket, order: index } : null
      }).filter(Boolean) as Bucket[]
      
      return reorderedBuckets
    })
  }

  // Get active (non-archived) buckets
  const getActiveBuckets = () => {
    return buckets.filter(bucket => !bucket.isArchived)
  }

  // Get archived buckets
  const getArchivedBuckets = () => {
    return buckets.filter(bucket => bucket.isArchived)
  }

  return {
    buckets,
    taskBuckets,
    getTasksForBucket,
    getArchivedTasks,
    moveTaskToBucket,
    removeTaskFromBucket,
    createBucket,
    updateBucket,
    archiveBucket,
    restoreBucket,
    permanentlyDeleteBucket,
    getActiveBuckets,
    getArchivedBuckets,
    moveOverdueToToday,
    moveIncompleteTodayTasks,
    getBucketStats,
    reorderBuckets
  }
}
