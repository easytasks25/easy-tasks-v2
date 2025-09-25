// Typen für die Rechteverwaltung

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer'

export type Permission = 
  | 'view_dashboard'
  | 'view_all_tasks'
  | 'view_team_tasks'
  | 'view_own_tasks'
  | 'create_tasks'
  | 'edit_tasks'
  | 'delete_tasks'
  | 'assign_tasks'
  | 'view_reports'
  | 'manage_users'
  | 'manage_organizations'
  | 'manage_projects'

export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
  description: string
}

// Standard-Rollen mit ihren Berechtigungen
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'owner',
    permissions: [
      'view_dashboard',
      'view_all_tasks',
      'view_team_tasks',
      'view_own_tasks',
      'create_tasks',
      'edit_tasks',
      'delete_tasks',
      'assign_tasks',
      'view_reports',
      'manage_users',
      'manage_organizations',
      'manage_projects'
    ],
    description: 'Vollzugriff auf alle Funktionen'
  },
  {
    role: 'admin',
    permissions: [
      'view_dashboard',
      'view_all_tasks',
      'view_team_tasks',
      'view_own_tasks',
      'create_tasks',
      'edit_tasks',
      'delete_tasks',
      'assign_tasks',
      'view_reports',
      'manage_users',
      'manage_projects'
    ],
    description: 'Administrator mit Benutzerverwaltung'
  },
  {
    role: 'manager',
    permissions: [
      'view_dashboard',
      'view_team_tasks',
      'view_own_tasks',
      'create_tasks',
      'edit_tasks',
      'assign_tasks',
      'view_reports'
    ],
    description: 'Manager mit Team-Übersicht'
  },
  {
    role: 'member',
    permissions: [
      'view_own_tasks',
      'create_tasks',
      'edit_tasks'
    ],
    description: 'Standard-Mitglied'
  },
  {
    role: 'viewer',
    permissions: [
      'view_own_tasks'
    ],
    description: 'Nur Lesezugriff'
  }
]

// Hilfsfunktionen für Berechtigungen
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === userRole)
  return rolePermissions?.permissions.includes(permission) ?? false
}

export function canViewDashboard(userRole: UserRole): boolean {
  return hasPermission(userRole, 'view_dashboard')
}

export function canViewAllTasks(userRole: UserRole): boolean {
  return hasPermission(userRole, 'view_all_tasks')
}

export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, 'manage_users')
}

export function getRoleDescription(userRole: UserRole): string {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === userRole)
  return rolePermissions?.description ?? 'Unbekannte Rolle'
}
