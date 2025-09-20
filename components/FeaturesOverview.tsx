'use client'

export default function FeaturesOverview() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Multi-Tenant Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl mb-2">🏢</div>
          <h3 className="font-medium text-blue-900">Organisationen</h3>
          <p className="text-sm text-blue-700">Jede Firma hat eigene Daten</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl mb-2">👥</div>
          <h3 className="font-medium text-green-900">Team-Einladungen</h3>
          <p className="text-sm text-green-700">E-Mail-Links & QR-Codes</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl mb-2">🔒</div>
          <h3 className="font-medium text-purple-900">Daten-Isolation</h3>
          <p className="text-sm text-purple-700">Keine Vermischung zwischen Firmen</p>
        </div>
      </div>
    </div>
  )
}
