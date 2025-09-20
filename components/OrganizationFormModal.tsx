'use client'

import { toast } from 'react-hot-toast'

interface OrganizationFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, type: 'company' | 'personal') => void
}

export default function OrganizationFormModal({
  isOpen,
  onClose,
  onSubmit
}: OrganizationFormModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const type = formData.get('type') as 'company' | 'personal'
    
    onSubmit(name, type)
    onClose()
    toast.success('Organisation erstellt!')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Organisation erstellen
        </h3>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. Bauunternehmen Müller GmbH"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ
            </label>
            <select
              name="type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="company">Firma</option>
              <option value="personal">Team</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
