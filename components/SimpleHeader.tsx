'use client'

import { signOut } from 'next-auth/react'

interface SimpleHeaderProps {
  userName?: string
}

export default function SimpleHeader({ userName }: SimpleHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ET</span>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">easy tasks</h1>
              <p className="text-xs text-gray-500">Multi-Tenant Demo</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {userName}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
