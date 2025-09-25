'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MemberInvite } from '@/components/MemberInvite'
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CogIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

interface OrganizationMember {
  id: string
  role: string
  user: User
  joined_at: string
}

interface Organization {
  id: string
  name: string
  description?: string
  type: string
  domain?: string
  created_at: string
  userRole: string
}

export default function OrganizationSettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadOrganizationData()
  }, [])

  const loadOrganizationData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/signin')
        return
      }

      // Organisation laden
      const { data: memberships, error: orgError } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations (
            id,
            name,
            description,
            type,
            domain,
            created_at
          )
        ` as any)
        .eq('user_id', user.id)

      if (orgError) {
        console.error('Error loading organization:', orgError)
        setError('Fehler beim Laden der Organisation')
        return
      }

      if (!memberships || memberships.length === 0) {
        router.push('/organizations/create')
        return
      }

      const orgData = (memberships[0] as any).organizations
      setOrganization({
        ...orgData,
        userRole: (memberships[0] as any).role
      })

      // Mitglieder laden
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          joined_at,
          user:user_id (
            id,
            email,
            raw_user_meta_data
          )
        ` as any)
        .eq('organization_id', orgData.id)

      if (membersError) {
        console.error('Error loading members:', membersError)
        setError('Fehler beim Laden der Mitglieder')
        return
      }

      const transformedMembers: OrganizationMember[] = membersData?.map((member: any) => ({
        id: member.id,
        role: member.role,
        user: {
          id: member.user.id,
          email: member.user.email,
          name: member.user.raw_user_meta_data?.name || member.user.email.split('@')[0],
          avatar_url: member.user.raw_user_meta_data?.avatar_url
        },
        joined_at: member.joined_at
      })) || []

      setMembers(transformedMembers)
    } catch (error) {
      console.error('Error loading organization data:', error)
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!organization) return

    if (!confirm('Sind Sie sicher, dass Sie dieses Mitglied entfernen möchten?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)

      if (error) {
        console.error('Error removing member:', error)
        setError('Fehler beim Entfernen des Mitglieds')
        return
      }

      // Mitglieder neu laden
      await loadOrganizationData()
    } catch (error) {
      console.error('Error removing member:', error)
      setError('Ein Fehler ist aufgetreten')
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'owner': return 'Eigentümer'
      case 'admin': return 'Administrator'
      case 'manager': return 'Manager'
      case 'member': return 'Mitglied'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'member': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Organisation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Keine Organisation gefunden.</p>
          <button
            onClick={() => router.push('/organizations/create')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Organisation erstellen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Organisationseinstellungen
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verwalten Sie Ihre Organisation und Mitglieder
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Zurück zum Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organisation Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Organisation
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {organization.name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Typ
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {organization.type === 'COMPANY' ? 'Firma' : 'Team'}
                  </p>
                </div>

                {organization.domain && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Domain
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {organization.domain}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Erstellt am
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(organization.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mitglieder */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserGroupIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Mitglieder
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {members.length} {members.length === 1 ? 'Mitglied' : 'Mitglieder'}
                      </p>
                    </div>
                  </div>
                  
                  {(organization.userRole === 'owner' || organization.userRole === 'admin') && (
                    <MemberInvite 
                      organizationId={organization.id}
                      onInviteSent={loadOrganizationData}
                    />
                  )}
                </div>
              </div>

              <div className="p-6">
                {members.length === 0 ? (
                  <div className="text-center py-8">
                    <UserGroupIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Keine Mitglieder
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Laden Sie neue Mitglieder ein, um zusammenzuarbeiten.
                    </p>
                    {(organization.userRole === 'owner' || organization.userRole === 'admin') && (
                      <MemberInvite 
                        organizationId={organization.id}
                        onInviteSent={loadOrganizationData}
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {member.user.name?.split(' ').map(n => n[0]).join('') || member.user.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {member.user.name || member.user.email}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {member.user.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Beigetreten: {new Date(member.joined_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {getRoleDisplayName(member.role)}
                          </span>
                          
                          {(organization.userRole === 'owner' || organization.userRole === 'admin') && 
                           member.role !== 'owner' && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Mitglied entfernen"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
