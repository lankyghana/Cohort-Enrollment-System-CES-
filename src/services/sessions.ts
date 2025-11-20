import { supabase } from './supabase'
import type { Database } from '@/types/database'

export type SessionPayload = {
  course_id: string
  title: string
  description?: string
  meeting_link: string
  scheduled_at: string
  duration_minutes?: number
}

export type CreatorContext = {
  id?: string | null
  name?: string | null
}

type CourseSessionRow = Database['public']['Tables']['course_sessions']['Row']
type CourseSessionInsert = Database['public']['Tables']['course_sessions']['Insert']

type EnrollmentRow = Pick<Database['public']['Tables']['enrollments']['Row'], 'student_id'>
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

type CourseRow = Pick<Database['public']['Tables']['courses']['Row'], 'id' | 'title' | 'instructor_id' | 'status'>

type JoinedSessionRow = Pick<
  CourseSessionRow,
  'id' | 'title' | 'scheduled_at' | 'meeting_link' | 'duration_minutes' | 'course_id'
> & {
  courses?: Pick<CourseRow, 'id' | 'title' | 'instructor_id'> | null
}

export type UpcomingSessionSummary = {
  id: string
  title: string
  scheduled_at: string
  meeting_link: string | null
  duration_minutes: number | null
  course_id: string
  course_title: string
  when: string
}

export type RoleScope = 'admin' | 'instructor'

const formatDateTime = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso))
  } catch (_) {
    return iso
  }
}

export async function fetchCoursesForSession(role: RoleScope, userId?: string | null) {
  let query = supabase.from('courses').select('id,title,status,instructor_id').order('title', { ascending: true })
  if (role === 'instructor' && userId) {
    query = query.eq('instructor_id', userId)
  }
  const { data, error } = await query
  if (error) throw error
  return (data || []) as CourseRow[]
}

export async function fetchUpcomingSessions(role: RoleScope, userId?: string | null, limit = 6) {
  let query = supabase
    .from('course_sessions')
    .select('id,title,scheduled_at,meeting_link,duration_minutes,course_id,courses!inner(id,title,instructor_id)')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit)

  if (role === 'instructor' && userId) {
    query = query.eq('courses.instructor_id', userId)
  }

  const { data, error } = await query
  if (error) throw error

  const rows = (data || []) as JoinedSessionRow[]
  return rows.map<UpcomingSessionSummary>((session) => ({
    id: session.id,
    title: session.title,
    scheduled_at: session.scheduled_at,
    meeting_link: session.meeting_link,
    duration_minutes: session.duration_minutes ?? null,
    course_id: session.course_id,
    course_title: session.courses?.title ?? 'Untitled course',
    when: formatDateTime(session.scheduled_at),
  }))
}

export async function createSessionWithNotifications(payload: SessionPayload, creator?: CreatorContext) {
  const body: CourseSessionInsert = {
    course_id: payload.course_id,
    module_id: null,
    title: payload.title,
    description: payload.description ?? null,
    meeting_link: payload.meeting_link,
    scheduled_at: payload.scheduled_at,
    duration_minutes: payload.duration_minutes ?? 60,
    status: 'scheduled',
    recording_url: null,
  }

  const { data: session, error } = await supabase
    .from('course_sessions')
    .insert([body])
    .select('id, course_id, title, scheduled_at, meeting_link')
    .single()

  if (error || !session) {
    throw error || new Error('Failed to create session')
  }

  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('course_id', session.course_id)
    .eq('payment_status', 'completed')

  if (enrollError) {
    throw enrollError
  }

  if (enrollments?.length) {
    const creatorName = creator?.name || 'Your instructor'
    const message = `${creatorName} scheduled "${session.title}" for ${formatDateTime(session.scheduled_at)}. Join via ${session.meeting_link || 'the course room.'}`
    const rows: NotificationInsert[] = (enrollments as EnrollmentRow[]).map((enrollment) => ({
      recipient_id: enrollment.student_id,
      course_id: session.course_id,
      session_id: session.id,
      title: `Upcoming session: ${session.title}`,
      message,
      metadata: {
        scheduled_at: session.scheduled_at,
        meeting_link: session.meeting_link,
        created_by: creator?.id ?? null,
      },
      read: false,
    }))

    if (rows.length) {
      const { error: notificationError } = await supabase.from('notifications').insert(rows)
      if (notificationError) {
        throw notificationError
      }
    }
  }

  return session as Pick<CourseSessionRow, 'id' | 'course_id' | 'title' | 'scheduled_at' | 'meeting_link'>
}