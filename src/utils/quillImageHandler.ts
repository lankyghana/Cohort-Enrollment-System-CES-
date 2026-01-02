import { uploadFile } from '@/services/uploads'

type QuillLike = {
  getModule(name: 'toolbar'): { addHandler(name: string, handler: () => void): void }
  getSelection(focus?: boolean): { index: number } | null
  insertEmbed(index: number, type: string, value: string): void
  setSelection(index: number): void
}

// Helper to register a Quill image handler that uploads images and inserts the returned URL.
// Usage (example):
// const quill = ...
// registerQuillImageHandler(quill)
export async function registerQuillImageHandler(quill: unknown) {
  if (!quill) return

  const q = quill as QuillLike

  q.getModule('toolbar').addHandler('image', async () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()
    input.onchange = async () => {
      const file = input.files && input.files[0]
      if (!file) return
      const res = await uploadFile(file)
      if (res.error || !res.data) return
      const range = q.getSelection(true)
      const insertAt = range?.index ?? 0
      q.insertEmbed(insertAt, 'image', res.data.url)
      q.setSelection(insertAt + 1)
    }
  })
}

export default registerQuillImageHandler
