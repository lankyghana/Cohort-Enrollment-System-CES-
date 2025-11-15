// Database types matching the Supabase schema
// This file should be kept in sync with supabase/schema.sql
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'student' | 'admin' | 'instructor'
          phone: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          short_description: string | null
          instructor_id: string
          price: number
          currency: string
          duration_weeks: number
          thumbnail_url: string | null
          banner_url: string | null
          status: 'draft' | 'published' | 'archived'
          enrollment_count: number
          max_students: number | null
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at' | 'enrollment_count'>
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      course_modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['course_modules']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['course_modules']['Insert']>
      }
      course_sessions: {
        Row: {
          id: string
          course_id: string
          module_id: string | null
          title: string
          description: string | null
          meeting_link: string | null
          scheduled_at: string
          duration_minutes: number
          status: 'scheduled' | 'live' | 'completed' | 'cancelled'
          recording_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['course_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['course_sessions']['Insert']>
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id: string | null
          progress_percentage: number
          completed_at: string | null
          enrolled_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['enrollments']['Row'], 'id' | 'created_at' | 'enrolled_at'>
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>
      }
      payments: {
        Row: {
          id: string
          enrollment_id: string
          student_id: string
          course_id: string
          amount: number
          currency: string
          paystack_reference: string
          paystack_transaction_id: string | null
          status: 'pending' | 'success' | 'failed' | 'refunded'
          metadata: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      resources: {
        Row: {
          id: string
          course_id: string
          session_id: string | null
          title: string
          description: string | null
          file_url: string
          file_type: string
          file_size: number | null
          category: 'document' | 'video' | 'audio' | 'link' | 'other'
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['resources']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['resources']['Insert']>
      }
      certificates: {
        Row: {
          id: string
          student_id: string
          course_id: string
          enrollment_id: string
          certificate_url: string
          verification_code: string
          issued_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['certificates']['Row'], 'id' | 'created_at' | 'issued_at'>
        Update: Partial<Database['public']['Tables']['certificates']['Insert']>
      }
      announcements: {
        Row: {
          id: string
          course_id: string | null
          title: string
          content: string
          author_id: string
          target_audience: 'all' | 'students' | 'admins'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string | null
          course_id: string | null
          subject: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'read'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

