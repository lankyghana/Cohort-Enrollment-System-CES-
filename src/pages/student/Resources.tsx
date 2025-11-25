import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/services/apiClient'


type Resource = {
  id: string
  title: string
  description?: string | null
  file_url: string
  file_type: string
}

export const Resources = () => {
  const { id } = useParams<{ id: string }>()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchResources = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get<Resource[]>(`/api/courses/${id}/resources`)
        setResources(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch resources')
        setResources([])
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [id])

  if (loading) {
    return <div>Loading resources...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Resources</h1>
      {resources.length === 0 ? (
        <Card><p className="text-center p-4">No resources available for this course.</p></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {resources.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{r.title}</div>
                  {r.description && <div className="text-text-light text-sm">{r.description}</div>}
                </div>
                <div>
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                    <Button>Download</Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


