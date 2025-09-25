'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  type: z.enum(['COMPANY', 'PERSONAL']),
  domain: z.string().optional(),
})

type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>

export default function CreateOrganizationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateOrganizationForm>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      type: 'COMPANY'
    }
  })

  const selectedType = watch('type')

  const onSubmit = async (data: CreateOrganizationForm) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/organizations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const json = await response.json()
      
      if (!response.ok || !json.ok) {
        const msg = 
          json?.error === 'unique_violation' ? 'Name bereits vergeben.'
        : json?.error === 'missing_organization_name' ? 'Bitte Organisations-Namen eingeben.'
        : json?.error === 'invalid_org_type' ? 'Ungültiger Organisationstyp.'
        : json?.error === 'unauthorized' ? 'Bitte zuerst anmelden.'
        : json?.error === 'db_unreachable' ? 'Datenbank nicht erreichbar.'
        : json?.error === 'server_error' ? `Serverfehler: ${json.detail || 'Unbekannter Fehler'}`
        : 'Serverfehler beim Anlegen der Organisation.'
        setError(msg)
        return
      }
      
      // Erfolg → weiterleiten
      router.push('/dashboard')
    } catch (error) {
      console.error('Organization creation error:', error)
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Organisation erstellen
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Erstellen Sie eine neue Organisation oder ein Team
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Organisation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Art der Organisation
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex cursor-pointer rounded-lg p-4 focus:outline-none ${
                  selectedType === 'COMPANY' 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'ring-1 ring-gray-300 bg-white'
                }`}>
                  <input
                    {...register('type')}
                    type="radio"
                    value="COMPANY"
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Firma</p>
                      <p className="text-xs text-gray-500">Geschäftliche Nutzung</p>
                    </div>
                  </div>
                </label>

                <label className={`relative flex cursor-pointer rounded-lg p-4 focus:outline-none ${
                  selectedType === 'PERSONAL' 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'ring-1 ring-gray-300 bg-white'
                }`}>
                  <input
                    {...register('type')}
                    type="radio"
                    value="PERSONAL"
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <UserGroupIcon className="h-6 w-6 text-gray-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Team</p>
                      <p className="text-xs text-gray-500">Private Nutzung</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Organisation Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {selectedType === 'COMPANY' ? 'Firmenname' : 'Team-Name'}
              </label>
              <input
                {...register('name')}
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={selectedType === 'COMPANY' ? 'z.B. Bauunternehmen Müller GmbH' : 'z.B. Mein Bauprojekt'}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Domain (optional) */}
            {selectedType === 'COMPANY' && (
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                  Domain (optional)
                </label>
                <input
                  {...register('domain')}
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="z.B. mueller-bau.de"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Für automatische Benutzer-Einladungen
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Wird erstellt...' : 'Organisation erstellen'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Bereits eine Organisation?{' '}
              <button
                type="button"
                onClick={() => router.push('/auth/signin')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Hier anmelden
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
