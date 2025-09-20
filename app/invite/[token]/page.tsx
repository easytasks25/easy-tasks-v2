'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import QRCode from 'qrcode'

const acceptInvitationSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
})

type AcceptInvitationForm = z.infer<typeof acceptInvitationSchema>

interface InvitationData {
  email: string
  role: string
  organization: {
    id: string
    name: string
    type: string
  }
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationForm>({
    resolver: zodResolver(acceptInvitationSchema),
  })

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invite/${params.token}`)
        const data = await response.json()

        if (response.ok) {
          setInvitationData(data.invitation)
          
          // Generate QR Code
          const invitationUrl = `${window.location.origin}/invite/${params.token}`
          const qrCode = await QRCode.toDataURL(invitationUrl)
          setQrCodeUrl(qrCode)
        } else {
          setError(data.error || 'Einladung nicht gefunden')
        }
      } catch (error) {
        setError('Fehler beim Laden der Einladung')
      }
    }

    fetchInvitation()
  }, [params.token])

  const onSubmit = async (data: AcceptInvitationForm) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/invite/${params.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          password: data.password,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Fehler beim Akzeptieren der Einladung')
      }
    } catch (error) {
      setError('Ein Fehler ist aufgetreten')
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
              Einladung akzeptiert!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sie werden zur Anmeldeseite weitergeleitet...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Einladung wird geladen...</p>
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Team-Einladung
          </h2>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Sie wurden eingeladen, dem Team beizutreten:
            </p>
            <p className="mt-2 text-lg font-medium text-gray-900">
              {invitationData.organization.name}
            </p>
            <p className="text-sm text-gray-500">
              {invitationData.email} • {invitationData.role}
            </p>
          </div>
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
              {isLoading ? 'Wird verarbeitet...' : 'Team beitreten'}
            </button>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Oder QR-Code scannen:</p>
              <div className="inline-block p-4 bg-white rounded-lg shadow">
                <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
