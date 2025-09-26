'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
  confirmPassword: z.string(),
  organizationName: z.string().min(2, 'Organisationsname ist erforderlich'),
  organizationType: z.enum(['COMPANY', 'PERSONAL']).default('COMPANY'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      // 1. Benutzer bei Supabase registrieren
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Registrierung fehlgeschlagen')
      }

      // 2. Organisation erstellen
      const orgResult = await (supabase
        .from('organizations')
        .insert({
          name: data.organizationName,
          type: data.organizationType === 'COMPANY' ? 'company' : 'team',
          createdById: authData.user.id,
        } as any)
        .select()
        .single() as any)

      if (orgResult.error) {
        console.error('Organization creation error:', orgResult.error)
        throw new Error(`Fehler beim Erstellen der Organisation: ${orgResult.error.message}`)
      }

      if (!orgResult.data) {
        throw new Error('Organisation konnte nicht erstellt werden')
      }

      const organization = orgResult.data

      // 3. Benutzer als Owner zur Organisation hinzufügen
      const { error: memberError } = await (supabase
        .from('organization_members')
        .insert({
          user_id: authData.user.id,
          organization_id: organization.id,
          role: 'owner',
        } as any) as any)

      if (memberError) {
        console.error('Error adding user to organization:', memberError)
        throw new Error(`Fehler beim Hinzufügen zur Organisation: ${memberError.message}`)
      }

      setSuccess(true)
      
      // 3. Weiterleitung zur App
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Registration error:', error)
      
      // Detaillierte Fehlerbehandlung
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Ungültige Anmeldedaten')
        } else if (error.message.includes('User already registered')) {
          setError('Benutzer ist bereits registriert')
        } else if (error.message.includes('Password should be at least')) {
          setError('Passwort muss mindestens 6 Zeichen haben')
        } else if (error.message.includes('Invalid email')) {
          setError('Ungültige E-Mail-Adresse')
        } else if (error.message.includes('Database connection')) {
          setError('Datenbankverbindung fehlgeschlagen. Bitte versuchen Sie es später erneut.')
        } else {
          setError(`Registrierung fehlgeschlagen: ${error.message}`)
        }
      } else {
        setError('Ein unbekannter Fehler ist aufgetreten')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Registrierung erfolgreich!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sie werden automatisch angemeldet...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Bei easy-tasks registrieren
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Erstellen Sie Ihr Konto für die Aufgabenverwaltung
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Vollständiger Name
              </label>
              <input
                {...register('name')}
                type="text"
                autoComplete="name"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Max Mustermann"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-Mail-Adresse
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="max@beispiel.de"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Passwort
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Mindestens 6 Zeichen"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Passwort bestätigen
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Passwort wiederholen"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Organization Fields */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Organisation/Team</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Art der Organisation
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`relative flex cursor-pointer rounded-lg p-3 focus:outline-none ${
                      watch('organizationType') === 'COMPANY' 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'ring-1 ring-gray-300 bg-white'
                    }`}>
                      <input
                        {...register('organizationType')}
                        type="radio"
                        value="COMPANY"
                        className="sr-only"
                      />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Firma</p>
                        <p className="text-xs text-gray-500">Geschäftlich</p>
                      </div>
                    </label>

                    <label className={`relative flex cursor-pointer rounded-lg p-3 focus:outline-none ${
                      watch('organizationType') === 'PERSONAL' 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'ring-1 ring-gray-300 bg-white'
                    }`}>
                      <input
                        {...register('organizationType')}
                        type="radio"
                        value="PERSONAL"
                        className="sr-only"
                      />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Team</p>
                        <p className="text-xs text-gray-500">Privat</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                    {watch('organizationType') === 'COMPANY' ? 'Firmenname' : 'Team-Name'}
                  </label>
                  <input
                    {...register('organizationName')}
                    type="text"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder={watch('organizationType') === 'COMPANY' ? 'z.B. Bauunternehmen Müller GmbH' : 'z.B. Mein Bauprojekt'}
                  />
                  {errors.organizationName && (
                    <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
                  )}
                </div>
              </div>
            </div>
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
              {isLoading ? 'Wird registriert...' : 'Registrieren'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Bereits ein Konto?{' '}
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
