import apiClient from './apiClient'

type ServiceResult<T> = Promise<{ error?: Error; data?: T }>

export const instructorService = {
  getCourses: async (): ServiceResult<any[]> => {
    try {
      const { data } = await apiClient.get('/api/courses')
      return { data }
    } catch (err: any) {
      return { error: err }
    }
  },

  createCourse: async (payload: any): ServiceResult<any> => {
    try {
      const { data } = await apiClient.post('/api/courses', payload)
      return { data }
    } catch (err: any) {
      return { error: err }
    }
  },

  updateCourse: async (id: string, payload: any): ServiceResult<any> => {
    try {
      const { data } = await apiClient.put(`/api/courses/${id}`, payload)
      return { data }
    } catch (err: any) {
      return { error: err }
    }
  },

  deleteCourse: async (id: string): ServiceResult<any> => {
    try {
      const { data } = await apiClient.delete(`/api/courses/${id}`)
      return { data }
    } catch (err: any) {
      return { error: err }
    }
  },

  uploadThumbnail: async (file: File, _tempId = ''): ServiceResult<{ publicUrl: string }> => {
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await apiClient.post('/api/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return { data: { publicUrl: data.url } }
    } catch (err: any) {
      return { error: err }
    }
  },

  upsertCourseDraft: async (payload: any): ServiceResult<any> => {
    try {
      const { data } = await apiClient.post('/api/courses', payload)
      return { data }
    } catch (err: any) {
      return { error: err }
    }
  },
}

