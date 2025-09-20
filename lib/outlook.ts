// Outlook Integration für Kalender-Synchronisation
export interface OutlookEvent {
  id: string
  subject: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  body: {
    content: string
    contentType: 'text' | 'html'
  }
  location?: {
    displayName: string
  }
  attendees?: Array<{
    emailAddress: {
      address: string
      name: string
    }
  }>
  categories?: string[]
  importance?: 'low' | 'normal' | 'high'
  isAllDay?: boolean
}

export interface OutlookConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
}

class OutlookService {
  private config: OutlookConfig
  private accessToken: string | null = null

  constructor(config: OutlookConfig) {
    this.config = config
    this.accessToken = localStorage.getItem('outlook-access-token')
  }

  // OAuth2 Authentication
  async authenticate(): Promise<boolean> {
    try {
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${this.config.clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(this.config.redirectUri)}&` +
        `scope=${encodeURIComponent(this.config.scopes.join(' '))}&` +
        `response_mode=query`

      // Open popup for authentication
      const popup = window.open(authUrl, 'outlook-auth', 'width=500,height=600')
      
      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            resolve(false)
          }
        }, 1000)

        // Listen for auth completion
        window.addEventListener('message', (event) => {
          if (event.origin !== window.location.origin) return
          
          if (event.data.type === 'OUTLOOK_AUTH_SUCCESS') {
            this.accessToken = event.data.accessToken
            localStorage.setItem('outlook-access-token', event.data.accessToken)
            clearInterval(checkClosed)
            popup?.close()
            resolve(true)
          }
        })
      })
    } catch (error) {
      console.error('Outlook authentication failed:', error)
      return false
    }
  }

  // Get events from Outlook calendar
  async getEvents(startDate: Date, endDate: Date): Promise<OutlookEvent[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Outlook')
    }

    try {
      const start = startDate.toISOString()
      const end = endDate.toISOString()
      
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendar/events?` +
        `$filter=start/dateTime ge '${start}' and end/dateTime le '${end}'&` +
        `$orderby=start/dateTime`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Outlook API error: ${response.status}`)
      }

      const data = await response.json()
      return data.value || []
    } catch (error) {
      console.error('Failed to fetch Outlook events:', error)
      throw error
    }
  }

  // Create event in Outlook calendar
  async createEvent(event: Omit<OutlookEvent, 'id'>): Promise<OutlookEvent> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Outlook')
    }

    try {
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/me/calendar/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      )

      if (!response.ok) {
        throw new Error(`Outlook API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to create Outlook event:', error)
      throw error
    }
  }

  // Update event in Outlook calendar
  async updateEvent(eventId: string, updates: Partial<OutlookEvent>): Promise<OutlookEvent> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Outlook')
    }

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendar/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        }
      )

      if (!response.ok) {
        throw new Error(`Outlook API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to update Outlook event:', error)
      throw error
    }
  }

  // Delete event from Outlook calendar
  async deleteEvent(eventId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Outlook')
    }

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendar/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Outlook API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to delete Outlook event:', error)
      throw error
    }
  }

  // Convert Task to Outlook Event
  taskToOutlookEvent(task: any): Omit<OutlookEvent, 'id'> {
    const startDate = new Date(task.dueDate)
    const endDate = new Date(startDate.getTime() + (task.estimatedDuration || 60) * 60000)

    return {
      subject: task.title,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Europe/Berlin'
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Berlin'
      },
      body: {
        content: task.description || '',
        contentType: 'text'
      },
      location: task.location ? {
        displayName: task.location
      } : undefined,
      categories: task.tags || [],
      importance: task.priority === 'high' ? 'high' : 
                 task.priority === 'low' ? 'low' : 'normal',
      isAllDay: false
    }
  }

  // Convert Outlook Event to Task
  outlookEventToTask(event: OutlookEvent): any {
    return {
      title: event.subject,
      description: event.body.content,
      dueDate: event.start.dateTime,
      location: event.location?.displayName,
      priority: event.importance === 'high' ? 'high' :
                event.importance === 'low' ? 'low' : 'medium',
      tags: event.categories || [],
      estimatedDuration: Math.round(
        (new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / 60000
      ),
      outlookEventId: event.id
    }
  }

  // Sync tasks with Outlook
  async syncTasksWithOutlook(tasks: any[]): Promise<void> {
    if (!this.accessToken) {
      await this.authenticate()
    }

    try {
      // Get existing Outlook events
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 3)
      
      const existingEvents = await this.getEvents(startDate, endDate)
      
      // Create/Update tasks in Outlook
      for (const task of tasks) {
        if (task.outlookEventId) {
          // Update existing event
          const outlookEvent = this.taskToOutlookEvent(task)
          await this.updateEvent(task.outlookEventId, outlookEvent)
        } else {
          // Create new event
          const outlookEvent = this.taskToOutlookEvent(task)
          const createdEvent = await this.createEvent(outlookEvent)
          // Update task with Outlook event ID
          task.outlookEventId = createdEvent.id
        }
      }
    } catch (error) {
      console.error('Failed to sync with Outlook:', error)
      throw error
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  // Logout
  logout(): void {
    this.accessToken = null
    localStorage.removeItem('outlook-access-token')
  }
}

// Default configuration
const defaultConfig: OutlookConfig = {
  clientId: process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID || '',
  redirectUri: process.env.NEXT_PUBLIC_OUTLOOK_REDIRECT_URI || `${window.location.origin}/auth/outlook/callback`,
  scopes: [
    'https://graph.microsoft.com/calendars.readwrite',
    'https://graph.microsoft.com/mail.readwrite'
  ]
}

export const outlookService = new OutlookService(defaultConfig)
