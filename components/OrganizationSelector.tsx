'use client'

interface SimpleOrg {
  id: string
  name: string
  type: 'company' | 'personal'
}

interface OrganizationSelectorProps {
  organizations: SimpleOrg[]
  currentOrg: SimpleOrg | null
  onSelectOrg: (org: SimpleOrg) => void
  onCreateOrg: () => void
}

export default function OrganizationSelector({
  organizations,
  currentOrg,
  onSelectOrg,
  onCreateOrg
}: OrganizationSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Organisationen & Teams
      </h2>
      
      {organizations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Organisationen
          </h3>
          <p className="text-gray-600 mb-4">
            Erstellen Sie eine Organisation oder ein Team
          </p>
          <button
            onClick={onCreateOrg}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Organisation erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                currentOrg?.id === org.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelectOrg(org)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">
                    {org.type === 'company' ? '🏢' : '👥'}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{org.name}</h4>
                  <p className="text-sm text-gray-500">
                    {org.type === 'company' ? 'Firma' : 'Team'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={onCreateOrg}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600 hover:text-gray-700"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">+</div>
              <div className="text-sm">Neue Organisation</div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
