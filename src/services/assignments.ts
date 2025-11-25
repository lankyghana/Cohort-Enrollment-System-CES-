// This service needs to be rewritten for Laravel API
// Temporarily stubbed to prevent import errors
import apiClient from './apiClient'
import { uploadFile } from './uploads'

type ServiceResult<T> = Promise<{ error?: Error; data?: T }>

export const assignmentsService = {
  getAssignments: async (): ServiceResult<any[]> => {
    try {
      const { data } = await apiClient.get('/api/assignments')
      return { data }
    } catch (err: any) {
      return { error: err }
    }
  },

  listAssignments: async (options: { mineOnly: boolean }) => {
    try {
      const qs = options.mineOnly ? '?mine_only=1' : ''
      const { data } = await apiClient.get(`/api/assignments${qs}`)
      return data || []
    } catch (err) {
      console.error('listAssignments error', err)
      return []
    }
  },

  createAssignment: async (payload: { title: string; instructions: string; due_at?: string; attachment?: File | null }) => {
    try {
      let attachmentUrl: string | undefined
      if (payload.attachment) {
        const res = await uploadFile(payload.attachment)
        if (res.error) throw res.error
        attachmentUrl = res.data?.url
      }

      const body: any = {
        title: payload.title,
        instructions: payload.instructions,
      }
      if (payload.due_at) body.due_at = payload.due_at
      if (attachmentUrl) body.attachment_url = attachmentUrl

      const { data } = await apiClient.post('/api/assignments', body)
      return { data }
    } catch (err: any) {
      return { error: err }
    }
  },

  listSubmissionsForAssignment: async (assignmentId: string) => {
    try {
      const { data } = await apiClient.get(`/api/assignments/${assignmentId}/submissions`)
      return data || []
    } catch (err) {
      console.error('listSubmissionsForAssignment', err)
      return []
    }
  },

  gradeSubmission: async (submissionId: string, payload: { grade: string; feedback: string }) => {
    try {
      const { data } = await apiClient.post(`/api/submissions/${submissionId}/grade`, payload)
      return { data }
    } catch (err: any) {
      return { error: err }
    }
  },
}

