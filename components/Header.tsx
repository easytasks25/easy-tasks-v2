'use client'

import { useState } from 'react'
import { 
  CalendarDaysIcon, 
  ListBulletIcon, 
  DocumentTextIcon,
  WifiIcon,
  PlusIcon,
  BellIcon,
  CogIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline'
import { TaskStats, Task } from '@/types/task'
import { format, addDays } from 'date-fns'
import { de } from 'date-fns/locale'
import type { View } from '@/lib/view'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  view: View
  onViewChange: (view: View) => void
  selectedDate: Date
  onDateChange: (date: Date) => void
  onLogout: () => void
  user?: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export function Header({ view, onViewChange, selectedDate, onDateChange, onLogout, user }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navigation = [
    { name: 'Aufgaben', view: 'buckets' as const, icon: Squares2X2Icon },
    { name: 'Dashboard', view: 'dashboard' as const, icon: ChartBarIcon },
    { name: 'Kalender', view: 'calendar' as const, icon: CalendarDaysIcon },
    { name: 'Notizen', view: 'notes' as const, icon: DocumentTextIcon },
    { name: 'Archiv', view: 'archive' as const, icon: ArchiveBoxIcon },
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Hier würde die Suchlogik implementiert werden
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo und Titel */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ET</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">easy-tasks</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Aufgabenverwaltung</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => onViewChange(item.view)}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === item.view
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </button>
              )
            })}
          </nav>

          {/* Suchleiste */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Aufgaben suchen..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Benutzer-Menü */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.name || user?.email?.split('@')[0] || 'Benutzer'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'User'}
                </p>
              </div>
            </button>

            {/* Dropdown-Menü */}
            {showUserMenu && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-medium">{user?.name || user?.email?.split('@')[0] || 'Benutzer'}</p>
                    <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  
                  <a
                    href="/organizations/settings"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <CogIcon className="h-4 w-4 mr-3" />
                    Organisationseinstellungen
                  </a>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      onLogout()
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    Abmelden
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {/* Theme Toggle für Mobile */}
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => onViewChange(item.view)}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                    view === item.view
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}