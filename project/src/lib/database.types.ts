export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cases: {
        Row: {
          id: string
          title: string
          client_name: string
          description: string | null
          status: 'Active' | 'Closed' | 'Pending'
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          client_name: string
          description?: string | null
          status?: 'Active' | 'Closed' | 'Pending'
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          client_name?: string
          description?: string | null
          status?: 'Active' | 'Closed' | 'Pending'
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      time_logs: {
        Row: {
          id: string
          case_id: string
          description: string | null
          activity_type: 'Consultation' | 'Research' | 'Court Time' | 'Drafting' | 'Administrative' | 'Other'
          notes: string | null
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          case_id: string
          description?: string | null
          activity_type: 'Consultation' | 'Research' | 'Court Time' | 'Drafting' | 'Administrative' | 'Other'
          notes?: string | null
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          case_id?: string
          description?: string | null
          activity_type?: 'Consultation' | 'Research' | 'Court Time' | 'Drafting' | 'Administrative' | 'Other'
          notes?: string | null
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
  }
}