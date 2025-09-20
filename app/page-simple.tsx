'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import SimpleHeader from '@/components/SimpleHeader'
import OrganizationSelector from '@/components/OrganizationSelector'
import TaskSection from '@/components/TaskSection'
import FeaturesOverview from '@/components/FeaturesOverview'
import TaskFormModal from '@/components/TaskFormModal'
import OrganizationFormModal from '@/components/OrganizationFormModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import UnauthenticatedView from '@/components/UnauthenticatedView'

// Einfache Task-Typen
interface SimpleTask {
  id: string
  title: string
  description?: string
  status: 'pending' | 'completed'
  createdAt: Date
}

// Einfache Organisation-Typen
interface SimpleOrg {
  id: string
  name: string
  type: 'company' | 'personal'
}

export default function SimpleHomePage() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<SimpleTask[]>([])
  const [organizations, setOrganizations] = useState<SimpleOrg[]>([])
  const [currentOrg, setCurrentOrg] = useState<SimpleOrg | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showOrgForm, setShowOrgForm] = useState(false)

  // Loading state
  if (status === 'loading') {
    return <LoadingSpinner />
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return <UnauthenticatedView />
  }

  // Event handlers
  const handleSelectOrg = useCallback((org: SimpleOrg) => {
    setCurrentOrg(org)
  }, [])

  const handleCreateOrg = useCallback(() => {
    setShowOrgForm(true)
  }, [])

  const handleOrgSubmit = useCallback((name: string, type: 'company' | 'personal') => {
    const newOrg: SimpleOrg = {
      id: Date.now().toString(),
      name,
      type,
    }
    setOrganizations(prev => [newOrg, ...prev])
    setCurrentOrg(newOrg)
  }, [])

  const handleCreateTask = useCallback(() => {
    setShowTaskForm(true)
  }, [])

  const handleTaskSubmit = useCallback((data: { title: string; description?: string }) => {
    const newTask: SimpleTask = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      status: 'pending',
      createdAt: new Date(),
    }
    setTasks(prev => [newTask, ...prev])
  }, [])

  const handleToggleTask = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    )
  }, [])

  // Authenticated user
  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader userName={session?.user?.name || session?.user?.email || undefined} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <OrganizationSelector
            organizations={organizations}
            currentOrg={currentOrg}
            onSelectOrg={handleSelectOrg}
            onCreateOrg={handleCreateOrg}
          />

          <TaskSection
            tasks={tasks}
            currentOrg={currentOrg}
            onToggleTask={handleToggleTask}
            onCreateTask={handleCreateTask}
          />

          <FeaturesOverview />
        </div>
      </main>

      <TaskFormModal
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleTaskSubmit}
      />

      <OrganizationFormModal
        isOpen={showOrgForm}
        onClose={() => setShowOrgForm(false)}
        onSubmit={handleOrgSubmit}
      />
    </div>
  )
}
