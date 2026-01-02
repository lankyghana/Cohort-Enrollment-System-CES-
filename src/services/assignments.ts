// This service needs to be rewritten for Laravel API
// Temporarily stubbed to prevent import errors
import apiClient from './apiClient'
import type { Assignment, SubmissionWithFiles, Grade } from '@/types'

type ServiceResult<T> = Promise<{ error?: Error; data?: T }>

export const assignmentsService = {
  getAssignments: async (): ServiceResult<Assignment[]> => {
    try {
      const { data } = await apiClient.get('/api/assignments')
      return { data: (data ?? []) as Assignment[] }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to load assignments') }
    }
  },

  listAssignments: async (options: { mineOnly: boolean }): Promise<Assignment[]> => {
    try {
      const qs = options.mineOnly ? '?mine_only=1' : ''
      const { data } = await apiClient.get(`/api/assignments${qs}`)
      return (data ?? []) as Assignment[]
    } catch (err) {
      console.error('listAssignments error', err)
      return []
    }
  },

  createAssignment: async (payload: { title: string; instructions: string; due_at?: string }) : ServiceResult<Assignment> => {
    try {
      const body: { title: string; instructions: string; due_at?: string } = {
        title: payload.title,
        instructions: payload.instructions,
      }
      if (payload.due_at) body.due_at = payload.due_at

      const { data } = await apiClient.post('/api/assignments', body)
      return { data: data as Assignment }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to create assignment') }
    }
  },

  listSubmissionsForAssignment: async (assignmentId: string): Promise<SubmissionWithFiles[]> => {
    try {
      const { data } = await apiClient.get(`/api/assignments/${assignmentId}/submissions`)
      return (data ?? []) as SubmissionWithFiles[]
    } catch (err) {
      console.error('listSubmissionsForAssignment', err)
      return []
    }
  },

  gradeSubmission: async (
    submissionId: string,
    payload: { score: number; maxScore?: number; feedback?: string }
  ): ServiceResult<Grade> => {
    try {
      const body: { score: number; max_score?: number; feedback?: string } = {
        score: payload.score,
      }
      if (payload.maxScore !== undefined) body.max_score = payload.maxScore
      if (payload.feedback !== undefined) body.feedback = payload.feedback

      const { data } = await apiClient.post(`/api/submissions/${submissionId}/grade`, body)
      return { data: data as Grade }
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to grade submission') }
    }
  },
}

