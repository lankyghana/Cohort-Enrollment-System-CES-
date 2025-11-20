import type { Database } from '@/types/database'
import { supabase } from './supabase'

export type Assignment = Database['public']['Tables']['assignments']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type SubmissionFile = Database['public']['Tables']['submission_files']['Row']
export type SubmissionWithFiles = Submission & { submission_files?: SubmissionFile[] | null }
export type Grade = Database['public']['Tables']['grades']['Row']

type CreateAssignmentPayload = {
  title: string
  instructions?: string | null
  due_at?: string | null
  course_id?: string | null
}

type CreateSubmissionPayload = {
  assignment_id: string
  user_id: string
  body?: string | null
}

async function requireUserId() {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  const userId = authData.user?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export const AssignmentsService = {
  async listAssignments(options?: { mineOnly?: boolean }): Promise<Assignment[]> {
    let query = supabase.from('assignments').select('*').order('created_at', { ascending: false })

    if (options?.mineOnly) {
      const userId = await requireUserId()
      query = query.eq('created_by', userId)
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async createAssignment(payload: CreateAssignmentPayload): Promise<Assignment> {
    const userId = await requireUserId()
    const insertPayload: Database['public']['Tables']['assignments']['Insert'] = {
      title: payload.title,
      instructions: payload.instructions ?? null,
      due_at: payload.due_at ?? null,
      course_id: payload.course_id ?? null,
      created_by: userId,
    }
    const { data, error } = await supabase.from('assignments').insert([insertPayload]).select().maybeSingle()
    if (error) throw error
    if (!data) throw new Error('Failed to create assignment')
    return data
  },

  async getAssignment(id: string): Promise<Assignment | null> {
    const { data, error } = await supabase.from('assignments').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data
  },

  async createSubmission(payload: CreateSubmissionPayload): Promise<Submission> {
    const insertPayload: Database['public']['Tables']['submissions']['Insert'] = {
      assignment_id: payload.assignment_id,
      user_id: payload.user_id,
      body: payload.body ?? null,
    }
    const { data, error } = await supabase.from('submissions').insert([insertPayload]).select().maybeSingle()
    if (error) throw error
    if (!data) throw new Error('Failed to create submission')
    return data
  },

  async uploadFile(path: string, file: File): Promise<{ path: string }> {
    const { error } = await supabase.storage.from('assignments').upload(path, file)
    if (error) throw error
    return { path }
  },

  async listSubmissionsForAssignment(assignmentId: string): Promise<SubmissionWithFiles[]> {
    const { data, error } = await supabase.from('submissions').select('*, submission_files(*)').eq('assignment_id', assignmentId)
    if (error) throw error
    return (data || []) as SubmissionWithFiles[]
  },

  async gradeSubmission(payload: { submission_id: string; grader_id: string; score?: number; feedback?: string }): Promise<Grade | null> {
    const insertPayload: Database['public']['Tables']['grades']['Insert'] = {
      submission_id: payload.submission_id,
      grader_id: payload.grader_id,
      score: payload.score ?? null,
      feedback: payload.feedback ?? null,
    }
    const { data, error } = await supabase.from('grades').insert([insertPayload]).select().maybeSingle()
    if (error) throw error
    return data
  },
}

export default AssignmentsService
