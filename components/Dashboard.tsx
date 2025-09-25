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
    completed: number
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
          total: 12,
          completed: 8,
          pending: 3,
          overdue: 1
        }
      },
      {
        id: '2',
        name: 'Anna Schmidt',
        role: 'Projektleiterin',
        tasks: {
          total: 15,
          completed: 10,
          pending: 4,
          overdue: 1
        }
      },
      {
        id: '3',
        name: 'Thomas Weber',
        role: 'Bauleiter',
        tasks: {
          total: 18,
          completed: 12,
          pending: 5,
          overdue: 1
        }
      },
      {
        id: '4',
        name: 'Maria Müller',
        role: 'Sachbearbeiterin',
        tasks: {
          total: 8,
          completed: 6,
          pending: 2,
          overdue: 0
        }
      },
      {
        id: '5',
        name: 'Peter Klein',
        role: 'Bauleiter',
        tasks: {
          total: 14,
          completed: 9,
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
    completed: acc.completed + member.tasks.completed,
    pending: acc.pending + member.tasks.pending,
    overdue: acc.overdue + member.tasks.overdue
  }), { total: 0, completed: 0, pending: 0, overdue: 0 })

  // Berechne Fertigstellungsrate
  const completionRate = totalStats.total > 0 ? Math.round((totalStats.completed / totalStats.total) * 100) : 0

  // Filtere Aufgaben basierend auf ausgewähltem Zeitraum
  const getFilteredTasks = () => {
    const now = new Date()
    switch (selectedPeriod) {
      case 'week':
        const weekStart = startOfWeek(now, { weekStartsOn: 1, locale: de })
        const weekEnd = endOfWeek(now, { weekStartsOn: 1, locale: de })
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate)
          return isWithinInterval(taskDate, { start: weekStart, end: weekEnd })
        })
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return tasks.filter(task => {
          const taskDate = new Date(task.dueDate)
          return isWithinInterval(taskDate, { start: monthStart, end: monthEnd })
        })
      default:
        return tasks
    }
  }

  const filteredTasks = getFilteredTasks()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Überblick über Ihr Team und die Aufgabenverteilung</p>
        </div>
        
        {/* Zeitraum-Filter */}
        <div className="flex space-x-2">
          {(['week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedPeriod === period
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {period === 'week' ? 'Diese Woche' : period === 'month' ? 'Dieser Monat' : 'Alle'}
            </button>
          ))}
        </div>
      </div>

      {/* Gesamtstatistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team-Mitglieder</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Erledigte Aufgaben</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Offene Aufgaben</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Überfällige Aufgaben</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fortschrittsbalken */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Team-Fortschritt</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Fertigstellungsrate</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Team-Übersicht */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Team-Übersicht</h3>
          <p className="text-sm text-gray-600">Aufgabenverteilung nach Team-Mitgliedern</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team-Mitglied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gesamt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erledigt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Überfällig
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fortschritt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member) => {
                const memberCompletionRate = member.tasks.total > 0 
                  ? Math.round((member.tasks.completed / member.tasks.total) * 100) 
                  : 0
                
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.tasks.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {member.tasks.completed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                      {member.tasks.pending}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {member.tasks.overdue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${memberCompletionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{memberCompletionRate}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aktuelle Aufgaben (gefiltert) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Aktuelle Aufgaben</h3>
          <p className="text-sm text-gray-600">
            {selectedPeriod === 'week' ? 'Diese Woche' : selectedPeriod === 'month' ? 'Dieser Monat' : 'Alle Aufgaben'}
          </p>
        </div>
        
        <div className="p-6">
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-3 ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'in-progress' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: de })}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </span>
                </div>
              ))}
              {filteredTasks.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  ... und {filteredTasks.length - 5} weitere Aufgaben
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Keine Aufgaben für den ausgewählten Zeitraum</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
