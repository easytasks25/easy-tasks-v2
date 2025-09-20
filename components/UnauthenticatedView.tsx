'use client'

export default function UnauthenticatedView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🏗️</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            easy tasks
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Multi-Tenant Aufgabenverwaltung für Bauleiter
          </p>
        </div>
        <div className="space-y-4">
          <a
            href="/auth/signin"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Anmelden
          </a>
          <a
            href="/auth/signup"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Registrieren
          </a>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Demo-Features</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Multi-Tenant-Architektur</li>
            <li>✅ Organisation/Team-Erstellung</li>
            <li>✅ Team-Einladungen per E-Mail</li>
            <li>✅ QR-Code Einladungen</li>
            <li>✅ Daten-Isolation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
