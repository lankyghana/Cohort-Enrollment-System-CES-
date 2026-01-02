type UpcomingSession = {
  id: string
  title: string
  course_title: string
  when: string
  meeting_link: string | null
}

export type CreatorContext = {
  userId: string
  role: string
}

export type RoleScope = 'admin' | 'instructor' | 'student'

export type SessionPayload = {
  title: string
  description?: string
  course_id?: string
  scheduled_at: string
  duration_minutes?: number
  meeting_link?: string
}

export const createSessionWithNotifications = async (
  payload: SessionPayload,
  context: CreatorContext
): Promise<{ id: string }> => {
  throw new Error(`Not implemented - migrate to Laravel API (role=${context.role}, course_id=${payload.course_id ?? 'n/a'})`)
}

export const fetchCoursesForSession = async (
  role: RoleScope,
  userId?: string | null
): Promise<Array<{ id: string; title: string; status?: string }>> => {
  throw new Error(`Not implemented - migrate to Laravel API (role=${role}, userId=${userId ?? 'n/a'})`)
}

export const fetchUpcomingSessions = async (
  _role?: RoleScope,
  _userId?: string
): Promise<UpcomingSession[]> => {
  // Backend currently does not provide an upcoming sessions admin endpoint.
  // Keep the UI stable by returning an empty list.
  void _role
  void _userId
  return []
}

export const sessionsService = {
  getSessions: async (): Promise<UpcomingSession[]> => {
    return []
  },
}

