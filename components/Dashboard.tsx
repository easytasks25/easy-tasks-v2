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
}

export function Dashboard({ tasks, user }: DashboardProps) {
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

  // Mock-Daten für Team-Mitglieder (später aus API)
  useEffect(() => {
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'Max Mustermann',
        role: 'Geschäftsführer',
        tasks: {
          total: 4,
          pending: 3,
          overdue: 1
        }
      },
      {
        id: '2',
        name: 'Anna Schmidt',
        role: 'Projektleiterin',
        tasks: {
          total: 5,
          pending: 4,
          overdue: 1
        }
      },
      {
        id: '3',
        name: 'Thomas Weber',
        role: 'Bauleiter',
        tasks: {
          total: 6,
          pending: 5,
          overdue: 1
        }
      },
      {
        id: '4',
        name: 'Maria Müller',
        role: 'Sachbearbeiterin',
        tasks: {
          total: 2,
          pending: 2,
          overdue: 0
        }
      },
      {
        id: '5',
        name: 'Peter Klein',
        role: 'Bauleiter',
        tasks: {
          total: 5,
          pending: 4,
          overdue: 1
        }
      }
    ]
    setTeamMembers(mockTeamMembers)
  }, [])

  // Berechne Gesamtstatistiken
  const totalStats = teamMembers.reduce((acc, member) => ({
    total: acc.total + member.tasks.total,
    pending: acc.pending + member.tasks.pending,
    overdue: acc.overdue + member.tasks.overdue
  }), { total: 0, pending: 0, overdue: 0 })

  // Filtere Aufgaben basierend auf ausgewähltem Zeitraum (nur aktive Aufgaben)
  const getFilteredTasks = () => {
    // Filtere zuerst abgeschlossene Aufgaben heraus
    const activeTasks = tasks.filter(task => 
      task.status !== 'completed' && task.status !== 'cancelled'
    )
    
    const now = new Date()
    switch (selectedPeriod) {
      case 'week':
        const weekStart = startOfWeek(now, { weekStartsOn: 1, locale: de })
        const weekEnd = endOfWeek(now, { weekStartsOn: 1, locale: de })
        return activeTasks.filter(task => {
          const taskDate = new Date(task.dueDate)
          return isWithinInterval(taskDate, { start: weekStart, end: weekEnd })
        })
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return activeTasks.filter(task => {
          const taskDate = new Date(task.dueDate)
          return isWithinInterval(taskDate, { start: monthStart, end: monthEnd })
        })
      default:
        return activeTasks
    }
  }

  const filteredTasks = getFilteredTasks()

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team-Mitglieder</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teamMembers.length}</p>
            </div>
          </div>
        </div>


        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
              {teamMembers.map((member) => {
                
                return (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aktuelle Aufgaben (gefiltert) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aktuelle Aufgaben</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedPeriod === 'week' ? 'Diese Woche' : selectedPeriod === 'month' ? 'Dieser Monat' : 'Alle Aufgaben'}
          </p>
        </div>
        
        <div className="p-6">
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-3 ${
                      task.status === 'in-progress' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: de })}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' :
                    task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                    'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                  }`}>
                    {task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </span>
                </div>
              ))}
              {filteredTasks.length > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  ... und {filteredTasks.length - 5} weitere Aufgaben
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Keine Aufgaben für den ausgewählten Zeitraum</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
