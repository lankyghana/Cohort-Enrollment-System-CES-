// User Types
export interface User {
  id: string
  email: string
  full_name: string | null
  phone?: string | null
  bio?: string | null
  avatar_url: string | null
  role: 'student' | 'admin' | 'instructor'
  created_at: string
  updated_at: string
}

// Course Types
export interface Course {
  id: string
  title: string
  description: string
  short_description: string | null
  instructor_id: string
  instructor?: User
  price: number
  currency: string
  duration_weeks: number
  thumbnail_url: string | null
  banner_url: string | null
  status: 'draft' | 'published' | 'archived'
  enrollment_count: number
  created_at: string
  updated_at: string
}

export interface CourseModule {
  id: string
  course_id: string
  title: string
  description: string | null
  order_index: number
  created_at: string
}

export interface CourseSession {
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

// Enrollment Types
export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  student?: User
  course?: Course
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_id: string | null
  progress_percentage: number
  completed_at: string | null
  enrolled_at: string
  created_at: string
}

// Payment Types
export interface Payment {
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

// Resource Types
export interface Resource {
  id: string
  course_id: string
  session_id: string | null
  title: string
  description: string | null
  file_url: string
  file_type: string
  file_size: number
  category: 'document' | 'video' | 'audio' | 'link' | 'other'
  order_index: number
  created_at: string
}

// Certificate Types
export interface Certificate {
  id: string
  student_id: string
  course_id: string
  enrollment_id: string
  certificate_url: string
  verification_code: string
  issued_at: string
  created_at: string
  student?: User
  course?: Course
}

// Announcement Types
export interface Announcement {
  id: string
  course_id: string | null
  title: string
  content: string
  author_id: string
  author?: User
  target_audience: 'all' | 'students' | 'admins'
  created_at: string
  updated_at: string
}

// Message Types
export interface Message {
  id: string
  sender_id: string
  recipient_id: string | null
  course_id: string | null
  subject: string
  content: string
  read: boolean
  created_at: string
  sender?: User
  recipient?: User
}

