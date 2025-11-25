import { uploadFile } from '@/services/uploads'

// Helper to register a Quill image handler that uploads images and inserts the returned URL.
// Usage (example):
// const quill = ...
// registerQuillImageHandler(quill)
export async function registerQuillImageHandler(quill: any) {
  if (!quill) return

  quill.getModule('toolbar').addHandler('image', async () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()
    input.onchange = async () => {
      const file = input.files && input.files[0]
      if (!file) return
      const res = await uploadFile(file)
      if (res.error || !res.data) return
      const range = quill.getSelection(true)
      quill.insertEmbed(range.index, 'image', res.data.url)
      quill.setSelection(range.index + 1)
    }
  })
}

export default registerQuillImageHandler
