import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          description?: string
          created_at: string
          updated_at: string
          owner_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          created_at?: string
          updated_at?: string
          owner_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
          updated_at?: string
          owner_id?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'manager' | 'member'
          joined_at: string
          invited_by?: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'manager' | 'member'
          joined_at?: string
          invited_by?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'manager' | 'member'
          joined_at?: string
          invited_by?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description?: string
          priority: 'low' | 'medium' | 'high'
          status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
          due_date: string
          created_at: string
          updated_at: string
          organization_id: string
          created_by: string
          assigned_to?: string
          category?: string
          location?: string
          notes?: string
          started_at?: string
          completed_at?: string
          completed_by?: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          priority: 'low' | 'medium' | 'high'
          status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
          due_date: string
          created_at?: string
          updated_at?: string
          organization_id: string
          created_by: string
          assigned_to?: string
          category?: string
          location?: string
          notes?: string
          started_at?: string
          completed_at?: string
          completed_by?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
          due_date?: string
          created_at?: string
          updated_at?: string
          organization_id?: string
          created_by?: string
          assigned_to?: string
          category?: string
          location?: string
          notes?: string
          started_at?: string
          completed_at?: string
          completed_by?: string
        }
      }
      task_history: {
        Row: {
          id: string
          task_id: string
          action: string
          old_value?: string
          new_value?: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          task_id: string
          action: string
          old_value?: string
          new_value?: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          task_id?: string
          action?: string
          old_value?: string
          new_value?: string
          created_at?: string
          created_by?: string
        }
      }
      buckets: {
        Row: {
          id: string
          name: string
          description?: string
          color?: string
          organization_id: string
          created_by: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          color?: string
          organization_id: string
          created_by: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          color?: string
          organization_id?: string
          created_by?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      task_buckets: {
        Row: {
          id: string
          task_id: string
          bucket_id: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          bucket_id: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          bucket_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
