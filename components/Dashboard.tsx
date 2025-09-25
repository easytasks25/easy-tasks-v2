'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types/task'
import { 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { Filter } from 'lucide-react'
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { de } from 'date-fns/locale'
import { canViewDashboard, UserRole } from '@/types/permissions'

interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  tasks: {
    total: number
    pending: number
    overdue: number
  }
}

interface DashboardProps {
  tasks: Task[]
  user?: {
    name?: string | null
    email?: string | null
    role?: string
  }
  onViewChange?: (view: string) => void
}

export function Dashboard({ tasks, user, onViewChange }: DashboardProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week')

  // Prüfe Berechtigungen (später aus echten Benutzerdaten)
  const userRole = (user?.role as UserRole) || 'manager' // Demo: Standard-Rolle
  const hasDashboardAccess = canViewDashboard(userRole)

  // Zeige Zugriff verweigert, wenn keine Berechtigung
  if (!hasDashboardAccess) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Zugriff verweigert</h2>
        <p className="text-gray-600">
          Sie haben keine Berechtigung, das Dashboard anzuzeigen.
        </p>
      </div>
    )
  }

  // Team-Mitglieder aus echten Daten berechnen
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setTeamMembers([])
      return
    }

    // Gruppiere Aufgaben nach zugewiesenen Personen
    const memberTasks = tasks.reduce((acc, task) => {
      const assignee = task.assignedTo || 'Nicht zugewiesen'
      if (!acc[assignee]) {
        acc[assignee] = {
          total: 0,
          pending: 0,
          overdue: 0
        }
      }
      
      acc[assignee].total++
      
      if (task.status === 'pending' || task.status === 'in-progress') {
        acc[assignee].pending++
        
        // Prüfe auf überfällige Aufgaben
        if (task.dueDate && new Date(task.dueDate) < new Date()) {
          acc[assignee].overdue++
        }
      }
      
      return acc
    }, {} as Record<string, { total: number; pending: number; overdue: number }>)

    // Konvertiere zu TeamMember-Array
    const members: TeamMember[] = Object.entries(memberTasks).map(([name, taskStats], index) => ({
      id: `member-${index}`,
      name,
      role: 'Mitglied', // Standard-Rolle, später aus der Datenbank
      tasks: taskStats
    }))

    setTeamMembers(members)
  }, [tasks])

  // Berechne Gesamtstatistiken
  const totalStats = teamMembers.reduce((acc, member) => ({
    total: acc.total + member.tasks.total,
    pending: acc.pending + member.tasks.pending,
    overdue: acc.overdue + member.tasks.overdue
  }), { total: 0, pending: 0, overdue: 0 })


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Überblick über Ihr Team und die Aufgabenverteilung</p>
        </div>
        
        {/* Zeitraum-Filter */}
        <div className="flex space-x-2">
          {(['week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {period === 'week' ? 'Diese Woche' : period === 'month' ? 'Dieser Monat' : 'Alle'}
            </button>
          ))}
        </div>
      </div>

      {/* Gesamtstatistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => onViewChange?.('filtered-tasks:status:pending:Offene Aufgaben')}
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Offene Aufgaben</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStats.pending}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => onViewChange?.('filtered-tasks:status:overdue:Überfällige Aufgaben')}
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Überfällige Aufgaben</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStats.overdue}</p>
            </div>
          </div>
        </div>
      </div>


      {/* Team-Übersicht */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Team-Übersicht</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Aufgabenverteilung nach Team-Mitgliedern</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Team-Mitglied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Gesamt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Offen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Überfällig
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <UserGroupIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Noch keine Mitglieder
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Laden Sie neue Mitglieder ein, um zusammenzuarbeiten.
                    </p>
                    <button
                      onClick={() => window.location.href = '/organizations/settings'}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      Mitglieder verwalten
                    </button>
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr 
                    key={member.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => onViewChange?.(`filtered-tasks:member:${member.id}:${member.name}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {member.tasks.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400">
                      {member.tasks.pending}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                      {member.tasks.overdue}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hinweis für gefilterte Ansicht */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Filter className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">Interaktive Filterung</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Klicken Sie auf die Statistik-Karten oder Team-Mitglieder, um gefilterte Aufgaben in einer detaillierten Ansicht zu sehen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
