import { supabase } from './supabase'

type Assignment = {
  id: string
  title: string
  instructions?: string
  due_at?: string
  created_by: string
}

type Submission = {
  id: string
  assignment_id: string
  user_id: string
  body?: string
  submitted_at?: string
}

export const AssignmentsService = {
  async listAssignments() {
    const { data, error } = await supabase.from('assignments').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Assignment[]
  },

  async createAssignment(payload: { title: string; instructions?: string; due_at?: string }) {
    const { data, error } = await supabase.from('assignments').insert([payload]).select().maybeSingle()
    if (error) throw error
    return data as Assignment
  },

  async getAssignment(id: string) {
    const { data, error } = await supabase.from('assignments').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data as Assignment | null
  },

  async createSubmission(payload: { assignment_id: string; user_id: string; body?: string }) {
    const { data, error } = await supabase.from('submissions').insert([payload]).select().maybeSingle()
    if (error) throw error
    return data as Submission
  },

  async uploadFile(path: string, file: File) {
    const { error } = await supabase.storage.from('assignments').upload(path, file)
    if (error) throw error
    return { path }
  },

  async listSubmissionsForAssignment(assignmentId: string) {
    const { data, error } = await supabase.from('submissions').select('*, submission_files(*)').eq('assignment_id', assignmentId)
    if (error) throw error
    return data as any[]
  },

  async gradeSubmission(payload: { submission_id: string; grader_id: string; score?: number; feedback?: string }) {
    const { data, error } = await supabase.from('grades').insert([payload]).select().maybeSingle()
    if (error) throw error
    return data
  },
}

export default AssignmentsService
