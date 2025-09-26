// Simple session management for Prisma-based auth
export interface SessionUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export function setSession(user: SessionUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('easy-tasks-user', JSON.stringify(user))
  }
}

export function getSession(): SessionUser | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('easy-tasks-user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
  }
  return null
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('easy-tasks-user')
  }
}
