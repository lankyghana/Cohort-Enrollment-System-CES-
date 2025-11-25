// This service needs to be rewritten for Laravel API
// Temporarily stubbed to prevent import errors
/* eslint-disable @typescript-eslint/no-unused-vars */

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

export const createSessionWithNotifications = async (_payload: SessionPayload, _context: CreatorContext): Promise<{ id: string }> => {
  throw new Error('Not implemented - migrate to Laravel API')
}

export const fetchCoursesForSession = async (_role: RoleScope, _userId?: string | null): Promise<Array<{ id: string; title: string; status?: string }>> => {
  throw new Error('Not implemented - migrate to Laravel API')
}

export const fetchUpcomingSessions = async (_role: RoleScope, _userId?: string): Promise<any[]> => {
  throw new Error('Not implemented - migrate to Laravel API')
}

export const sessionsService = {
  getSessions: async () => { throw new Error('Not implemented - migrate to Laravel API') },
}

