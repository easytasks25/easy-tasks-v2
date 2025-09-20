// E-Mail Integration für Aufgaben-Erstellung
export interface EmailConfig {
  imapHost: string
  imapPort: number
  smtpHost: string
  smtpPort: number
  username: string
  password: string
  taskEmailAddress: string
}

export interface EmailMessage {
  id: string
  from: string
  subject: string
  body: string
  receivedAt: Date
  attachments?: Array<{
    filename: string
    contentType: string
    size: number
    data: string
  }>
}

export interface TaskFromEmail {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  category?: string
  tags: string[]
  attachments?: any[]
  sourceEmail: string
}

class EmailService {
  private config: EmailConfig
  private isConnected: boolean = false

  constructor(config: EmailConfig) {
    this.config = config
  }

  // Connect to email server
  async connect(): Promise<boolean> {
    try {
      // In a real implementation, this would use a proper IMAP library
      // For now, we'll simulate the connection
      console.log('Connecting to email server...')
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      this.isConnected = true
      return true
    } catch (error) {
      console.error('Failed to connect to email server:', error)
      return false
    }
  }

  // Check for new emails and convert to tasks
  async checkForTaskEmails(): Promise<TaskFromEmail[]> {
    if (!this.isConnected) {
      await this.connect()
    }

    try {
      // In a real implementation, this would fetch emails from IMAP
      // For now, we'll return mock data
      const mockEmails: EmailMessage[] = [
        {
          id: 'email-1',
          from: 'bauleiter@example.com',
          subject: '[AUFGABE] Fundament gießen - Baustelle A',
          body: 'Das Fundament für Baustelle A muss bis Freitag gegossen werden. Bitte Material bestellen.',
          receivedAt: new Date(),
          attachments: []
        },
        {
          id: 'email-2',
          from: 'architekt@example.com',
          subject: '[HOCH] Sicherheitsinspektion - Dringend',
          body: 'Sicherheitsinspektion muss bis morgen durchgeführt werden. Alle Bereiche prüfen.',
          receivedAt: new Date(),
          attachments: []
        }
      ]

      return mockEmails.map(email => this.convertEmailToTask(email))
    } catch (error) {
      console.error('Failed to check for task emails:', error)
      return []
    }
  }

  // Convert email to task
  private convertEmailToTask(email: EmailMessage): TaskFromEmail {
    // Extract priority from subject
    const priority = this.extractPriority(email.subject)
    
    // Extract due date from email content
    const dueDate = this.extractDueDate(email.body) || this.getDefaultDueDate()
    
    // Extract category from subject or content
    const category = this.extractCategory(email.subject, email.body)
    
    // Extract tags from content
    const tags = this.extractTags(email.body)
    
    // Clean subject for task title
    const title = this.cleanSubject(email.subject)

    return {
      title,
      description: email.body,
      priority,
      dueDate: dueDate.toISOString(),
      category,
      tags,
      attachments: email.attachments?.map(att => ({
        id: Date.now().toString(),
        name: att.filename,
        type: this.getAttachmentType(att.contentType),
        size: att.size,
        url: `data:${att.contentType};base64,${att.data}`,
        uploadedAt: new Date()
      })) || [],
      sourceEmail: email.from
    }
  }

  // Extract priority from subject line
  private extractPriority(subject: string): 'low' | 'medium' | 'high' {
    const upperSubject = subject.toUpperCase()
    
    if (upperSubject.includes('[HOCH]') || upperSubject.includes('[URGENT]')) {
      return 'high'
    }
    if (upperSubject.includes('[NIEDRIG]') || upperSubject.includes('[LOW]')) {
      return 'low'
    }
    
    return 'medium'
  }

  // Extract due date from email content
  private extractDueDate(content: string): Date | null {
    // Look for common date patterns
    const datePatterns = [
      /(?:bis|until|by)\s+(\d{1,2}\.\d{1,2}\.\d{4})/gi,
      /(?:bis|until|by)\s+(\d{1,2}\/\d{1,2}\/\d{4})/gi,
      /(?:bis|until|by)\s+(\d{4}-\d{2}-\d{2})/gi,
      /(?:morgen|tomorrow)/gi,
      /(?:heute|today)/gi,
      /(?:übermorgen|day after tomorrow)/gi
    ]

    for (const pattern of datePatterns) {
      const match = content.match(pattern)
      if (match) {
        const dateStr = match[1] || match[0]
        
        if (dateStr.toLowerCase().includes('morgen') || dateStr.toLowerCase().includes('tomorrow')) {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          return tomorrow
        }
        
        if (dateStr.toLowerCase().includes('heute') || dateStr.toLowerCase().includes('today')) {
          return new Date()
        }
        
        if (dateStr.toLowerCase().includes('übermorgen') || dateStr.toLowerCase().includes('day after tomorrow')) {
          const dayAfterTomorrow = new Date()
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
          return dayAfterTomorrow
        }

        // Try to parse the date
        const parsedDate = new Date(dateStr)
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate
        }
      }
    }

