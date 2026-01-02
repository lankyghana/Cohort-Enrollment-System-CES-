import apiClient from './apiClient'

export async function uploadFile(file: File): Promise<{ error?: Error; data?: { url: string; path: string } }> {
  try {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post('/api/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return { data }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err : new Error('Upload failed') }
  }
}

export default { uploadFile }
