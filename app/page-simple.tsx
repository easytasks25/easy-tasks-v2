'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SimpleHome() {
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoClick = () => {
    setIsLoading(true)
    // Kurze Verzögerung für bessere UX
    setTimeout(() => {
      window.location.href = '/demo'
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            easy-tasks
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digitale Aufgabenverwaltung für Bauleiter
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Demo-Version
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Testen Sie die App ohne Anmeldung. Alle Daten werden lokal im Browser gespeichert.
            </p>
            <button
              onClick={handleDemoClick}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Wird geladen...
                </div>
              ) : (
                'Demo starten'
              )}
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Vollversion
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Melden Sie sich an, um alle Funktionen zu nutzen und Daten zu synchronisieren.
            </p>
            <div className="space-y-2">
              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Anmelden
              </Link>
              <Link
                href="/auth/signup"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Registrieren
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Version 1.0.0 - Lokale Speicherung aktiviert
          </p>
        </div>
      </div>
    </div>
  )
}