    return null
  }

  // Extract category from subject or content
  private extractCategory(subject: string, content: string): string | undefined {
    const text = `${subject} ${content}`.toLowerCase()
    
    if (text.includes('sicherheit') || text.includes('safety')) return 'safety'
    if (text.includes('qualität') || text.includes('quality')) return 'quality'
    if (text.includes('material') || text.includes('materialien')) return 'materials'
    if (text.includes('planung') || text.includes('planning')) return 'planning'
    if (text.includes('bau') || text.includes('construction')) return 'construction'
    if (text.includes('wartung') || text.includes('maintenance')) return 'maintenance'
    
    return undefined
  }

  // Extract tags from content
  private extractTags(content: string): string[] {
    const tags: string[] = []
    
    // Look for hashtags
    const hashtagPattern = /#(\w+)/g
    let match
    while ((match = hashtagPattern.exec(content)) !== null) {
      tags.push(match[1])
    }
    
    // Look for common construction terms
    const constructionTerms = [
      'fundament', 'mauer', 'dach', 'elektrik', 'sanitär', 'heizung',
      'türen', 'fenster', 'boden', 'wände', 'decke', 'keller'
    ]
    
    const lowerContent = content.toLowerCase()
    constructionTerms.forEach(term => {
      if (lowerContent.includes(term)) {
        tags.push(term)
      }
    })
    
    return Array.from(new Set(tags)) // Remove duplicates
  }

  // Clean subject for task title
  private cleanSubject(subject: string): string {
    return subject
      .replace(/^\[.*?\]\s*/, '') // Remove [TAG] prefixes
      .replace(/^(AUFGABE|TASK|TODO):\s*/i, '') // Remove common prefixes
      .trim()
  }

  // Get default due date (3 days from now)
  private getDefaultDueDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date
  }

  // Get attachment type from MIME type
  private getAttachmentType(contentType: string): 'image' | 'document' | 'pdf' | 'other' {
    if (contentType.startsWith('image/')) return 'image'
    if (contentType === 'application/pdf') return 'pdf'
    if (contentType.startsWith('text/') || contentType.includes('document')) return 'document'
    return 'other'
  }

  // Send email notification for task completion
  async sendTaskCompletionEmail(task: any, recipient: string): Promise<boolean> {
    try {
      // In a real implementation, this would send an email via SMTP
      console.log(`Sending task completion email for: ${task.title}`)
      console.log(`Recipient: ${recipient}`)
      
      return true
    } catch (error) {
      console.error('Failed to send task completion email:', error)
      return false
    }
  }

  // Send email with task details
  async sendTaskEmail(task: any, recipient: string): Promise<boolean> {
    try {
      // In a real implementation, this would send an email via SMTP
      console.log(`Sending task email for: ${task.title}`)
      console.log(`Recipient: ${recipient}`)
      
      return true
    } catch (error) {
      console.error('Failed to send task email:', error)
      return false
    }
  }

  // Check if email is connected
  isEmailConnected(): boolean {
    return this.isConnected
  }

  // Disconnect from email server
  disconnect(): void {
    this.isConnected = false
  }
}

// Default configuration
const defaultConfig: EmailConfig = {
  imapHost: process.env.EMAIL_IMAP_HOST || 'imap.gmail.com',
  imapPort: parseInt(process.env.EMAIL_IMAP_PORT || '993'),
  smtpHost: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
  username: process.env.EMAIL_USERNAME || '',
  password: process.env.EMAIL_PASSWORD || '',
  taskEmailAddress: process.env.TASK_EMAIL_ADDRESS || 'tasks@lwtasks.de'
}

export const emailService = new EmailService(defaultConfig)

// Email parsing utilities
export const emailParsingUtils = {
  // Parse email address for task assignment
  parseAssigneeFromEmail: (email: string): string => {
    const match = email.match(/^(.+?)\s*<(.+?)>$/)
    return match ? match[1].trim() : email
  },

  // Extract location from email content
  extractLocation: (content: string): string | undefined => {
    const locationPatterns = [
      /(?:standort|location|ort):\s*([^\n\r]+)/gi,
      /(?:baustelle|construction site):\s*([^\n\r]+)/gi,
      /(?:etage|floor):\s*([^\n\r]+)/gi
    ]

    for (const pattern of locationPatterns) {
      const match = content.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }

    return undefined
  },

  // Extract estimated duration from email content
  extractDuration: (content: string): number | undefined => {
    const durationPatterns = [
      /(?:dauer|duration):\s*(\d+)\s*(?:min|minuten|minutes)/gi,
      /(?:ca\.|circa|about)\s*(\d+)\s*(?:min|minuten|minutes)/gi,
      /(\d+)\s*(?:min|minuten|minutes)\s*(?:geschätzt|estimated)/gi
    ]

    for (const pattern of durationPatterns) {
      const match = content.match(pattern)
      if (match) {
        return parseInt(match[1])
      }
    }

    return undefined
  }
}
