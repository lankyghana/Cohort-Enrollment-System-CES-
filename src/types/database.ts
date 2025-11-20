// Database types kept in sync with supabase/schema.sql
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
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'admin' | 'instructor'
          phone?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'admin' | 'instructor'
          phone?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
        Insert: {
          id?: string
          title: string
          description: string
          short_description?: string | null
          instructor_id: string
          price?: number
          currency?: string
          duration_weeks?: number
          thumbnail_url?: string | null
          banner_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          enrollment_count?: number
          max_students?: number | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          short_description?: string | null
          instructor_id?: string
          price?: number
          currency?: string
          duration_weeks?: number
          thumbnail_url?: string | null
          banner_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          enrollment_count?: number
          max_students?: number | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'courses_instructor_id_fkey',
            columns: ['instructor_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
      }
      assignments: {
        Row: {
          id: string
          course_id: string | null
          title: string
          instructions: string | null
          due_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id?: string | null
          title: string
          instructions?: string | null
          due_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string | null
          title?: string
          instructions?: string | null
          due_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'assignments_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'assignments_created_by_fkey',
            columns: ['created_by'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
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
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'course_modules_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
        ]
      }
      course_sections: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'course_sections_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
        ]
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
        Insert: {
          id?: string
          course_id: string
          module_id?: string | null
          title: string
          description?: string | null
          meeting_link?: string | null
          scheduled_at: string
          duration_minutes?: number
          status?: 'scheduled' | 'live' | 'completed' | 'cancelled'
          recording_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          module_id?: string | null
          title?: string
          description?: string | null
          meeting_link?: string | null
          scheduled_at?: string
          duration_minutes?: number
          status?: 'scheduled' | 'live' | 'completed' | 'cancelled'
          recording_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'course_sessions_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'course_sessions_module_id_fkey',
            columns: ['module_id'],
            referencedRelation: 'course_modules',
            referencedColumns: ['id'],
          },
        ]
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
        Insert: {
          id?: string
          student_id: string
          course_id: string
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id?: string | null
          progress_percentage?: number
          completed_at?: string | null
          enrolled_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id?: string | null
          progress_percentage?: number
          completed_at?: string | null
          enrolled_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'enrollments_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'enrollments_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'enrollments_payment_id_fkey',
            columns: ['payment_id'],
            referencedRelation: 'payments',
            referencedColumns: ['id'],
          },
        ]
      }
      submissions: {
        Row: {
          id: string
          assignment_id: string
          user_id: string
          body: string | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          user_id: string
          body?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          user_id?: string
          body?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'submissions_assignment_id_fkey',
            columns: ['assignment_id'],
            referencedRelation: 'assignments',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'submissions_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
      }
      submission_files: {
        Row: {
          id: string
          submission_id: string
          storage_path: string
          file_name: string
          size_bytes: number | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          storage_path: string
          file_name: string
          size_bytes?: number | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          storage_path?: string
          file_name?: string
          size_bytes?: number | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'submission_files_submission_id_fkey',
            columns: ['submission_id'],
            referencedRelation: 'submissions',
            referencedColumns: ['id'],
          },
        ]
      }
      grades: {
        Row: {
          id: string
          submission_id: string
          grader_id: string
          score: number | null
          feedback: string | null
          graded_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          grader_id: string
          score?: number | null
          feedback?: string | null
          graded_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          grader_id?: string
          score?: number | null
          feedback?: string | null
          graded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'grades_submission_id_fkey',
            columns: ['submission_id'],
            referencedRelation: 'submissions',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'grades_grader_id_fkey',
            columns: ['grader_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
      }
      payments: {
        Row: {
          id: string
          enrollment_id: string | null
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
        Insert: {
          id?: string
          enrollment_id?: string | null
          student_id: string
          course_id: string
          amount: number
          currency?: string
          paystack_reference: string
          paystack_transaction_id?: string | null
          status?: 'pending' | 'success' | 'failed' | 'refunded'
          metadata?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enrollment_id?: string | null
          student_id?: string
          course_id?: string
          amount?: number
          currency?: string
          paystack_reference?: string
          paystack_transaction_id?: string | null
          status?: 'pending' | 'success' | 'failed' | 'refunded'
          metadata?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_enrollment_id_fkey',
            columns: ['enrollment_id'],
            referencedRelation: 'enrollments',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'payments_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'payments_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
        ]
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
        Insert: {
          id?: string
          course_id: string
          session_id?: string | null
          title: string
          description?: string | null
          file_url: string
          file_type: string
          file_size?: number | null
          category?: 'document' | 'video' | 'audio' | 'link' | 'other'
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          session_id?: string | null
          title?: string
          description?: string | null
          file_url?: string
          file_type?: string
          file_size?: number | null
          category?: 'document' | 'video' | 'audio' | 'link' | 'other'
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'resources_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'resources_session_id_fkey',
            columns: ['session_id'],
            referencedRelation: 'course_sessions',
            referencedColumns: ['id'],
          },
        ]
      }
      lessons: {
        Row: {
          id: string
          section_id: string
          title: string
          description: string | null
          type: string
          content: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          title: string
          description?: string | null
          type: string
          content?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          title?: string
          description?: string | null
          type?: string
          content?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lessons_section_id_fkey',
            columns: ['section_id'],
            referencedRelation: 'course_sections',
            referencedColumns: ['id'],
          },
        ]
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
        Insert: {
          id?: string
          student_id: string
          course_id: string
          enrollment_id: string
          certificate_url: string
          verification_code: string
          issued_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          enrollment_id?: string
          certificate_url?: string
          verification_code?: string
          issued_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'certificates_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'certificates_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'certificates_enrollment_id_fkey',
            columns: ['enrollment_id'],
            referencedRelation: 'enrollments',
            referencedColumns: ['id'],
          },
        ]
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
        Insert: {
          id?: string
          course_id?: string | null
          title: string
          content: string
          author_id: string
          target_audience?: 'all' | 'students' | 'admins'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string | null
          title?: string
          content?: string
          author_id?: string
          target_audience?: 'all' | 'students' | 'admins'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'announcements_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'announcements_author_id_fkey',
            columns: ['author_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
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
        Insert: {
          id?: string
          sender_id: string
          recipient_id?: string | null
          course_id?: string | null
          subject: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string | null
          course_id?: string | null
          subject?: string
          content?: string
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_sender_id_fkey',
            columns: ['sender_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'messages_recipient_id_fkey',
            columns: ['recipient_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'messages_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          course_id: string | null
          session_id: string | null
          title: string
          message: string
          metadata: Record<string, unknown> | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          course_id?: string | null
          session_id?: string | null
          title: string
          message: string
          metadata?: Record<string, unknown> | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          course_id?: string | null
          session_id?: string | null
          title?: string
          message?: string
          metadata?: Record<string, unknown> | null
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_recipient_id_fkey',
            columns: ['recipient_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'notifications_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'notifications_session_id_fkey',
            columns: ['session_id'],
            referencedRelation: 'course_sessions',
            referencedColumns: ['id'],
          },
        ]
      }
      session_attendance: {
        Row: {
          id: string
          session_id: string
          student_id: string
          status: 'present' | 'absent' | 'late'
          joined_at: string | null
          left_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_id: string
          status?: 'present' | 'absent' | 'late'
          joined_at?: string | null
          left_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          student_id?: string
          status?: 'present' | 'absent' | 'late'
          joined_at?: string | null
          left_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_attendance_session_id_fkey',
            columns: ['session_id'],
            referencedRelation: 'course_sessions',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'session_attendance_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
      }
      session_feedback: {
        Row: {
          id: string
          session_id: string
          student_id: string
          rating: number | null
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_id: string
          rating?: number | null
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          student_id?: string
          rating?: number | null
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_feedback_session_id_fkey',
            columns: ['session_id'],
            referencedRelation: 'course_sessions',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'session_feedback_student_id_fkey',
            columns: ['student_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
      }
      instructor_applications: {
        Row: {
          id: string
          user_id: string
          resume_url: string | null
          portfolio_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          notes: string | null
          applied_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          resume_url?: string | null
          portfolio_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          notes?: string | null
          applied_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          resume_url?: string | null
          portfolio_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          notes?: string | null
          applied_at?: string
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'instructor_applications_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
      }
      instructor_profiles: {
        Row: {
          id: string
          user_id: string
          headline: string | null
          bio: string | null
          experience_years: number | null
          linkedin_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          headline?: string | null
          bio?: string | null
          experience_years?: number | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          headline?: string | null
          bio?: string | null
          experience_years?: number | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'instructor_profiles_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
      }
      cohorts: {
        Row: {
          id: string
          name: string
          course_id: string
          start_date: string
          end_date: string | null
          status: 'upcoming' | 'active' | 'completed'
          capacity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          course_id: string
          start_date: string
          end_date?: string | null
          status?: 'upcoming' | 'active' | 'completed'
          capacity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          course_id?: string
          start_date?: string
          end_date?: string | null
          status?: 'upcoming' | 'active' | 'completed'
          capacity?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cohorts_course_id_fkey',
            columns: ['course_id'],
            referencedRelation: 'courses',
            referencedColumns: ['id'],
          },
        ]
      }
      cohort_enrollments: {
        Row: {
          id: string
          cohort_id: string
          enrollment_id: string
          created_at: string
        }
        Insert: {
          id?: string
          cohort_id: string
          enrollment_id: string
          created_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string
          enrollment_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cohort_enrollments_cohort_id_fkey',
            columns: ['cohort_id'],
            referencedRelation: 'cohorts',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'cohort_enrollments_enrollment_id_fkey',
            columns: ['enrollment_id'],
            referencedRelation: 'enrollments',
            referencedColumns: ['id'],
          },
        ]
      }
      activity_logs: {
        Row: {
          id: string
          actor_id: string
          action: string
          resource_type: string
          resource_id: string
          details: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id: string
          action: string
          resource_type: string
          resource_id: string
          details?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string
          action?: string
          resource_type?: string
          resource_id?: string
          details?: Record<string, unknown> | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'activity_logs_actor_id_fkey',
            columns: ['actor_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          description: string
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority: 'low' | 'medium' | 'high'
          assigned_to: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          description: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          description?: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'support_tickets_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'support_tickets_assigned_to_fkey',
            columns: ['assigned_to'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_enabled: boolean
          push_enabled: boolean
          sms_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_enabled?: boolean
          push_enabled?: boolean
          sms_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_enabled?: boolean
          push_enabled?: boolean
          sms_enabled?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notification_preferences_user_id_fkey',
            columns: ['user_id'],
            referencedRelation: 'users',
            referencedColumns: ['id'],
          },
        ]
      }
      feature_flags: {
        Row: {
          id: string
          key: string
          description: string | null
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          description?: string | null
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          description?: string | null
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_enrollments_by_month: {
        Args: {
          p_months?: number
        }
        Returns: {
          month: string
          year: number
          month_index: number
          enrollments: number
        }[]
      }
      admin_get_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_students: number
          total_courses: number
          total_enrollments: number
          total_revenue: number
          active_courses: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

